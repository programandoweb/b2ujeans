<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('hero_slides', function (Blueprint $table): void {
            $table->id();
            $table->unsignedTinyInteger('option');
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('interval_ms')->default(3000);
            $table->string('image_url', 2048);
            $table->string('background_position', 80)->default('center');
            $table->string('eyebrow', 180)->nullable();
            $table->string('title', 220);
            $table->string('accent', 220)->nullable();
            $table->text('description')->nullable();
            $table->string('primary_label', 120)->nullable();
            $table->string('primary_href', 2048)->nullable();
            $table->string('secondary_label', 120)->nullable();
            $table->string('secondary_href', 2048)->nullable();
            $table->json('cards')->nullable();
            $table->timestamps();

            $table->index(['option', 'is_active', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hero_slides');
    }
};
