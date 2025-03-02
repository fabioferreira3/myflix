<?php

namespace App\Services;

use App\Interfaces\AssemblyAIFactoryInterface;
use App\Models\Video;
use Illuminate\Support\Facades\Storage;
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
        } catch (\Exception $e) {
            throw new \Exception('Failed to extract audio: ' . $e->getMessage());
        }
    }

    public function requestTranscription($videoId, $audioFilePath, array $params)
    {
        $transcriptionParams = [
            'video_id' => $videoId,
            'speakers_expected' => $params['expected_speakers'],
            'language' => $params['language'],
        ];

        $url = Storage::disk('s3')->temporaryUrl(
            $audioFilePath,
            now()->addMinutes(10)
        );
        $factory = app(AssemblyAIFactoryInterface::class);
        $assembly = $factory->make();
        $assembly->transcribe($url, $transcriptionParams);
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
        $audioFilePath = $video->audio_file_path;
        if (!$audioFilePath) {
            $audioFilePath = $this->extractAudioToMp3($video);
            $video->update(['audio_file_path' => $audioFilePath]);
        }

        if ($params['language'] ?? false) {
            $video->update(['language' => $params['language']]);
        }
        $this->requestTranscription($video->id, $audioFilePath, $params);
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
}
