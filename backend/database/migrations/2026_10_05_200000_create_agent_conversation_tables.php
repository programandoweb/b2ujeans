<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('agent_conversation_sessions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('agent_id', 80)->index();
            $table->string('title', 180)->nullable();
            $table->timestamp('last_message_at')->nullable()->index();
            $table->timestamps();

            $table->index(['user_id', 'agent_id', 'last_message_at'], 'agent_session_latest_idx');
        });

        Schema::create('agent_conversation_messages', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('session_id')->constrained('agent_conversation_sessions')->cascadeOnDelete();
            $table->enum('role', ['user', 'assistant', 'system']);
            $table->longText('content');
            $table->uuid('request_id')->nullable()->index();
            $table->timestamps();

            $table->index(['session_id', 'created_at'], 'agent_session_messages_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agent_conversation_messages');
        Schema::dropIfExists('agent_conversation_sessions');
    }
};
