<?php

namespace App\Packages\AssemblyAI;

use App\Helpers\SupportHelper;
use App\Packages\AssemblyAI\Exceptions\GetTranscriptionRequestException;
use App\Packages\AssemblyAI\Exceptions\GetTranscriptionSubtitlesRequestException;
use App\Packages\AssemblyAI\Exceptions\TranscribeRequestException;
use Exception;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Faker\Factory as Faker;

class AssemblyAI
{
    protected $client;
    protected $defaultBody;

    public function __construct()
    {
        $this->client = Http::withHeaders([
            'Content-Type' => 'application/json',
        ])
            ->withToken(config('assemblyai.token'), 'Bearer')
            ->baseUrl('https://api.assemblyai.com/v2')
            ->timeout(90);
    }

    public function transcribe($fileUrl, $meta = [])
    {
        // if (SupportHelper::isTestModeEnabled()) {
        //     return Str::uuid();
        // }

        $urlParams = count($meta) > 0 ? '?' . http_build_query($meta) : '';
        $params = [
            'audio_url' => $fileUrl,
            'webhook_url' => config('assemblyai.webhook_url') . $urlParams,
            'webhook_auth_header_name' => 'Authorization',
            'webhook_auth_header_value' => 'Bearer ' . config('assemblyai.token'),
            'filter_profanity' => false,
            'content_safety' => false,
            'speaker_labels' => true,
            'language_detection' => true,
            //'language_code' => $meta['language'] ?? 'en'
        ];

        if ($meta['speakers_expected'] ?? false) {
            $params['speakers_expected'] = $meta['speakers_expected'];
        }

        try {
            $response = $this->client
                ->post('/transcript' . $urlParams, $params);

            if ($response->failed()) {
                return $response->throw();
            }

            if ($response->successful()) {
                return json_decode($response->body(), true);
            }
        } catch (Exception $e) {
            Log::error($e->getMessage());
            throw new TranscribeRequestException($e->getMessage());
        }
    }

    public function getTranscription($transcriptionId)
    {
        // if (SupportHelper::isTestModeEnabled()) {
        //     return $this->mockResponse();
        // }

        try {
            $response = $this->client->get('/transcript/' . $transcriptionId);

            if ($response->failed()) {
                return $response->throw();
            }

            if ($response->successful()) {
                return json_decode($response->body(), true);
            }
        } catch (Exception $e) {
            Log::error($e->getMessage());
            throw new GetTranscriptionRequestException($e->getMessage());
        }
    }

    public function getTranscriptionSubtitles($transcriptionId)
    {
        try {
            $baseUrl = '/transcript/' . $transcriptionId;
            $vttResponse = $this->client->get($baseUrl . '/vtt');
            $srtResponse = $this->client->get($baseUrl . '/srt');

            $results = [];

            if ($vttResponse->successful()) {
                $results['vtt'] = $vttResponse->body();
            } else {
                $vttResponse->throw();
            }

            if ($srtResponse->successful()) {
                $results['srt'] = $srtResponse->body();
            } else {
                $srtResponse->throw();
            }

            return $results;
        } catch (Exception $e) {
            Log::error($e->getMessage());
            throw new GetTranscriptionSubtitlesRequestException($e->getMessage());
        }
    }

    private function mockResponse()
    {
        $faker = Faker::create();
        $sleepCounter = $faker->numberBetween(2, 6);
        $wordsCount = $faker->numberBetween(10, 250);
        $response = $faker->words($wordsCount, true);

        sleep($sleepCounter);

        return $response;
    }
}
