<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
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

        $admin->revokePermissionTo(['heroes.view', 'heroes.manage']);
    }
}
