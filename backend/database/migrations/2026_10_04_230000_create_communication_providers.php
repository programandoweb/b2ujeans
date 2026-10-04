<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('communication_providers', function (Blueprint $table): void {
            $table->id();
            $table->string('name', 150);
            $table->enum('channel', ['whatsapp', 'email'])->index();
            $table->enum('driver', ['baileys', 'smtp']);
            $table->boolean('is_fallback')->default(false)->index();
            $table->unsignedInteger('priority')->default(100)->index();
            $table->boolean('auto_connect')->default(true);
            $table->boolean('enabled')->default(true)->index();
            $table->json('settings')->nullable();
            $table->longText('credentials')->nullable();
            $table->timestamps();

            $table->index(['channel', 'enabled', 'is_fallback', 'priority'], 'communication_provider_route_idx');
        });

        Schema::create('communication_outbound_messages', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('provider_id')->nullable()->constrained('communication_providers')->nullOnDelete();
            $table->string('channel', 30)->index();
            $table->string('recipient', 255);
            $table->string('subject', 255)->nullable();
            $table->longText('body');
            $table->string('status', 30)->default('pending')->index();
            $table->unsignedInteger('attempts')->default(0);
            $table->boolean('fallback_used')->default(false);
            $table->string('external_message_id', 255)->nullable();
            $table->text('last_error')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('communication_outbound_messages');
        Schema::dropIfExists('communication_providers');
    }
};
