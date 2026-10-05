<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\SeoRedirect;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SeoRedirectController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        return response()->json(
            SeoRedirect::query()
                ->when($request->filled('search'), function ($query) use ($request): void {
                    $search = '%'.trim((string) $request->string('search')).'%';
                    $query->where(function ($searchQuery) use ($search): void {
                        $searchQuery
                            ->where('source_path', 'like', $search)
                            ->orWhere('target_path', 'like', $search)
                            ->orWhere('reason', 'like', $search);
                    });
                })
                ->latest()
                ->paginate(min(max($request->integer('per_page', 10), 1), 50))
        );
    }

    public function show(SeoRedirect $seoRedirect): JsonResponse
    {
        return response()->json(['data' => $seoRedirect]);
    }

    public function store(Request $request): JsonResponse
    {
        return response()->json(['data' => SeoRedirect::create($this->validated($request))], 201);
    }

    public function update(Request $request, SeoRedirect $seoRedirect): JsonResponse
    {
        $seoRedirect->update($this->validated($request, $seoRedirect));
        return response()->json(['data' => $seoRedirect]);
    }

    public function destroy(SeoRedirect $seoRedirect): JsonResponse
    {
        $seoRedirect->delete();
        return response()->json(['ok' => true]);
    }

    public function resolve(Request $request): JsonResponse
    {
        $path = '/'.ltrim((string) $request->query('path', ''), '/');
        $redirect = SeoRedirect::query()->where('source_path', $path)->where('is_active', true)->first();

        return $redirect
            ? response()->json(['data' => $redirect])
            : response()->json(['data' => null], 404);
    }

    private function validated(Request $request, ?SeoRedirect $redirect = null): array
    {
        return $request->validate([
            'source_path' => ['required', 'string', 'max:500', Rule::unique('seo_redirects', 'source_path')->ignore($redirect?->id)],
            'target_path' => ['required', 'string', 'max:500', 'different:source_path'],
            'status_code' => ['required', Rule::in([301, 302, 307, 308])],
            'is_active' => ['nullable', 'boolean'],
            'reason' => ['nullable', 'string', 'max:255'],
        ]);
    }
}
