<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('job_applications', function (Blueprint $table) {
            $table->integer('ai_tech_stack_percentage')->nullable()->after('ai_match_percentage');
            $table->integer('ai_experience_percentage')->nullable()->after('ai_tech_stack_percentage');
            $table->integer('ai_education_percentage')->nullable()->after('ai_experience_percentage');
        });
    }

    public function down(): void
    {
        Schema::table('job_applications', function (Blueprint $table) {
            $table->dropColumn(['ai_tech_stack_percentage', 'ai_experience_percentage', 'ai_education_percentage']);
        });
    }
};
