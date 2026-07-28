<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('job_applications', function (Blueprint $table) {
            $table->index(['user_id', 'created_at']);
            $table->index(['user_id', 'status']);
            $table->index('interview_date');
            $table->index('last_contacted_at');
        });

        Schema::table('job_application_activities', function (Blueprint $table) {
            $table->index(['job_application_id', 'type']);
            $table->index('created_at');
        });

        Schema::table('contact_job_application', function (Blueprint $table) {
            $table->index('job_application_id');
        });

        Schema::table('ai_responses_cache', function (Blueprint $table) {
            $table->index('feature_type');
        });
    }

    public function down(): void
    {
        Schema::table('job_applications', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'created_at']);
            $table->dropIndex(['user_id', 'status']);
            $table->dropIndex(['interview_date']);
            $table->dropIndex(['last_contacted_at']);
        });

        Schema::table('job_application_activities', function (Blueprint $table) {
            $table->dropIndex(['job_application_id', 'type']);
            $table->dropIndex(['created_at']);
        });

        Schema::table('contact_job_application', function (Blueprint $table) {
            $table->dropIndex(['job_application_id']);
        });

        Schema::table('ai_responses_cache', function (Blueprint $table) {
            $table->dropIndex('feature_type');
        });
    }
};
