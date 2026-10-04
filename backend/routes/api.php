<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\AgentSettingController;
use App\Http\Controllers\Api\V1\CatalogController;
use App\Http\Controllers\Api\V1\PostController;
use App\Http\Controllers\Api\V1\SeoRedirectController;
use App\Http\Controllers\Api\V1\DeploymentController;
use App\Http\Controllers\Api\V1\HealthController;
use App\Http\Controllers\Api\V1\InternalAgentCommercialController;
use App\Http\Controllers\Api\V1\CommercialQuoteController;
use App\Http\Controllers\Api\V1\CommercialAppointmentController;
use App\Http\Controllers\Api\V1\JorgeResearchController;
use App\Http\Controllers\Api\V1\CommunicationProviderController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::get('health', HealthController::class);
    Route::get('seo/redirects/resolve', [SeoRedirectController::class, 'resolve']);
    Route::get('internal/agents/{agent}/credentials', [AgentSettingController::class, 'internalCredentials']);
    Route::post('internal/agents/{agent}/commercial-tools', [InternalAgentCommercialController::class, 'execute']);
    Route::get('internal/communications/providers', [CommunicationProviderController::class, 'internalList']);
    Route::post('internal/communications/outbound-log', [CommunicationProviderController::class, 'internalLog']);

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
        Route::get('agents/{agent}/settings', [AgentSettingController::class, 'show']);
        Route::put('agents/{agent}/settings', [AgentSettingController::class, 'update']);
        Route::post('deployments', [DeploymentController::class, 'store'])->middleware('throttle:2,1');

        Route::get('communications/providers', [CommunicationProviderController::class, 'index']);
        Route::post('communications/providers', [CommunicationProviderController::class, 'store']);
        Route::put('communications/providers/{communicationProvider}', [CommunicationProviderController::class, 'update']);
        Route::delete('communications/providers/{communicationProvider}', [CommunicationProviderController::class, 'destroy']);

        Route::get('commercial/quotes', [CommercialQuoteController::class, 'index']);
        Route::get('commercial/quotes/{commercialQuote}', [CommercialQuoteController::class, 'show']);
        Route::put('commercial/quotes/{commercialQuote}', [CommercialQuoteController::class, 'update']);
        Route::post('commercial/quotes/{commercialQuote}/approve', [CommercialQuoteController::class, 'approve']);
        Route::get('commercial/appointments', [CommercialAppointmentController::class, 'index']);

        Route::get('agents/jorge/research', [JorgeResearchController::class, 'show']);
        Route::post('agents/jorge/research/play', [JorgeResearchController::class, 'play']);
        Route::post('agents/jorge/research/pause', [JorgeResearchController::class, 'pause']);
        Route::post('agents/jorge/research/stop', [JorgeResearchController::class, 'stop']);

        Route::get('catalog/items', [CatalogController::class, 'index']);
        Route::get('catalog/items/{catalogItem}', [CatalogController::class, 'show']);
        Route::post('catalog/items', [CatalogController::class, 'store']);
        Route::put('catalog/items/{catalogItem}', [CatalogController::class, 'update']);
        Route::delete('catalog/items/{catalogItem}', [CatalogController::class, 'destroy']);
        Route::get('catalog/categories', [CatalogController::class, 'categories']);
        Route::post('catalog/categories', [CatalogController::class, 'storeCategory']);
        Route::put('catalog/categories/{catalogCategory}', [CatalogController::class, 'updateCategory']);
        Route::delete('catalog/categories/{catalogCategory}', [CatalogController::class, 'destroyCategory']);

        Route::get('content/posts', [PostController::class, 'index']);
        Route::get('content/posts/{post}', [PostController::class, 'show']);
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
