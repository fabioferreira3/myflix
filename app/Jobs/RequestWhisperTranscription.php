<?php

namespace App\Jobs;

use App\Models\Video;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class RequestWhisperTranscription implements ShouldQueue
{
    use Queueable, Dispatchable, InteractsWithQueue, SerializesModels;

    public $timeout = 10800;

    public $tries = 3;

    public $maxExceptions = 3;

    public function backoff(): array
    {
        return [30, 120, 300];
    }

    /**
     * Create a new job instance.
     */
    public function __construct(public Video $video, public string $language = 'pt')
    {
        $this->video = $video->fresh();
        $this->onQueue('transcription');
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $filePath = $this->video->file_path;

        if (str_starts_with($filePath, '/jw/')) {
            $filePath = substr($filePath, 4);
        } elseif (str_starts_with($filePath, 'jw/')) {
            $filePath = substr($filePath, 3);
        } elseif (str_starts_with($filePath, '/jw')) {
            $filePath = substr($filePath, 3);
        } elseif (str_starts_with($filePath, 'jw')) {
            $filePath = substr($filePath, 2);
        }

        $baseUrl = config('services.whisper.url');

        $response = Http::timeout(3600)->post("{$baseUrl}/transcribe", [
            'file_path' => $filePath,
            'model' => 'turbo',
            'language' => $this->language,
        ]);

        if ($response->successful()) {
            $transcriptionData = $response->json('transcription');

            // The whisper-api returns the entire JSON output from Whisper as a string
            // Parse it if it's a JSON string
            $transcriptionText = $transcriptionData;
            if (is_string($transcriptionData)) {
                $decoded = json_decode($transcriptionData, true);
                if ($decoded && isset($decoded['text'])) {
                    $transcriptionText = $decoded['text'];
                }
            }

            // Update the video with the transcription
            $this->video->update([
                'transcription' => $transcriptionText,
            ]);

            Log::info("Video {$this->video->id} Whisper transcription completed successfully");
        } else {
            Log::error("Failed to transcribe video {$this->video->id} with Whisper: " . $response->body());
            throw new \Exception("Whisper API failed: " . $response->body());
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error("RequestWhisperTranscription job failed for video {$this->video->id}: " . $exception->getMessage());
    }
}
