<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('is_ai_disabled')->default(false)->after('role');
            $table->integer('custom_ai_daily_limit')->nullable()->after('is_ai_disabled');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['is_ai_disabled', 'custom_ai_daily_limit']);
        });
    }
};
