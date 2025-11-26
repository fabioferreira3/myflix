<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SegmentController;
use App\Http\Controllers\VideoController;
use App\Http\Controllers\WebhooksController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function (Illuminate\Http\Request $request) {
    // Preserve baron_session_id when redirecting
    $baronSessionId = $request->input('baron_session_id');
    if ($baronSessionId) {
        return redirect()->route('dashboard', ['baron_session_id' => $baronSessionId]);
    }
    return redirect()->route('dashboard');
});

// Forbidden page - accessible without authentication
Route::get('/forbidden', function () {
    return Inertia::render('Forbidden', [
        'message' => 'Access to MyFlix requires authentication from Baron.'
    ]);
})->name('forbidden');

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['baron.iframe'])->name('dashboard');


Route::middleware(['baron.iframe'])->group(function () {
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
});

// Auth routes disabled - MyFlix now authenticates via Baron's session cookies
// require __DIR__ . '/auth.php';
