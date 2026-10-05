<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->string('password')->nullable()->change();
            $table->timestamp('data_processing_consent_at')->nullable()->after('whatsapp');
            $table->string('data_processing_consent_source', 80)->nullable()->after('data_processing_consent_at');
            $table->string('data_processing_policy_version', 40)->nullable()->after('data_processing_consent_source');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->dropColumn([
                'data_processing_consent_at',
                'data_processing_consent_source',
                'data_processing_policy_version',
            ]);
            $table->string('password')->nullable(false)->change();
        });
    }
};
