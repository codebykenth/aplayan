<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('saved_cover_letters', function (Blueprint $table) {
            $table->string('target_company')->nullable()->after('job_description');
            $table->string('target_job_title')->nullable()->after('target_company');
            $table->string('template')->default('clean')->after('content');
        });
    }

    public function down(): void
    {
        Schema::table('saved_cover_letters', function (Blueprint $table) {
            $table->dropColumn(['target_company', 'target_job_title', 'template']);
        });
    }
};
