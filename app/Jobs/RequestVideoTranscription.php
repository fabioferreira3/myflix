<?php

namespace App\Jobs;

use App\Interfaces\AssemblyAIFactoryInterface;
use App\Models\Video;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Storage;

class RequestVideoTranscription implements ShouldQueue
{
    use Queueable, Dispatchable, InteractsWithQueue, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(public Video $video, public array $params)
    {
        $this->video = $video->fresh();
        $this->params = $params;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $transcriptionParams = [
            'video_id' => $this->video->id,
            'speakers_expected' => $this->params['expected_speakers'],
            'language' => $this->params['language'],
        ];

        $url = Storage::disk('s3')->temporaryUrl(
            $this->video->audio_file_path,
            now()->addMinutes(10)
        );
        $factory = app(AssemblyAIFactoryInterface::class);
        $assembly = $factory->make();
        $assembly->transcribe($url, $transcriptionParams);
    }
}
