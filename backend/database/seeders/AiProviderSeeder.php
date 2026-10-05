<?php

namespace Database\Seeders;

use App\Models\AiProvider;
use Illuminate\Database\Seeder;

class AiProviderSeeder extends Seeder
{
    public function run(): void
    {
        AiProvider::query()->updateOrCreate(
            ['code' => 'lm-studio'],
            [
                'name' => 'LM Studio',
                'driver' => 'openai_compatible',
                'base_url' => env('LM_STUDIO_BASE_URL', 'http://10.8.0.2:1234/v1'),
                'credentials' => null,
                'timeout_seconds' => 120,
                'max_retries' => 1,
                'verify_tls' => false,
                'allow_private_network' => true,
                'is_active' => true,
                'metadata' => [
                    'description' => 'Proveedor local compatible con la API de OpenAI.',
                    'source' => 'default',
                ],
            ],
        );
    }
}
