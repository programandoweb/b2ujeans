<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('hero_slides', function (Blueprint $table): void {
            $table->string('section_key', 120)->default('home.hero')->after('id')->index();
            $table->string('seed_key', 160)->nullable()->after('section_key')->unique();
        });

        DB::table('hero_slides')->whereNull('section_key')->update(['section_key' => 'home.hero']);
    }

    public function down(): void
    {
        Schema::table('hero_slides', function (Blueprint $table): void {
            $table->dropUnique(['seed_key']);
            $table->dropIndex(['section_key']);
            $table->dropColumn(['section_key', 'seed_key']);
        });
    }
};
