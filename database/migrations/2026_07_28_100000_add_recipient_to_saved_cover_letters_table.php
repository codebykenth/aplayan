<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('saved_cover_letters', function (Blueprint $table) {
            $table->string('recipient')->nullable()->after('target_job_title');
        });
    }

    public function down(): void
    {
        Schema::table('saved_cover_letters', function (Blueprint $table) {
            $table->dropColumn('recipient');
        });
    }
};
