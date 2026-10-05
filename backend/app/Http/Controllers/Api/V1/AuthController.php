<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Services\PasswordResetService;
use App\Services\WhatsAppOtpService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use PHPOpenSourceSaver\JWTAuth\JWTGuard;

class AuthController extends Controller
{
    public function __construct(
        private readonly PasswordResetService $passwordResetService,
        private readonly WhatsAppOtpService $whatsAppOtpService,
    ) {}

    public function login(LoginRequest $request): JsonResponse
    {
        $email = mb_strtolower((string) $request->validated('email'));
        $user = \App\Models\User::query()->where('email', $email)->first();

        if (! $user || blank($user->password)) {
            return response()->json(['message' => 'Credenciales inválidas.'], 401);
        }

        /** @var JWTGuard $guard */
        $guard = auth('api');

        if (! $token = $guard->attempt($request->validated())) {
            return response()->json(['message' => 'Credenciales inválidas.'], 401);
        }

        return $this->tokenResponse($guard, $token);
    }

    public function whatsappStatus(): JsonResponse
    {
        return response()->json(['enabled' => $this->whatsAppOtpService->isAvailable()]);
    }

    public function requestWhatsAppPin(Request $request): JsonResponse
    {
        $data = $request->validate(['whatsapp' => ['required', 'string', 'max:30']]);
        $this->whatsAppOtpService->requestPin($data['whatsapp']);

        return response()->json([
            'success' => true,
            'message' => 'Si el número está registrado, recibirás un código de acceso por WhatsApp.',
        ]);
    }

    public function verifyWhatsAppPin(Request $request): JsonResponse
    {
        $data = $request->validate([
            'whatsapp' => ['required', 'string', 'max:30'],
            'pin' => ['required', 'digits:4'],
        ]);

        $user = $this->whatsAppOtpService->verifyPin($data['whatsapp'], $data['pin']);

        if (! $user) {
            return response()->json([
                'message' => 'El código es inválido, expiró o superó el número máximo de intentos.',
            ], 422);
        }

        /** @var JWTGuard $guard */
        $guard = auth('api');
        $token = $guard->login($user);

        return $this->tokenResponse($guard, $token);
    }

    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $this->passwordResetService->sendResetLink($request->validated('email'));

        return response()->json([
            'success' => true,
            'message' => 'Si el correo está registrado, recibirás instrucciones para restablecer tu contraseña.',
        ]);
    }

    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $data = $request->validated();

        if (! $this->passwordResetService->reset($data['email'], $data['token'], $data['password'])) {
            return response()->json([
                'success' => false,
                'message' => 'El enlace de recuperación no es válido o ha expirado.',
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'Tu contraseña fue actualizada correctamente.',
        ]);
    }

    public function me(): JsonResponse
    {
        $user = auth('api')->user();

        return response()->json([
            'data' => [
                'id' => $user?->id,
                'name' => $user?->name,
                'email' => $user?->email,
                'whatsapp' => $user?->whatsapp,
                'roles' => $user?->getRoleNames()->values() ?? [],
                'permissions' => $user?->getAllPermissions()->pluck('name')->values() ?? [],
            ],
        ]);
    }

    public function refresh(): JsonResponse
    {
        /** @var JWTGuard $guard */
        $guard = auth('api');

        return $this->tokenResponse($guard, $guard->refresh());
    }

    public function logout(): JsonResponse
    {
        auth('api')->logout();

        return response()->json(['message' => 'Sesión cerrada.']);
    }

    private function tokenResponse(JWTGuard $guard, string $token): JsonResponse
    {
        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => $guard->factory()->getTTL() * 60,
        ]);
    }
}
