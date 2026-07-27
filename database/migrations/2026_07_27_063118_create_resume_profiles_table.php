<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('resume_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->index()->constrained()->cascadeOnDelete();
            $table->string('full_name');
            $table->string('email');
            $table->string('phone');
            $table->string('location');
            $table->string('linkedin_url')->nullable();
            $table->text('summary')->nullable();
            $table->json('work_experience')->default('[]');
            $table->json('education')->default('[]');
            $table->json('skills')->default('[]');
            $table->json('certifications')->default('[]');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('resume_profiles');
    }
};
