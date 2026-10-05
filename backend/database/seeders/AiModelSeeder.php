<?php

namespace Database\Seeders;

use App\Models\AiModel;
use App\Models\AiProvider;
use Illuminate\Database\Seeder;

class AiModelSeeder extends Seeder
{
    public function run(): void
    {
        $gemini = AiProvider::query()->where('code', 'gemini')->first();

        if ($gemini) {
            AiModel::query()->updateOrCreate(
                ['code' => 'gemini-2.5-flash'],
                [
                    'ai_provider_id' => $gemini->id,
                    'name' => 'Gemini 2.5 Flash',
                    'model_identifier' => 'gemini-2.5-flash',
                    'priority' => 100,
                    'capabilities' => ['text', 'json'],
                    'settings' => [],
                    'is_active' => true,
                ],
            );
        }
    }
}
