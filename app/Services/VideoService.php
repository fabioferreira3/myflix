<?php

namespace App\Services;

use App\Interfaces\AssemblyAIFactoryInterface;
use App\Jobs\ExtractAudioFromVideo;
use App\Jobs\RequestVideoTranscription;
use App\Models\Video;
use Exception;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use ProtoneMedia\LaravelFFMpeg\Exporters\EncodingException;
use ProtoneMedia\LaravelFFMpeg\Support\FFMpeg;

class VideoService
{
    public function extractAudioToMp3(Video $video)
    {
        try {
            $path = 'audios/' . $video->id . '.mp3';
            FFMpeg::fromDisk('nas')
                ->open($video->file_path)
                ->export()
                ->toDisk('local')
                ->inFormat(new \FFMpeg\Format\Audio\Mp3())
                ->save($path);

            Storage::disk('s3')->put($path, Storage::disk('local')->get($path));
            Storage::disk('local')->delete($path);

            return $path;
        } catch (EncodingException $exception) {
            $command = $exception->getCommand();
            $errorLog = $exception->getErrorOutput();
            throw new EncodingException('Failed to extract audio: ' . $errorLog, $command);
        } catch (\Exception $e) {
            throw new \Exception('Failed to extract audio: ' . $e->getMessage());
        }
    }

    public function getAndSaveAnalysis($videoId)
    {
        $video = Video::findOrFail($videoId);
        $ais = new AIService;
        $analysis = $ais->extractAnalysis($video->diarization_text);
        $video->update([
            'metadata' => json_decode($analysis, true)
        ]);
    }

    public function translate($videoId)
    {
        $video = Video::findOrFail($videoId);
        $ais = new AIService;
        $analysis = $ais->translate($video->transcription);
        $metadata = $video->metadata ?? [];
        if (!is_array($metadata)) {
            $metadata = json_decode($metadata, true) ?? [];
        }
        $metadata['translations'][] = [
            'language' => 'pt',
            'text' => $analysis,
        ];
        $video->update([
            'metadata' => $metadata
        ]);
    }

    public function transcript(Video $video, array $params)
    {
        Bus::chain([
            new ExtractAudioFromVideo($video, $params),
            new RequestVideoTranscription($video, $params),
        ])->catch(function (Exception $e) {
            throw new Exception('Failed to transcribe video: ' . $e->getMessage());
        })->dispatch();
    }

    public function getAndSaveTranscription($videoId, $transcriptionId)
    {
        $video = Video::findOrFail($videoId);
        $factory = app(AssemblyAIFactoryInterface::class);
        $assembly = $factory->make();
        $transcription = $assembly->getTranscription($transcriptionId);

        $text = "";
        foreach ($transcription['utterances'] as $utterance) {
            $text .= "<p><strong>Speaker {$utterance['speaker']}:</strong> {$utterance['text']}</p>";
        }

        $video->update([
            'transcription' => $transcription['text'],
            'diarization_text' => $text,
        ]);

        return $transcription;
    }

    public function importVideo(array $params)
    {
        $video = Video::create($params);
        $video->refreshThumbnails();
    }

    public function downloadAudio(Video $video)
    {
        try {
            $url = $video->getAudioPublicUrl();
            $fileName = $video->id . '.mp3';
            $response = Http::get($url);

            if ($response->failed()) {
                abort(500, 'Failed to download the file.');
            }
            Storage::disk('local')->put("audios/{$fileName}", $response->body());

            return storage_path("app/public/local/audios/{$fileName}");
        } catch (Exception $e) {
            throw new Exception('Failed to download audio: ' . $e->getMessage());
        }
    }

    public function convertToHLS(Video $video)
    {
        // Trigger HLS conversion
        \AchyutN\LaravelHLS\Jobs\QueueHLSConversion::dispatch($video)->onQueue(config('hls.queue_name', 'default'));
    }
}
