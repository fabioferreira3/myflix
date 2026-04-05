<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SegmentController;
use App\Http\Controllers\VideoController;
use App\Services\FileService;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('dashboard');
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->name('dashboard');

Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

Route::get('/dashboard', [VideoController::class, 'index'])->name('dashboard');
Route::get('/videos/stream/{video}', [VideoController::class, 'stream'])->name('videos.stream');
Route::get('/videos/search', [VideoController::class, 'search'])->name('videos.search');
Route::get('/videos/{video}', [VideoController::class, 'show'])->name('videos.show');
Route::post('/videos/transcript/{video}', [VideoController::class, 'transcript'])->name('videos.transcript');
Route::post('/videos/ai-analysis/{video}', [VideoController::class, 'aiAnalysis'])->name('videos.ai-analysis');
Route::post('/videos/translate/{video}', [VideoController::class, 'translate'])->name('videos.translate');
Route::post('/videos/segments/{video}', [VideoController::class, 'assignSegments'])->name('videos.assign-segments');
Route::get('/videos/download-audio/{video}', [VideoController::class, 'downloadAudio'])->name('videos.download-audio');
Route::post('/videos/convert-hls/{video}', [VideoController::class, 'convertToHLS'])->name('videos.convert-hls');
Route::post('/videos/{video}', [VideoController::class, 'update'])->name('videos.update');

Route::get('/segments/{segment}', [SegmentController::class, 'index'])->name('segments.index');
Route::get('/collections/morning-worship', [VideoController::class, 'morningWorship'])->name('collections.morning-worship');
Route::get('/collections/morning-worship-broadcasting', [VideoController::class, 'morningWorshipBroadcasting'])->name('collections.morning-worship-broadcasting');

Route::get('/whisper/health', function () {
    $healthUrl = config('services.whisper.health_url');
    if (!$healthUrl) {
        return response()->json(['ok' => false, 'message' => 'Whisper health URL not configured'], 503);
    }
    try {
        $response = \Illuminate\Support\Facades\Http::timeout(5)->get($healthUrl);
        if ($response->successful()) {
            return response()->json(['ok' => true]);
        }
        return response()->json(['ok' => false, 'message' => 'Whisper service unavailable'], 503);
    } catch (\Exception $e) {
        return response()->json(['ok' => false, 'message' => 'Whisper service unreachable'], 503);
    }
})->name('whisper.health');

Route::post('/scan', function () {
    set_time_limit(0);
    (new FileService)->requestDirectoryScan('jw');
    return back();
})->name('scan');

// Debug route to test CSRF token
Route::post('/test-csrf', function (Illuminate\Http\Request $request) {
    return response()->json([
        'success' => true,
        'message' => 'CSRF token is working!',
        'session_id' => session()->getId(),
        'has_session' => session()->has('_token'),
        'csrf_token' => csrf_token(),
    ]);
})->name('test.csrf');
