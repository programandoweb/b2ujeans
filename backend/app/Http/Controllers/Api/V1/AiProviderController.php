<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AiModel;
use App\Models\AiProvider;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AiProviderController extends Controller
{
    public function providers(): JsonResponse
    {
        return response()->json([
            'data' => AiProvider::query()
                ->withCount('models')
                ->orderBy('name')
                ->get()
                ->map(fn (AiProvider $provider) => $this->serializeProvider($provider)),
        ]);
    }

    public function storeProvider(Request $request): JsonResponse
    {
        $provider = AiProvider::query()->create($this->providerData($request));
        return response()->json(['data' => $this->serializeProvider($provider->loadCount('models'))], 201);
    }

    public function updateProvider(Request $request, AiProvider $aiProvider): JsonResponse
    {
        $data = $this->providerData($request, $aiProvider);

        if (($data['clear_credentials'] ?? false) === true) {
            $data['credentials'] = null;
        }
        unset($data['clear_credentials']);

        $aiProvider->update($data);

        return response()->json([
            'data' => $this->serializeProvider($aiProvider->fresh()->loadCount('models')),
        ]);
    }

    public function destroyProvider(AiProvider $aiProvider): JsonResponse
    {
        abort_if($aiProvider->models()->exists(), 422, 'El proveedor tiene modelos asociados. Elimina o reasigna los modelos primero.');
        $aiProvider->delete();

        return response()->json(['ok' => true]);
    }

    public function testProvider(AiProvider $aiProvider): JsonResponse
    {
        $result = $this->testConnection($aiProvider);

        $syncedModels = 0;

        if ($result['ok'] && $aiProvider->driver === 'openai_compatible') {
            $syncedModels = $this->syncOpenAiCompatibleModels($aiProvider, $result['models'] ?? []);
        }

        $aiProvider->forceFill([
            'health_status' => $result['ok'] ? 'healthy' : 'unhealthy',
            'health_checked_at' => now(),
            'health_message' => $result['message'],
        ])->save();

        return response()->json([
            'data' => [
                ...$this->serializeProvider($aiProvider->fresh()->loadCount('models')),
                'test' => [
                    ...$result,
                    'synced_models' => $syncedModels,
                ],
            ],
        ]);
    }

    public function agentModels(): JsonResponse
    {
        $providers = AiProvider::query()
            ->where('is_active', true)
            ->where('driver', 'openai_compatible')
            ->get();

        foreach ($providers as $provider) {
            $result = $this->testConnection($provider);

            if (($result['ok'] ?? false) === true) {
                $synced = $this->syncOpenAiCompatibleModels($provider, $result['models'] ?? []);

                if ($synced === 0) {
                    $this->ensureAutomaticModel($provider);
                }

                $provider->forceFill([
                    'health_status' => 'healthy',
                    'health_checked_at' => now(),
                    'health_message' => $result['message'] ?? 'Conexión verificada correctamente.',
                ])->save();
            } else {
                $this->ensureAutomaticModel($provider);

                $provider->forceFill([
                    'health_status' => 'unhealthy',
                    'health_checked_at' => now(),
                    'health_message' => $result['message'] ?? 'No fue posible verificar el proveedor.',
                ])->save();
            }
        }

        $activeProviders = AiProvider::query()
            ->where('is_active', true)
            ->get(['id', 'name', 'code', 'driver', 'is_active'])
            ->keyBy('id');

        $models = AiModel::query()
            ->where('is_active', true)
            ->whereIn('ai_provider_id', $activeProviders->keys())
            ->orderBy('priority')
            ->orderBy('name')
            ->get()
            ->map(fn (AiModel $model) => $this->serializeModel(
                $model,
                $activeProviders->get($model->ai_provider_id),
            ))
            ->values();

        return response()->json(['data' => $models]);
    }

    public function models(): JsonResponse
    {
        $providers = AiProvider::query()
            ->get(['id', 'name', 'code', 'driver', 'is_active'])
            ->keyBy('id');

        $models = AiModel::query()
            ->orderBy('priority')
            ->orderBy('name')
            ->get()
            ->map(fn (AiModel $model) => $this->serializeModel(
                $model,
                $providers->get($model->ai_provider_id),
            ))
            ->values();

        return response()->json(['data' => $models]);
    }

    public function storeModel(Request $request): JsonResponse
    {
        $model = AiModel::query()->create($this->modelData($request));
        return response()->json(['data' => $model->load('provider:id,name,code,driver,is_active')], 201);
    }

    public function updateModel(Request $request, AiModel $aiModel): JsonResponse
    {
        $aiModel->update($this->modelData($request, $aiModel));
        return response()->json(['data' => $aiModel->fresh()->load('provider:id,name,code,driver,is_active')]);
    }

    public function destroyModel(AiModel $aiModel): JsonResponse
    {
        $aiModel->delete();
        return response()->json(['ok' => true]);
    }

    private function providerData(Request $request, ?AiProvider $provider = null): array
    {
        $partial = $provider !== null;
        $required = $partial ? 'sometimes' : 'required';

        $data = $request->validate([
            'code' => [$required, 'string', 'max:60', 'regex:/^[a-z0-9][a-z0-9._-]*$/', Rule::unique('ai_providers', 'code')->ignore($provider?->id)],
            'name' => [$required, 'string', 'max:120'],
            'driver' => [$required, Rule::in(['openai_compatible', 'gemini', 'anthropic'])],
            'base_url' => [$required, 'url:http,https', 'max:500'],
            'api_key' => ['sometimes', 'nullable', 'string', 'max:4096'],
            'clear_credentials' => ['sometimes', 'boolean'],
            'timeout_seconds' => ['sometimes', 'integer', 'min:1', 'max:300'],
            'max_retries' => ['sometimes', 'integer', 'min:0', 'max:5'],
            'verify_tls' => ['sometimes', 'boolean'],
            'allow_private_network' => ['sometimes', 'boolean'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        if (array_key_exists('api_key', $data)) {
            $apiKey = trim((string) $data['api_key']);
            if ($apiKey !== '') {
                $data['credentials'] = ['api_key' => $apiKey];
            }
            unset($data['api_key']);
        }

        return $data;
    }

    private function modelData(Request $request, ?AiModel $model = null): array
    {
        $partial = $model !== null;
        $required = $partial ? 'sometimes' : 'required';

        return $request->validate([
            'ai_provider_id' => [$required, 'integer', 'exists:ai_providers,id'],
            'code' => [$required, 'string', 'max:80', 'regex:/^[a-z0-9][a-z0-9._-]*$/', Rule::unique('ai_models', 'code')->ignore($model?->id)],
            'name' => [$required, 'string', 'max:160'],
            'model_identifier' => [$required, 'string', 'max:200'],
            'priority' => ['sometimes', 'integer', 'min:1', 'max:100000'],
            'capabilities' => ['sometimes', 'array', 'max:50'],
            'capabilities.*' => ['string', 'max:80'],
            'is_active' => ['sometimes', 'boolean'],
        ]);
    }

    private function serializeModel(AiModel $model, ?AiProvider $provider): array
    {
        return [
            'id' => (int) $model->id,
            'ai_provider_id' => (int) $model->ai_provider_id,
            'code' => $model->code,
            'name' => $model->name,
            'model_identifier' => $model->model_identifier,
            'priority' => (int) $model->priority,
            'capabilities' => $model->capabilities ?? [],
            'settings' => $model->settings ?? [],
            'is_active' => (bool) $model->is_active,
            'provider' => $provider ? [
                'id' => (int) $provider->id,
                'name' => $provider->name,
                'code' => $provider->code,
                'driver' => $provider->driver,
                'is_active' => (bool) $provider->is_active,
            ] : null,
        ];
    }

    private function serializeProvider(AiProvider $provider): array
    {
        $credentials = $provider->credentials ?? [];

        return [
            'id' => (int) $provider->id,
            'code' => $provider->code,
            'name' => $provider->name,
            'driver' => $provider->driver,
            'base_url' => $provider->base_url,
            'timeout_seconds' => (int) $provider->timeout_seconds,
            'max_retries' => (int) $provider->max_retries,
            'verify_tls' => (bool) $provider->verify_tls,
            'allow_private_network' => (bool) $provider->allow_private_network,
            'is_active' => (bool) $provider->is_active,
            'health_status' => $provider->health_status,
            'health_checked_at' => $provider->health_checked_at?->toIso8601String(),
            'health_message' => $provider->health_message,
            'has_credentials' => $credentials !== [],
            'credential_keys' => array_keys($credentials),
            'models_count' => isset($provider->models_count) ? (int) $provider->models_count : null,
        ];
    }

    private function ensureAutomaticModel(AiProvider $provider): AiModel
    {
        return AiModel::query()->updateOrCreate(
            [
                'ai_provider_id' => $provider->id,
                'model_identifier' => '__auto__',
            ],
            [
                'code' => $provider->code.'-auto',
                'name' => $provider->name.' · Modelo cargado',
                'priority' => 10,
                'capabilities' => ['text'],
                'settings' => [
                    'source' => 'provider_auto',
                    'resolve_model_at_runtime' => true,
                ],
                'is_active' => true,
            ],
        );
    }

    private function syncOpenAiCompatibleModels(AiProvider $provider, array $identifiers): int
    {
        $count = 0;

        foreach ($identifiers as $identifier) {
            if (! is_string($identifier) || trim($identifier) === '') {
                continue;
            }

            $identifier = trim($identifier);
            $baseCode = Str::slug($provider->code.'-'.$identifier);
            $code = strlen($baseCode) <= 72
                ? $baseCode
                : substr($baseCode, 0, 63).'-'.substr(sha1($identifier), 0, 8);

            $existing = AiModel::query()
                ->where('ai_provider_id', $provider->id)
                ->where('model_identifier', $identifier)
                ->first();

            if ($existing) {
                $existing->update([
                    'name' => $existing->name ?: $identifier,
                    'is_active' => true,
                    'settings' => [
                        ...($existing->settings ?? []),
                        'source' => 'provider_discovery',
                    ],
                ]);
                $count++;
                continue;
            }

            if (AiModel::query()->where('code', $code)->exists()) {
                $code = substr($code, 0, 70).'-'.substr(sha1($provider->id.'|'.$identifier), 0, 8);
            }

            AiModel::query()->create([
                'ai_provider_id' => $provider->id,
                'code' => $code,
                'name' => $identifier,
                'model_identifier' => $identifier,
                'priority' => 100,
                'capabilities' => ['text'],
                'settings' => ['source' => 'provider_discovery'],
                'is_active' => true,
            ]);

            $count++;
        }

        return $count;
    }

    private function testConnection(AiProvider $provider): array
    {
        try {
            $request = Http::acceptJson()
                ->timeout((int) $provider->timeout_seconds)
                ->connectTimeout(min(10, (int) $provider->timeout_seconds))
                ->withOptions(['verify' => (bool) $provider->verify_tls]);

            $apiKey = $provider->credentials['api_key'] ?? null;
            $url = rtrim($provider->base_url, '/');

            $response = match ($provider->driver) {
                'openai_compatible' => (is_string($apiKey) && $apiKey !== ''
                    ? $request->withToken($apiKey)
                    : $request)->get($url.'/models'),
                'gemini' => (is_string($apiKey) && $apiKey !== ''
                    ? $request->withHeaders(['x-goog-api-key' => $apiKey])
                    : $request)->get($url.'/models'),
                'anthropic' => (is_string($apiKey) && $apiKey !== ''
                    ? $request->withHeaders(['x-api-key' => $apiKey, 'anthropic-version' => '2023-06-01'])
                    : $request->withHeaders(['anthropic-version' => '2023-06-01']))->get($url.'/models'),
                default => throw ValidationException::withMessages(['driver' => ['Driver no soportado.']]),
            };

            if (! $response->successful()) {
                return [
                    'ok' => false,
                    'message' => 'El proveedor respondió con HTTP '.$response->status().'.',
                    'http_status' => $response->status(),
                ];
            }

            $models = [];

            if ($provider->driver === 'openai_compatible') {
                $payload = $response->json();
                $candidates = [];

                if (is_array($payload) && array_is_list($payload)) {
                    $candidates = $payload;
                } elseif (is_array($payload)) {
                    $candidates = is_array($payload['data'] ?? null)
                        ? $payload['data']
                        : (is_array($payload['models'] ?? null) ? $payload['models'] : []);
                }

                $models = collect($candidates)
                    ->map(function ($item): string {
                        if (is_string($item)) {
                            return trim($item);
                        }

                        if (! is_array($item)) {
                            return '';
                        }

                        $identifier = $item['id'] ?? $item['model'] ?? $item['name'] ?? '';

                        return is_string($identifier) ? trim($identifier) : '';
                    })
                    ->filter()
                    ->unique()
                    ->values()
                    ->all();
            }

            return [
                'ok' => true,
                'message' => $provider->driver === 'openai_compatible' && count($models) > 0
                    ? 'Conexión verificada. '.count($models).' modelo(s) detectado(s).'
                    : 'Conexión verificada correctamente.',
                'http_status' => $response->status(),
                'models' => $models,
            ];
        } catch (\Throwable $e) {
            return [
                'ok' => false,
                'message' => mb_substr($e->getMessage(), 0, 300),
                'http_status' => null,
            ];
        }
    }
}
