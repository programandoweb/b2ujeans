<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('agent_knowledge_entries', function (Blueprint $table): void {
            $table->id();
            $table->string('agent_id', 80)->default('claudio')->index();
            $table->string('category', 100)->nullable()->index();
            $table->string('title', 220);
            $table->text('question')->nullable();
            $table->longText('answer');
            $table->text('keywords')->nullable();
            $table->string('source_url', 1000)->nullable();
            $table->string('source_type', 50)->default('curated');
            $table->unsignedTinyInteger('confidence')->default(100);
            $table->enum('status', ['draft', 'published', 'archived'])->default('published')->index();
            $table->string('created_by_agent', 80)->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->fullText(['title', 'question', 'answer', 'keywords'], 'agent_knowledge_fulltext');
        });

        Schema::create('agent_unanswered_questions', function (Blueprint $table): void {
            $table->id();
            $table->string('agent_id', 80)->default('claudio')->index();
            $table->text('question');
            $table->string('normalized_hash', 64)->index();
            $table->unsignedInteger('times_asked')->default(1);
            $table->enum('status', ['pending', 'answered', 'discarded'])->default('pending')->index();
            $table->text('resolution')->nullable();
            $table->foreignId('knowledge_entry_id')->nullable()->constrained('agent_knowledge_entries')->nullOnDelete();
            $table->timestamp('last_asked_at')->nullable();
            $table->foreignId('resolved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();

            $table->unique(['agent_id', 'normalized_hash'], 'agent_unanswered_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agent_unanswered_questions');
        Schema::dropIfExists('agent_knowledge_entries');
    }
};
