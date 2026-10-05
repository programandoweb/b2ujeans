<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('ai_providers')) {
            return;
        }

        DB::table('ai_providers')
            ->where('code', 'lm-studio')
            ->update([
                'name' => 'LM Studio',
                'driver' => 'openai_compatible',
                'base_url' => 'http://10.8.0.2:1234/v1',
                'credentials' => null,
                'timeout_seconds' => 120,
                'max_retries' => 1,
                'verify_tls' => false,
                'allow_private_network' => true,
                'is_active' => true,
                'health_status' => 'unknown',
                'health_checked_at' => null,
                'health_message' => null,
                'updated_at' => now(),
            ]);
    }

    public function down(): void
    {
        if (! Schema::hasTable('ai_providers')) {
            return;
        }

        DB::table('ai_providers')
            ->where('code', 'lm-studio')
            ->update([
                'base_url' => 'http://host.docker.internal:1234/v1',
                'credentials' => null,
                'timeout_seconds' => 120,
                'max_retries' => 1,
                'verify_tls' => false,
                'allow_private_network' => true,
                'is_active' => true,
                'health_status' => 'unknown',
                'health_checked_at' => null,
                'health_message' => null,
                'updated_at' => now(),
            ]);
    }
};
