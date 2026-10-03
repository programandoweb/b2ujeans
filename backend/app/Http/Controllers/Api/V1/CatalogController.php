<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Catalog\CatalogItemRequest;
use App\Models\CatalogCategory;
use App\Models\CatalogItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class CatalogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        return response()->json(
            CatalogItem::query()
                ->with('category:id,name,slug')
                ->when($request->filled('type'), fn ($query) => $query->where('type', $request->string('type')))
                ->when($request->filled('search'), fn ($query) => $query->where('name', 'like', '%'.$request->string('search').'%'))
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

    private function publication(array $data, ?CatalogItem $item = null): array
    {
        $data['published_at'] = $data['status'] === 'published'
            ? ($data['published_at'] ?? $item?->published_at ?? now())
            : null;

        return $data;
    }
}
