<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\PasswordResetService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Throwable;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class UserAccessController extends Controller
{
    public function users(Request $request): JsonResponse
    {
        return response()->json([
            'data' => User::query()
                ->with(['roles:id,name', 'permissions:id,name'])
                ->orderBy('name')
                ->get()
                ->map(fn (User $user) => $this->userPayload($user, (bool) $request->user()?->hasRole('root'))),
        ]);
    }

    public function storeUser(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'whatsapp' => ['nullable', 'string', 'max:20', 'regex:/^\\+[1-9]\\d{7,14}$/', 'unique:users,whatsapp'],
            'password' => ['nullable', Password::defaults()],
            'roles' => ['array'],
            'roles.*' => ['string', Rule::exists('roles', 'name')->where('guard_name', 'api')],
            'permissions' => ['array'],
            'permissions.*' => ['string', Rule::exists('permissions', 'name')->where('guard_name', 'api')],
        ]);

        abort_if(in_array('root', $data['roles'] ?? [], true), 422, 'El rol root no se puede asignar manualmente.');

        $user = User::query()->create([
            'name' => $data['name'],
            'email' => mb_strtolower($data['email']),
            'whatsapp' => $data['whatsapp'] ?? null,
            'password' => Hash::make($data['password'] ?? str()->password(40)),
        ]);

        $user->syncRoles($data['roles'] ?? []);
        $user->syncPermissions($data['permissions'] ?? []);

        return response()->json(['data' => $this->userPayload($user->load(['roles', 'permissions']))], 201);
    }

    public function updateUser(Request $request, User $user): JsonResponse
    {
        $this->assertRootIsNotBeingDemoted($request, $user);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'whatsapp' => ['nullable', 'string', 'max:20', 'regex:/^\\+[1-9]\\d{7,14}$/', Rule::unique('users', 'whatsapp')->ignore($user->id)],
            'password' => ['nullable', Password::defaults()],
            'roles' => ['array'],
            'roles.*' => ['string', Rule::exists('roles', 'name')->where('guard_name', 'api')],
            'permissions' => ['array'],
            'permissions.*' => ['string', Rule::exists('permissions', 'name')->where('guard_name', 'api')],
        ]);

        if (! $user->hasRole('root')) {
            abort_if(in_array('root', $data['roles'] ?? [], true), 422, 'El rol root no se puede asignar manualmente.');
        }

        $user->fill([
            'name' => $data['name'],
            'email' => $user->hasRole('root') ? 'lic.jorgemendez@gmail.com' : mb_strtolower($data['email']),
            'whatsapp' => $data['whatsapp'] ?? null,
        ]);
        if (! empty($data['password'])) {
            $user->password = $data['password'];
        }
        $user->save();
        $user->syncRoles($data['roles'] ?? []);
        $user->syncPermissions($data['permissions'] ?? []);

        return response()->json(['data' => $this->userPayload($user->load(['roles', 'permissions']))]);
    }

    public function inviteUser(User $user, PasswordResetService $passwordResetService): JsonResponse
    {
        try {
            $passwordResetService->sendInvitation($user);
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'message' => 'No fue posible enviar la invitación. Verifica la configuración de correo e inténtalo nuevamente.',
            ], 503);
        }

        return response()->json([
            'message' => "Invitación enviada correctamente a {$user->email}.",
        ]);
    }

    public function impersonateUser(Request $request, User $user): JsonResponse
    {
        $actor = $request->user();

        abort_unless($actor?->hasRole('root'), 403, 'Solo un usuario root puede iniciar sesión como otro usuario.');
        abort_if($actor->is($user), 422, 'No puedes iniciar una suplantación sobre tu propia cuenta.');
        abort_if($user->hasRole('root'), 422, 'No se puede iniciar sesión como otro usuario root.');

        $guard = auth('api');
        $token = $guard->login($user);

        Log::notice('Root user impersonation started.', [
            'actor_user_id' => $actor->id,
            'target_user_id' => $user->id,
        ]);

        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => $guard->factory()->getTTL() * 60,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
        ]);
    }

    public function destroyUser(Request $request, User $user): JsonResponse
    {
        abort_if($request->user()->is($user), 422, 'No puedes eliminar tu propio usuario.');
        abort_if($user->hasRole('root'), 422, 'El usuario root no se puede eliminar.');

        $user->delete();

        return response()->json(['message' => 'Usuario eliminado.']);
    }

    public function roles(): JsonResponse
    {
        return response()->json([
            'data' => Role::query()
                ->with('permissions:id,name')
                ->where('guard_name', 'api')
                ->orderBy('name')
                ->get()
                ->map(fn (Role $role) => [
                    'id' => $role->id,
                    'name' => $role->name,
                    'permissions' => $role->permissions->pluck('name')->values(),
                    'protected' => $role->name === 'root',
                ]),
        ]);
    }

    public function storeRole(Request $request): JsonResponse
    {
        $data = $this->validateRole($request);
        $role = Role::create(['name' => $data['name'], 'guard_name' => 'api']);
        $role->syncPermissions($data['permissions'] ?? []);

        return response()->json(['data' => $role->load('permissions')], 201);
    }

    public function updateRole(Request $request, Role $role): JsonResponse
    {
        abort_if($role->name === 'root', 422, 'El rol root está protegido.');

        $data = $this->validateRole($request, $role);
        if ($role->name === 'admin') {
            abort_unless($data['name'] === 'admin', 422, 'El nombre del rol admin está protegido.');
        }
        $role->name = $data['name'];
        $role->save();
        $role->syncPermissions($data['permissions'] ?? []);

        return response()->json(['data' => $role->load('permissions')]);
    }

    public function destroyRole(Role $role): JsonResponse
    {
        abort_if(in_array($role->name, ['root', 'admin'], true), 422, 'Este rol está protegido.');
        abort_if(DB::table('model_has_roles')->where('role_id', $role->id)->exists(), 422, 'No puedes eliminar un rol asignado a usuarios.');

        $role->delete();

        return response()->json(['message' => 'Rol eliminado.']);
    }

    public function permissions(): JsonResponse
    {
        return response()->json([
            'data' => Permission::query()
                ->where('guard_name', 'api')
                ->orderBy('name')
                ->pluck('name')
                ->values(),
        ]);
    }

    private function userPayload(User $user, bool $requesterIsRoot = false): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'whatsapp' => $user->whatsapp,
            'data_processing_consent_at' => $user->data_processing_consent_at?->toIso8601String(),
            'data_processing_consent_source' => $user->data_processing_consent_source,
            'data_processing_policy_version' => $user->data_processing_policy_version,
            'roles' => $user->roles->pluck('name')->values(),
            'permissions' => $user->permissions->pluck('name')->values(),
            'effective_permissions' => $user->getAllPermissions()->pluck('name')->sort()->values(),
            'protected' => $user->hasRole('root'),
            'can_impersonate' => $requesterIsRoot && ! $user->hasRole('root'),
        ];
    }

    private function validateRole(Request $request, ?Role $role = null): array
    {
        return $request->validate([
            'name' => [
                'required', 'string', 'max:80', 'alpha_dash:ascii',
                Rule::unique('roles', 'name')->where('guard_name', 'api')->ignore($role?->id),
            ],
            'permissions' => ['array'],
            'permissions.*' => ['string', Rule::exists('permissions', 'name')->where('guard_name', 'api')],
        ]);
    }

    private function assertRootIsNotBeingDemoted(Request $request, User $user): void
    {
        if (! $user->hasRole('root')) {
            return;
        }

        abort_unless(in_array('root', $request->input('roles', []), true), 422, 'El usuario root debe conservar su rol root.');
    }
}
