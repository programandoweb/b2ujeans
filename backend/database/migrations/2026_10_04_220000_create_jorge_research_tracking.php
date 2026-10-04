<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('agent_research_runs', function (Blueprint $table): void {
            $table->id();
            $table->string('agent_id', 80)->unique();
            $table->string('status', 30)->default('idle')->index();
            $table->unsignedInteger('total_items')->default(0);
            $table->unsignedInteger('processed_items')->default(0);
            $table->unsignedInteger('successful_items')->default(0);
            $table->unsignedInteger('failed_items')->default(0);
            $table->foreignId('current_catalog_item_id')->nullable()->constrained('catalog_items')->nullOnDelete();
            $table->text('last_error')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('finished_at')->nullable();
            $table->timestamp('last_heartbeat_at')->nullable();
            $table->timestamps();
        });

        Schema::table('catalog_items', function (Blueprint $table): void {
            $table->string('legacy_source_url', 1000)->nullable()->after('whatsapp_message');
            $table->json('legacy_meta')->nullable()->after('legacy_source_url');
            $table->longText('legacy_raw_html')->nullable()->after('legacy_meta');
            $table->string('legacy_research_status', 30)->default('pending')->index()->after('legacy_raw_html');
            $table->text('legacy_research_error')->nullable()->after('legacy_research_status');
            $table->timestamp('legacy_researched_at')->nullable()->after('legacy_research_error');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agent_research_runs');

        Schema::table('catalog_items', function (Blueprint $table): void {
            $table->dropColumn([
                'legacy_source_url',
                'legacy_meta',
                'legacy_raw_html',
                'legacy_research_status',
                'legacy_research_error',
                'legacy_researched_at',
            ]);
        });
    }
};
