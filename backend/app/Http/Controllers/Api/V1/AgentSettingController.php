<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AgentSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AgentSettingController extends Controller
{
    private const AGENTS = ['cristina', 'jorge', 'claudio'];

    public function show(string $agent): JsonResponse
    {
        $agent = $this->agent($agent);
        $setting = AgentSetting::query()->where('agent_id', $agent)->first();

        return response()->json([
            'data' => [
                'agent_id' => $agent,
                'provider' => $setting?->provider ?? 'gemini',
                'model' => $setting?->model ?? 'gemini-2.5-flash',
                'has_api_key' => filled($setting?->api_key),
            ],
        ]);
    }

    public function update(Request $request, string $agent): JsonResponse
    {
        $agent = $this->agent($agent);

        $data = $request->validate([
            'provider' => ['sometimes', Rule::in(['gemini'])],
            'model' => ['sometimes', 'string', 'max:120'],
            'api_key' => ['sometimes', 'nullable', 'string', 'max:500'],
        ]);

        $setting = AgentSetting::query()->firstOrNew(['agent_id' => $agent]);
        $setting->provider = $data['provider'] ?? $setting->provider ?? 'gemini';
        $setting->model = $data['model'] ?? $setting->model ?? 'gemini-2.5-flash';

        if (array_key_exists('api_key', $data)) {
            $setting->api_key = filled($data['api_key']) ? trim((string) $data['api_key']) : null;
        }

        $setting->save();

        return $this->show($agent);
    }

    public function internalCredentials(Request $request, string $agent): JsonResponse
    {
        $secret = trim((string) config('agents.shared_secret'));

        abort_if(
            $secret === '' || ! hash_equals($secret, (string) $request->header('X-Agent-Shared-Secret', '')),
            401,
            'No autorizado.'
        );

        $agent = $this->agent($agent);
        $setting = AgentSetting::query()->where('agent_id', $agent)->first();

        return response()->json([
            'data' => [
                'agent_id' => $agent,
                'provider' => $setting?->provider ?? 'gemini',
                'model' => $setting?->model ?? 'gemini-2.5-flash',
                'api_key' => $setting?->api_key,
            ],
        ]);
    }

    private function agent(string $agent): string
    {
        $agent = strtolower(trim($agent));
        abort_unless(in_array($agent, self::AGENTS, true), 404, 'Agente no encontrado.');

        return $agent;
    }
}
