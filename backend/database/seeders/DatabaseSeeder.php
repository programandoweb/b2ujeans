<?php

namespace Database\Seeders;

use App\Models\PostCategory;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        PostCategory::query()->updateOrCreate(
            ['slug' => 'gaspro-notas'],
            [
                'name' => 'Gaspro-notas',
                'description' => 'Notas, novedades y contenido editorial de Gaspronal.',
                'is_active' => true,
            ],
        );

        $email = trim((string) env('ADMIN_EMAIL', ''));
        $password = (string) env('ADMIN_PASSWORD', '');

        if ($email === '' || $password === '') {
            return;
        }

        $user = User::query()->updateOrCreate(
            ['email' => $email],
            [
                'name' => env('ADMIN_NAME', 'Administrador Gaspronal'),
                'password' => Hash::make($password),
            ],
        );

        $role = Role::findOrCreate('admin', 'api');
        $user->syncRoles([$role]);
    }
}
