<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Content\PostRequest;
use App\Models\Post;
use App\Models\PostCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class PostController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        return response()->json(
            Post::query()
                ->with('category:id,name,slug')
                ->when($request->filled('search'), function ($query) use ($request): void {
                    $search = trim((string) $request->string('search'));
                    $like = '%'.$search.'%';

                    $query->where(function ($searchQuery) use ($like): void {
                        $searchQuery
                            ->where('title', 'like', $like)
                            ->orWhere('slug', 'like', $like)
                            ->orWhere('excerpt', 'like', $like)
                            ->orWhere('content', 'like', $like)
                            ->orWhereHas('category', fn ($categoryQuery) => $categoryQuery
                                ->where('name', 'like', $like)
                                ->orWhere('slug', 'like', $like));
                    });
                })
                ->latest()
                ->paginate(min(max($request->integer('per_page', 25), 1), 100))
        );
    }

    public function show(Post $post): JsonResponse
    {
        return response()->json(['data' => $post->load('category:id,name,slug')]);
    }

    public function store(PostRequest $request): JsonResponse
    {
        $data = $this->publication($request->validated());
        return response()->json(['data' => Post::create($data)->load('category:id,name,slug')], 201);
    }

    public function update(PostRequest $request, Post $post): JsonResponse
    {
        $post->update($this->publication($request->validated(), $post));
        return response()->json(['data' => $post->fresh()->load('category:id,name,slug')]);
    }

    public function destroy(Post $post): JsonResponse
    {
        $post->delete();
        return response()->json(['ok' => true]);
    }

    public function categories(): JsonResponse
    {
        return response()->json(['data' => PostCategory::query()->withCount('posts')->orderBy('name')->get()]);
    }

    public function storeCategory(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'slug' => ['nullable', 'string', 'max:170', 'unique:post_categories,slug'],
            'description' => ['nullable', 'string'],
            'is_active' => ['nullable', 'boolean'],
        ]);
        $data['slug'] = $data['slug'] ?? Str::slug($data['name']);
        return response()->json(['data' => PostCategory::create($data)], 201);
    }

    public function updateCategory(Request $request, PostCategory $postCategory): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'slug' => ['required', 'string', 'max:170', Rule::unique('post_categories', 'slug')->ignore($postCategory->id)],
            'description' => ['nullable', 'string'],
            'is_active' => ['nullable', 'boolean'],
        ]);
        $postCategory->update($data);
        return response()->json(['data' => $postCategory]);
    }

    private function publication(array $data, ?Post $post = null): array
    {
        $data['published_at'] = $data['status'] === 'published'
            ? ($data['published_at'] ?? $post?->published_at ?? now())
            : null;

        return $data;
    }
}
