<?php

namespace App\Http\Controllers;

use App\Models\Segment;
use App\Models\Video;
use App\Jobs\AnalyzeVideoWithAI;
use App\Services\VideoService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\StreamedResponse;

class VideoController extends Controller
{
    public function index()
    {
        $videos = Video::orderBy('date', 'DESC')->paginate(24);
        return Inertia::render('Dashboard', [
            'videos' => $videos,
        ]);
    }

    public function show(Video $video)
    {
        return Inertia::render('VideoShow', [
            'video' => $video,
        ]);
    }

    public function search(Request $request)
    {
        $videos = Video::search($request->input('query'))
            ->paginate(24);

        return Inertia::render('Dashboard', [
            'videos' => $videos,
        ]);
    }

    public function update(Video $video, Request $request)
    {
        $video->update($request->all());

        return back();
    }

    public function updateMetadata(Video $video, Request $request)
    {
        $validated = $request->validate([
            'author'          => 'nullable|string|max:255',
            'date'            => 'nullable|date',
            'participants'    => 'nullable|array',
            'participants.*'  => 'string|max:255',
            'tags'            => 'nullable|array',
            'tags.*'          => 'string|max:255',
        ]);

        $existing = $video->metadata ?? [];
        $video->update(['metadata' => array_merge($existing, $validated)]);

        return back();
    }

    public function stream(Video $video, Request $request)
    {
        if (!file_exists($video->full_path)) {
            abort(404);
        }
        $size = filesize($video->full_path);
        $start = 0;
        $length = $size;
        $status = 200;
        $headers = [
            'Content-Type' => 'video/mp4',
            'Cache-Control' => 'no-cache',
            'Accept-Ranges' => 'bytes',
        ];

        if ($request->headers->has('Range')) {
            $range = $request->header('Range');
            [$unit, $range] = explode('=', $range, 2);
            if ($unit === 'bytes') {
                [$start, $end] = explode('-', $range, 2);
                $start = intval($start);

                if ($end) {
                    $end = intval($end);
                } else {
                    $end = $size - 1;
                }

                $length = $end - $start + 1;
                $status = 206;
                $headers['Content-Range'] = "bytes $start-$end/$size";
                $headers['Content-Length'] = $length;
            }
        } else {
            $headers['Content-Length'] = $length;
        }

        $response = new StreamedResponse(function () use ($video, $start, $length) {
            $handle = fopen($video->full_path, 'rb');
            fseek($handle, $start);
            $buffer = 8192;
            $bytesToRead = $length;
            while ($bytesToRead > 0 && !feof($handle)) {
                $data = fread($handle, $buffer);
                echo $data;
                flush();
                $bytesToRead -= strlen($data);
            }
            fclose($handle);
        }, $status, $headers);

        return $response;
    }

    public function transcript(Request $request, Video $video)
    {
        $params = $request->validate([
            'language' => 'sometimes|in:en,pt',
        ]);

        $language = $params['language'] ?? 'pt';

        $vs = new VideoService;
        $vs->transcript($video, $language);

        return back();
    }

    public function translate(Video $video)
    {
        $vs = new VideoService;
        $vs->translate($video->id);

        return back();
    }

    public function aiAnalysis(Video $video)
    {
        AnalyzeVideoWithAI::dispatch($video);

        return back();
    }

    public function assignSegments(Video $video, Request $request)
    {
        $segmentIds = $request->input('segment_ids');
        foreach ($segmentIds as $segmentId) {
            $segment = Segment::find($segmentId);
            $segment->videos()->save($video);
        }

        return back();
    }

    public function downloadAudio(Video $video)
    {
        $vs = new VideoService;
        $localPath = $vs->downloadAudio($video);

        return response()->download($localPath, 'audio.mp3')->deleteFileAfterSend(true);
    }

    public function convertToHLS(Video $video)
    {
        // Manually trigger HLS conversion
        \AchyutN\LaravelHLS\Jobs\QueueHLSConversion::dispatch($video)->onQueue('default');

        return back()->with('message', 'HLS conversion started!');
    }

    public function morningWorship(Request $request)
    {
        $query = $request->input('query', '');

        $videos = Video::where('file_path', 'like', 'jw/morning-worship/%')
            ->when($query, function ($q) use ($query) {
                $q->where(function ($q) use ($query) {
                    $q->where('title', 'ilike', "%{$query}%")
                      ->orWhere('description', 'ilike', "%{$query}%")
                      ->orWhere('transcription', 'ilike', "%{$query}%")
                      ->orWhereJsonContains('metadata->participants', $query)
                      ->orWhereJsonContains('metadata->tags', $query)
                      ->orWhere('metadata->author', 'ilike', "%{$query}%");
                });
            })
            ->orderBy('created_at', 'DESC')
            ->paginate(24)
            ->withQueryString();

        return Inertia::render('MorningWorship', [
            'videos' => $videos,
            'query'  => $query,
        ]);
    }

    public function morningWorshipBroadcasting(Request $request)
    {
        $query = $request->input('query', '');

        $videos = Video::where('file_path', 'like', 'jw/morning-worship-broadcasting/%')
            ->when($query, function ($q) use ($query) {
                $q->where(function ($q) use ($query) {
                    $q->where('title', 'ilike', "%{$query}%")
                      ->orWhere('description', 'ilike', "%{$query}%")
                      ->orWhere('transcription', 'ilike', "%{$query}%")
                      ->orWhereJsonContains('metadata->participants', $query)
                      ->orWhereJsonContains('metadata->tags', $query)
                      ->orWhere('metadata->author', 'ilike', "%{$query}%");
                });
            })
            ->orderBy('created_at', 'DESC')
            ->paginate(24)
            ->withQueryString();

        return Inertia::render('MorningWorshipBroadcasting', [
            'videos' => $videos,
            'query'  => $query,
        ]);
    }
}
