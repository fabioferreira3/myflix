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
        Schema::create('segment_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('segment_id')->constrained('segments');
            $table->foreignUuid('segmentable_id');
            $table->string('segmentable_type');
            $table->string('custom_title')->nullable();
            $table->integer('order')->default(1);
            $table->timestamps();

            $table->index(['segmentable_id', 'segmentable_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('segment_items');
    }
};
