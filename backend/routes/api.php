<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CatalogController;
use App\Http\Controllers\Api\V1\PostController;
use App\Http\Controllers\Api\V1\SeoRedirectController;
use App\Http\Controllers\Api\V1\DeploymentController;
use App\Http\Controllers\Api\V1\HealthController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::get('health', HealthController::class);
    Route::get('seo/redirects/resolve', [SeoRedirectController::class, 'resolve']);

    Route::prefix('auth')->group(function (): void {
        Route::post('login', [AuthController::class, 'login'])->middleware('throttle:login');
        Route::post('forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:password-reset');
        Route::post('reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:password-reset');

        Route::middleware('auth:api')->group(function (): void {
            Route::get('me', [AuthController::class, 'me']);
            Route::post('refresh', [AuthController::class, 'refresh']);
            Route::post('logout', [AuthController::class, 'logout']);
        });
    });

    Route::middleware(['auth:api', 'role:admin'])->group(function (): void {
        Route::get('deployments', [DeploymentController::class, 'index']);
        Route::post('deployments', [DeploymentController::class, 'store'])->middleware('throttle:2,1');

        Route::get('catalog/items', [CatalogController::class, 'index']);
        Route::post('catalog/items', [CatalogController::class, 'store']);
        Route::put('catalog/items/{catalogItem}', [CatalogController::class, 'update']);
        Route::delete('catalog/items/{catalogItem}', [CatalogController::class, 'destroy']);
        Route::get('catalog/categories', [CatalogController::class, 'categories']);
        Route::post('catalog/categories', [CatalogController::class, 'storeCategory']);
        Route::put('catalog/categories/{catalogCategory}', [CatalogController::class, 'updateCategory']);
        Route::delete('catalog/categories/{catalogCategory}', [CatalogController::class, 'destroyCategory']);

        Route::get('content/posts', [PostController::class, 'index']);
        Route::post('content/posts', [PostController::class, 'store']);
        Route::put('content/posts/{post}', [PostController::class, 'update']);
        Route::delete('content/posts/{post}', [PostController::class, 'destroy']);
        Route::get('content/post-categories', [PostController::class, 'categories']);
        Route::post('content/post-categories', [PostController::class, 'storeCategory']);
        Route::put('content/post-categories/{postCategory}', [PostController::class, 'updateCategory']);

        Route::get('seo/redirects', [SeoRedirectController::class, 'index']);
        Route::post('seo/redirects', [SeoRedirectController::class, 'store']);
        Route::put('seo/redirects/{seoRedirect}', [SeoRedirectController::class, 'update']);
        Route::delete('seo/redirects/{seoRedirect}', [SeoRedirectController::class, 'destroy']);
    });
});
