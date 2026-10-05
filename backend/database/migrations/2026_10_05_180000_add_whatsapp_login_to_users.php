<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->string('whatsapp', 20)->nullable()->unique()->after('email');
        });

        Schema::create('whatsapp_login_codes', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('phone', 20)->index();
            $table->string('code_hash');
            $table->timestamp('expires_at')->index();
            $table->unsignedTinyInteger('attempts')->default(0);
            $table->timestamp('used_at')->nullable()->index();
            $table->timestamps();

            $table->index(['user_id', 'phone', 'expires_at'], 'whatsapp_login_lookup_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('whatsapp_login_codes');

        Schema::table('users', function (Blueprint $table): void {
            $table->dropUnique(['whatsapp']);
            $table->dropColumn('whatsapp');
        });
    }
};
