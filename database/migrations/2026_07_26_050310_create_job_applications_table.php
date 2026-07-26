<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('job_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->index()->constrained()->cascadeOnDelete();
            $table->string('company_name');
            $table->string('job_title');
            $table->string('job_url')->nullable();
            $table->text('job_description')->nullable();
            $table->string('location');
            $table->string('status')->index();
            $table->date('date_applied')->nullable();
            $table->unsignedInteger('expected_salary')->nullable();
            $table->unsignedInteger('offered_salary')->nullable();
            $table->text('notes')->nullable();
            $table->unsignedTinyInteger('ai_match_percentage')->nullable();
            $table->json('ai_strengths')->nullable();
            $table->json('ai_gaps')->nullable();
            $table->unsignedInteger('ai_salary_min')->nullable();
            $table->unsignedInteger('ai_salary_max')->nullable();
            $table->text('ai_salary_notes')->nullable();
            $table->timestamp('ai_evaluated_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('job_applications');
    }
};
