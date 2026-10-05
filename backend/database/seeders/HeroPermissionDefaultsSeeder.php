<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class HeroPermissionDefaultsSeeder extends Seeder
{
    public function run(): void
    {
        $admin = Role::query()
            ->where('guard_name', 'api')
            ->where('name', 'admin')
            ->first();

        if (! $admin) {
            return;
        }

        foreach (['heroes.view', 'heroes.manage'] as $name) {
            $permission = Permission::query()
                ->where('guard_name', 'api')
                ->where('name', $name)
                ->first();

            if ($permission && $admin->hasPermissionTo($permission)) {
                $admin->revokePermissionTo($permission);
            }
        }
    }
}
