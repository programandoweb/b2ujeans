<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_providers', function (Blueprint $table): void {
            $table->id();
            $table->string('code', 60)->unique();
            $table->string('name', 120);
            $table->string('driver', 40)->default('openai_compatible');
            $table->string('base_url', 500);
            $table->text('credentials')->nullable();
            $table->unsignedSmallInteger('timeout_seconds')->default(30);
            $table->unsignedTinyInteger('max_retries')->default(1);
            $table->boolean('verify_tls')->default(true);
            $table->boolean('allow_private_network')->default(false);
            $table->boolean('is_active')->default(true);
            $table->enum('health_status', ['unknown', 'healthy', 'unhealthy'])->default('unknown');
            $table->timestamp('health_checked_at')->nullable();
            $table->string('health_message', 500)->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
        });

        Schema::create('ai_models', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('ai_provider_id')->constrained('ai_providers')->cascadeOnDelete();
            $table->string('code', 80)->unique();
            $table->string('name', 160);
            $table->string('model_identifier', 200);
            $table->unsignedInteger('priority')->default(100);
            $table->json('capabilities')->nullable();
            $table->json('settings')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['ai_provider_id', 'model_identifier']);
            $table->index(['is_active', 'priority']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_models');
        Schema::dropIfExists('ai_providers');
    }
};
