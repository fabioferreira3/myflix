<?php

namespace App\Jobs;

use App\Models\Video;
use App\Services\AIService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class AnalyzeVideoWithAI implements ShouldQueue
{
    use Queueable, Dispatchable, InteractsWithQueue, SerializesModels;

    public $timeout = 300;

    public $tries = 3;

    public $maxExceptions = 3;

    public function backoff(): array
    {
        return [30, 60, 120];
    }

    public function __construct(public Video $video)
    {
        $this->video = $video->fresh();
        $this->onQueue('default');
    }

    public function handle(): void
    {
        $text = $this->video->diarization_text ?? $this->video->transcription;

        if (!$text) {
            Log::warning("AnalyzeVideoWithAI: no transcription available for video {$this->video->id}");
            return;
        }

        $ais = new AIService;
        $results = $ais->extractAnalysis($text);

        $this->video->update([
            'metadata' => json_decode($results, true),
        ]);

        Log::info("AnalyzeVideoWithAI: completed for video {$this->video->id}");
    }

    public function failed(\Throwable $exception): void
    {
        Log::error("AnalyzeVideoWithAI job failed for video {$this->video->id}: " . $exception->getMessage());
    }
}
