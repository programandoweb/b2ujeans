<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('agent_settings', function (Blueprint $table): void {
            $table->foreignId('primary_ai_model_id')
                ->nullable()
                ->after('model')
                ->constrained('ai_models')
                ->nullOnDelete();

            $table->foreignId('fallback_ai_model_id')
                ->nullable()
                ->after('primary_ai_model_id')
                ->constrained('ai_models')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('agent_settings', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('fallback_ai_model_id');
            $table->dropConstrainedForeignId('primary_ai_model_id');
        });
    }
};
