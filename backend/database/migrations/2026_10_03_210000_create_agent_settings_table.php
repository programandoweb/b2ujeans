<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('agent_settings', function (Blueprint $table): void {
            $table->id();
            $table->string('agent_id', 80)->unique();
            $table->string('provider', 40)->default('gemini');
            $table->text('api_key')->nullable();
            $table->string('model', 120)->default('gemini-2.5-flash');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agent_settings');
    }
};
