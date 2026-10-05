<?php

namespace App\Http\Controllers\Api\V1\Autodeploy;

use App\Http\Controllers\Controller;
use App\Models\Deployment;
use App\Services\DeploymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class AutoDeployController extends Controller
{
    public function store(Request $request, DeploymentService $service): JsonResponse
    {
        if ($unauthorized = $this->authorizeRequest($request)) {
            return $unauthorized;
        }

        $configuration = $service->publicConfiguration();

        if (! $configuration['enabled']) {
            return response()->json(['message' => 'El servicio de despliegue está deshabilitado.'], Response::HTTP_SERVICE_UNAVAILABLE);
        }

        if (! $configuration['ready']) {
            return response()->json(['message' => 'El script de despliegue no está disponible.'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        if (Deployment::query()->whereIn('status', ['queued', 'running'])->exists()) {
            return response()->json(['message' => 'Ya existe un despliegue en ejecución.'], Response::HTTP_CONFLICT);
        }

        $deployment = Deployment::query()->create([
            'status' => 'queued',
            'requested_by' => null,
            'initialize_private_repo' => false,
        ]);

        try {
            $service->launch($deployment);
        } catch (Throwable $exception) {
            report($exception);

            $deployment->update([
                'status' => 'failed',
                'finished_at' => now(),
                'failure_message' => 'No fue posible iniciar el autodespliegue.',
            ]);

            return response()->json(['message' => 'No fue posible iniciar el autodespliegue.'], Response::HTTP_SERVICE_UNAVAILABLE);
        }

        return response()->json([
            'success' => true,
            'deployment_id' => $deployment->id,
            'status' => $deployment->status,
        ], Response::HTTP_ACCEPTED);
    }

    public function show(Request $request, Deployment $deployment): JsonResponse
    {
        if ($unauthorized = $this->authorizeRequest($request)) {
            return $unauthorized;
        }

        return response()->json([
            'data' => [
                'id' => $deployment->id,
                'status' => $deployment->status,
                'started_at' => $deployment->started_at,
                'finished_at' => $deployment->finished_at,
                'exit_code' => $deployment->exit_code,
                'failure_message' => $deployment->failure_message,
                'output' => $deployment->output,
            ],
        ]);
    }

    private function authorizeRequest(Request $request): ?JsonResponse
    {
        if (! (bool) config('autodeploy.enabled', false)) {
            return response()->json(['message' => 'Autodeploy deshabilitado.'], Response::HTTP_SERVICE_UNAVAILABLE);
        }

        $configuredToken = trim((string) config('autodeploy.token', ''));
        $providedToken = trim((string) $request->bearerToken());

        if ($configuredToken === '' || $providedToken === '' || ! hash_equals($configuredToken, $providedToken)) {
            return response()->json(['message' => 'No autorizado.'], Response::HTTP_UNAUTHORIZED);
        }

        return null;
    }
}
