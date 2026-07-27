<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_responses_cache', function (Blueprint $table) {
            $table->id();
            $table->string('canonical_key')->unique();
            $table->string('feature_type');
            $table->string('normalized_company')->nullable()->index();
            $table->string('normalized_title')->nullable()->index();
            $table->json('response_data');
            $table->integer('hit_count')->default(1);
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_responses_cache');
    }
};
