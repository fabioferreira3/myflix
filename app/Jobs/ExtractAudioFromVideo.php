<?php

namespace App\Jobs;

use App\Models\Video;
use App\Services\VideoService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ExtractAudioFromVideo implements ShouldQueue
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
        $vs = new VideoService;
        if (!$this->video->audio_file_path) {
            $audioFilePath = $vs->extractAudioToMp3($this->video);
            $this->video->update(['audio_file_path' => $audioFilePath]);
        }

        if ($this->params['language'] ?? false) {
            $this->video->update(['language' => $this->params['language']]);
        }
    }
}
