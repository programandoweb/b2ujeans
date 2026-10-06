<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        DB::statement(
            "ALTER TABLE communication_providers MODIFY driver ENUM('baileys','smtp','whatsapp_link') NOT NULL"
        );
    }

    public function down(): void
    {
        DB::table('communication_providers')
            ->where('driver', 'whatsapp_link')
            ->delete();

        DB::statement(
            "ALTER TABLE communication_providers MODIFY driver ENUM('baileys','smtp') NOT NULL"
        );
    }
};
