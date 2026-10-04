<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('catalog_items', function (Blueprint $table): void {
            $table->decimal('commercial_price', 14, 2)->nullable()->after('status');
            $table->string('price_currency', 3)->default('COP')->after('commercial_price');
            $table->string('price_unit', 80)->nullable()->after('price_currency');
        });

        Schema::create('commercial_leads', function (Blueprint $table): void {
            $table->id();
            $table->string('name', 190);
            $table->string('email', 190)->index();
            $table->string('whatsapp', 40)->index();
            $table->string('source', 80)->default('claudio');
            $table->string('status', 50)->default('new')->index();
            $table->text('notes')->nullable();
            $table->timestamp('human_followup_at')->nullable();
            $table->timestamps();
        });

        Schema::create('commercial_quotes', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('lead_id')->constrained('commercial_leads')->cascadeOnDelete();
            $table->string('number', 40)->unique();
            $table->string('status', 50)->default('awaiting_human')->index();
            $table->string('currency', 3)->default('COP');
            $table->decimal('subtotal', 14, 2)->default(0);
            $table->decimal('total', 14, 2)->default(0);
            $table->text('notes')->nullable();
            $table->string('created_by_agent', 80)->default('claudio');
            $table->timestamps();
        });

        Schema::create('commercial_quote_items', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('quote_id')->constrained('commercial_quotes')->cascadeOnDelete();
            $table->foreignId('catalog_item_id')->nullable()->constrained('catalog_items')->nullOnDelete();
            $table->string('description', 255);
            $table->decimal('quantity', 12, 2);
            $table->decimal('unit_price', 14, 2);
            $table->decimal('line_total', 14, 2);
            $table->timestamps();
        });

        Schema::create('commercial_appointments', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('lead_id')->constrained('commercial_leads')->cascadeOnDelete();
            $table->timestamp('scheduled_at')->index();
            $table->string('status', 50)->default('scheduled')->index();
            $table->string('channel', 50)->default('commercial_call');
            $table->text('notes')->nullable();
            $table->string('created_by_agent', 80)->default('claudio');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('commercial_appointments');
        Schema::dropIfExists('commercial_quote_items');
        Schema::dropIfExists('commercial_quotes');
        Schema::dropIfExists('commercial_leads');

        Schema::table('catalog_items', function (Blueprint $table): void {
            $table->dropColumn(['commercial_price', 'price_currency', 'price_unit']);
        });
    }
};
