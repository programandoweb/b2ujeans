<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('agent_interactions', function (Blueprint $table): void {
            $table->id();
            $table->string('agent_id', 80)->index();
            $table->uuid('request_id')->nullable()->index();
            $table->text('question');
            $table->longText('answer')->nullable();
            $table->string('status', 50)->default('completed')->index();
            $table->unsignedInteger('duration_ms')->nullable();
            $table->timestamps();

            $table->index(['agent_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agent_interactions');
    }
};
