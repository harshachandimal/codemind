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
        Schema::table('analyses', function (Blueprint $table) {
            $table->string('trace_mode')->nullable()->after('explanation');
            $table->json('trace_steps')->nullable()->after('trace_mode');
            $table->json('trace_summary')->nullable()->after('trace_steps');
            $table->json('trace_result')->nullable()->after('trace_summary');
            $table->json('trace_plan')->nullable()->after('trace_result');
            $table->json('trace_error')->nullable()->after('trace_plan');
            $table->json('trace_metadata')->nullable()->after('trace_error');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('analyses', function (Blueprint $table) {
            $table->dropColumn([
                'trace_mode',
                'trace_steps',
                'trace_summary',
                'trace_result',
                'trace_plan',
                'trace_error',
                'trace_metadata',
            ]);
        });
    }
};
