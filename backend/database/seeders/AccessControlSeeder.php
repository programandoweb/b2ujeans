<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class AccessControlSeeder extends Seeder
{
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $permissions = [
            'dashboard.view',
            'catalog.view', 'catalog.manage',
            'content.view', 'content.manage',
            'agents.view', 'agents.manage',
            'ai.view', 'ai.manage',
            'channels.view', 'channels.manage',
            'commercial.quotes.view', 'commercial.quotes.manage',
            'commercial.appointments.view', 'commercial.appointments.manage',
            'seo.view', 'seo.manage',
            'deployments.view', 'deployments.manage',
            'security.users.view', 'security.users.manage',
            'security.roles.view', 'security.roles.manage',
        ];

        foreach ($permissions as $name) {
            Permission::findOrCreate($name, 'api');
        }

        $root = Role::findOrCreate('root', 'api');
        $admin = Role::findOrCreate('admin', 'api');

        $root->syncPermissions(Permission::where('guard_name', 'api')->get());
        $admin->syncPermissions(Permission::where('guard_name', 'api')
            ->whereNotIn('name', [
                'security.users.manage',
                'security.roles.manage',
            ])->get());

        $rootUser = User::query()->where('email', 'lic.jorgemendez@gmail.com')->first();
        if ($rootUser) {
            $rootUser->syncRoles([$root]);
        }

        foreach ([
            ['name' => 'Claudio Gallego Ruiz', 'email' => 'cgallegoruiz2000@gmail.com'],
            ['name' => 'Cristina', 'email' => 'servicioalcliente@gaspronal.com'],
        ] as $account) {
            $user = User::query()->firstOrCreate(
                ['email' => $account['email']],
                [
                    'name' => $account['name'],
                    'password' => Hash::make(Str::password(48)),
                ],
            );

            $user->syncRoles([$admin]);
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}
