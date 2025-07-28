<?php

namespace App\Console\Commands;

use App\Models\Video;
use App\Services\VideoService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TestWhisper extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:test-whisper';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $vs = new VideoService;
        $video = Video::find('9e38f57c-da54-4514-9db0-c87d6ee87456');
        $localPath = $vs->downloadAudio($video);
        $response = Http::attach(
            'file',
            file_get_contents($localPath),
            'input.wav'
        )->post('http://whisper-api:5000/transcribe');

        if ($response->successful()) {
            $transcription = $response->json()['transcription'];
            Log::debug($transcription);
        } else {
            Log::error('Failed to transcribe audio file: ' . $response->body());
        }
    }
}
