<?php

namespace Database\Seeders;

use App\Models\AiProvider;
use Illuminate\Database\Seeder;

class GeminiProviderSeeder extends Seeder
{
    public function run(): void
    {
        AiProvider::query()->updateOrCreate(
            ['code' => 'gemini'],
            [
                'name' => 'Google Gemini',
                'driver' => 'gemini',
                'base_url' => 'https://generativelanguage.googleapis.com/v1beta',
                'credentials' => [
                    'api_key' => 'REEMPLAZAR_CON_TU_GEMINI_API_KEY',
                ],
                'timeout_seconds' => 60,
                'max_retries' => 1,
                'verify_tls' => true,
                'allow_private_network' => false,
                'is_active' => true,
                'metadata' => [
                    'description' => 'Proveedor Google Gemini.',
                    'source' => 'default',
                ],
            ],
        );
    }
}
