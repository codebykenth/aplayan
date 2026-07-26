<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedInteger('expected_salary')->nullable()->after('avatar');
            $table->json('job_search_preferences')->nullable()->after('expected_salary');
            $table->string('theme', 20)->default('system')->after('job_search_preferences');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['expected_salary', 'job_search_preferences', 'theme']);
        });
    }
};
