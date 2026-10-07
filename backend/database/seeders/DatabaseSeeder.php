<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->runOnce(GasproNotasSeeder::class);
        $this->runOnce(GoogleIndexedGasproNotasSeeder::class);
        // Catálogo B2U: importación remota completa desde el sitemap oficial.
        // Se ejecuta una sola vez en el flujo general; puede relanzarse manualmente
        // llamando directamente B2UJeanCatalogSeeder si se necesita resincronizar.
        $this->runOnce(B2UJeanCatalogSeeder::class, transactional: false);
        $this->runOnce(AiProviderSeeder::class);
        $this->runOnce(GeminiProviderSeeder::class);
        $this->runOnce(AiModelSeeder::class);
        $this->runOnce(HeroPermissionDefaultsSeeder::class);
        $this->runOnce(B2UHeroContentSeeder::class);

        $email = trim((string) env('ADMIN_EMAIL', ''));
        $password = (string) env('ADMIN_PASSWORD', '');

        if ($email !== '' && $password !== '') {
            // Bootstrap únicamente: un deploy nunca debe cambiar la contraseña
            // de una cuenta existente. La recuperación/cambio de contraseña es
            // responsabilidad exclusiva del flujo de autenticación.
            User::query()->firstOrCreate(
                ['email' => $email],
                [
                    'name' => env('ADMIN_NAME', 'Administrador B2U Jeans'),
                    'password' => Hash::make($password),
                ],
            );
        }

        // Idempotente: mantiene sincronizados roles/permisos y cuentas base.
        $this->call(AccessControlSeeder::class);

        // Idempotente y no destructivo: garantiza únicamente los heroes base que falten.
        $this->call(HeroSlideSeeder::class);
    }

    /**
     * Ejecuta cada seeder de datos una sola vez por base de datos.
     */
    private function runOnce(string $seederClass, bool $transactional = true): void
    {
        if (DB::table('seeder_runs')->where('seeder', $seederClass)->exists()) {
            $this->command?->info("Seeder omitido (ya ejecutado): {$seederClass}");

            return;
        }

        $run = function () use ($seederClass): void {
            $this->call($seederClass);

            DB::table('seeder_runs')->insert([
                'seeder' => $seederClass,
                'executed_at' => now(),
            ]);
        };

        if ($transactional) {
            DB::transaction($run);

            return;
        }

        $run();
    }
}
