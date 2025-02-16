<?php

namespace App\Http\Controllers;

use App\Models\Video;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use ProtoneMedia\LaravelFFMpeg\Support\FFMpeg;
use Symfony\Component\HttpFoundation\StreamedResponse;

class VideoController extends Controller
{
    public function index()
    {
        $videos = Video::orderBy('date', 'DESC')->get();
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
            ->get();

        return Inertia::render('Dashboard', [
            'videos' => $videos,
        ]);
    }

    public function update(Video $video, Request $request)
    {
        $video->update($request->all());
        return redirect()->route('dashboard');
    }

    public function stream(Video $video, Request $request)
    {
        if (!file_exists($video->url)) {
            abort(404);
        }
        $size = filesize($video->url);
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
            $handle = fopen($video->url, 'rb');
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
}
