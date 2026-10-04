<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Catalog\CatalogItemRequest;
use App\Models\CatalogCategory;
use App\Models\CatalogItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CatalogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        return response()->json(
            CatalogItem::query()
                ->with('category:id,name,slug')
                ->when($request->filled('type'), fn ($query) => $query->where('type', $request->string('type')))
                ->when($request->filled('search'), function ($query) use ($request): void {
                    $search = trim((string) $request->string('search'));
                    $like = '%'.$search.'%';
                    $normalized = Str::lower(Str::ascii($search));

                    $query->where(function ($searchQuery) use ($like, $normalized): void {
                        $searchQuery
                            ->where('name', 'like', $like)
                            ->orWhere('reference', 'like', $like)
                            ->orWhere('slug', 'like', $like)
                            ->orWhereHas('category', fn ($categoryQuery) => $categoryQuery
                                ->where('name', 'like', $like)
                                ->orWhere('slug', 'like', $like));

                        if (str_contains('producto', $normalized) || str_contains($normalized, 'producto')) {
                            $searchQuery->orWhere('type', 'product');
                        }

                        if (str_contains('servicio', $normalized) || str_contains($normalized, 'servicio')) {
                            $searchQuery->orWhere('type', 'service');
                        }
                    });
                })
                ->latest()
                ->paginate(min(max($request->integer('per_page', 25), 1), 100))
        );
    }

    public function show(CatalogItem $catalogItem): JsonResponse
    {
        return response()->json(['data' => $catalogItem->load('category:id,name,slug')]);
    }

    public function store(CatalogItemRequest $request): JsonResponse
    {
        $data = $this->publication($request->validated());
        return response()->json(['data' => CatalogItem::create($data)->load('category:id,name,slug')], 201);
    }

    public function update(CatalogItemRequest $request, CatalogItem $catalogItem): JsonResponse
    {
        $catalogItem->update($this->publication($request->validated(), $catalogItem));
        return response()->json(['data' => $catalogItem->fresh()->load('category:id,name,slug')]);
    }

    public function destroy(CatalogItem $catalogItem): JsonResponse
    {
        $catalogItem->delete();
        return response()->json(['ok' => true]);
    }

    public function uploadGallery(Request $request, CatalogItem $catalogItem): JsonResponse
    {
        $validated = $request->validate([
            'images' => ['required', 'array', 'min:1', 'max:12'],
            'images.*' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:8192'],
        ]);

        $gallery = $this->normalizedGallery($catalogItem);

        foreach ($validated['images'] as $image) {
            $extension = strtolower($image->getClientOriginalExtension() ?: $image->extension() ?: 'jpg');
            $filename = Str::uuid().'.'.$extension;
            $image->storeAs("catalog/{$catalogItem->id}", $filename, 'public');
            $gallery[] = "/api/catalog-media/{$catalogItem->id}/{$filename}";
        }

        $catalogItem->gallery = array_values(array_unique($gallery));

        if (!$catalogItem->og_image && count($catalogItem->gallery) > 0) {
            $catalogItem->og_image = $catalogItem->gallery[0];
        }

        $catalogItem->save();

        return response()->json([
            'data' => [
                'gallery' => $catalogItem->gallery,
                'og_image' => $catalogItem->og_image,
            ],
        ]);
    }

    public function setPrimaryGalleryImage(Request $request, CatalogItem $catalogItem): JsonResponse
    {
        $validated = $request->validate([
            'image' => ['required', 'string', 'max:2048'],
        ]);

        $gallery = $this->normalizedGallery($catalogItem);

        abort_unless(in_array($validated['image'], $gallery, true), 422, 'La imagen no pertenece a la galería.');

        $catalogItem->update(['og_image' => $validated['image']]);

        return response()->json([
            'data' => [
                'gallery' => $gallery,
                'og_image' => $validated['image'],
            ],
        ]);
    }

    public function destroyGalleryImage(Request $request, CatalogItem $catalogItem): JsonResponse
    {
        $validated = $request->validate([
            'image' => ['required', 'string', 'max:2048'],
        ]);

        $gallery = collect($this->normalizedGallery($catalogItem));

        abort_unless($gallery->contains($validated['image']), 422, 'La imagen no pertenece a la galería.');

        $prefix = "/api/catalog-media/{$catalogItem->id}/";
        if (str_starts_with($validated['image'], $prefix)) {
            $filename = basename(substr($validated['image'], strlen($prefix)));
            Storage::disk('public')->delete("catalog/{$catalogItem->id}/{$filename}");
        }

        $gallery = $gallery
            ->reject(fn ($image) => $image === $validated['image'])
            ->values()
            ->all();

        $catalogItem->gallery = $gallery;
        if ($catalogItem->og_image === $validated['image']) {
            $catalogItem->og_image = $gallery[0] ?? null;
        }
        $catalogItem->save();

        return response()->json([
            'data' => [
                'gallery' => $catalogItem->gallery,
                'og_image' => $catalogItem->og_image,
            ],
        ]);
    }

    public function media(CatalogItem $catalogItem, string $filename): StreamedResponse
    {
        $filename = basename($filename);
        $path = "catalog/{$catalogItem->id}/{$filename}";

        abort_unless(Storage::disk('public')->exists($path), 404);

        return Storage::disk('public')->response(
            $path,
            $filename,
            [
                'Cache-Control' => 'public, max-age=31536000, immutable',
                'X-Content-Type-Options' => 'nosniff',
            ]
        );
    }

    public function categories(): JsonResponse
    {
        return response()->json(['data' => CatalogCategory::query()->withCount('items')->orderBy('name')->get()]);
    }

    public function storeCategory(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'slug' => ['nullable', 'string', 'max:170', 'unique:catalog_categories,slug'],
            'description' => ['nullable', 'string'],
            'is_active' => ['nullable', 'boolean'],
        ]);
        $data['slug'] = $data['slug'] ?? Str::slug($data['name']);
        return response()->json(['data' => CatalogCategory::create($data)], 201);
    }

    public function updateCategory(Request $request, CatalogCategory $catalogCategory): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'slug' => ['required', 'string', 'max:170', Rule::unique('catalog_categories', 'slug')->ignore($catalogCategory->id)],
            'description' => ['nullable', 'string'],
            'is_active' => ['nullable', 'boolean'],
        ]);
        $catalogCategory->update($data);
        return response()->json(['data' => $catalogCategory]);
    }

    public function destroyCategory(CatalogCategory $catalogCategory): JsonResponse
    {
        abort_if($catalogCategory->items()->exists(), 422, 'La categoría tiene productos o servicios asociados.');
        $catalogCategory->delete();
        return response()->json(['ok' => true]);
    }


    private function normalizedGallery(CatalogItem $catalogItem): array
    {
        return collect([
            $catalogItem->og_image,
            ...($catalogItem->gallery ?? []),
        ])
            ->filter(fn ($image) => is_string($image) && trim($image) !== '')
            ->unique()
            ->values()
            ->all();
    }

    private function publication(array $data, ?CatalogItem $item = null): array
    {
        $data['published_at'] = $data['status'] === 'published'
            ? ($data['published_at'] ?? $item?->published_at ?? now())
            : null;

        return $data;
    }
}
