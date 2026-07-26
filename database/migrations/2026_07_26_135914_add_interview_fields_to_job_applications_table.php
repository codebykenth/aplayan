<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('job_applications', function (Blueprint $table) {
            $table->datetime('interview_date')->nullable();
            $table->text('interview_notes')->nullable();
            $table->json('ai_interview_prep')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('job_applications', function (Blueprint $table) {
            $table->dropColumn(['interview_date', 'interview_notes', 'ai_interview_prep']);
        });
    }
};
