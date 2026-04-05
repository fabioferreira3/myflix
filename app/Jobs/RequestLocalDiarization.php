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

class RequestLocalDiarization implements ShouldQueue
{
    use Queueable, Dispatchable, InteractsWithQueue, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(public Video $video)
    {
        $this->video = $video->fresh();
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        // Get the video file path
        $filePath = $this->video->file_path;

        // Remove "/jw" prefix if present
        if (str_starts_with($filePath, '/jw')) {
            $filePath = substr($filePath, 3);
        }

        // Call the local diarization service
        $response = Http::timeout(300)->post('http://172.168.20.1/diarize', [
            'file_path' => $filePath,
            'language' => 'pt',
        ]);

        if ($response->successful()) {
            $transcription = $response->json('transcript');

            // Update the video with the transcription
            $this->video->update([
                'transcription' => $transcription,
                'language' => 'pt',
            ]);

            Log::info("Video {$this->video->id} transcription completed successfully");
        } else {
            Log::error("Failed to transcribe video {$this->video->id}: " . $response->body());
            throw new \Exception("Diarization service failed: " . $response->body());
        }
    }
}
