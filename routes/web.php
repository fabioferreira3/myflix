<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\VideoController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('/dashboard', [VideoController::class, 'index'])->middleware(['auth', 'verified'])->name('dashboard');
    Route::get('/videos/stream/{video}', [VideoController::class, 'stream'])->middleware(['auth', 'verified'])->name('videos.stream');
    Route::get('/videos/search', [VideoController::class, 'search'])->middleware(['auth', 'verified'])->name('videos.search');
    Route::get('/videos/{video}', [VideoController::class, 'show'])->middleware(['auth', 'verified'])->name('videos.show');
    Route::post('/videos/{video}', [VideoController::class, 'update'])->middleware(['auth', 'verified'])->name('videos.update');
});

require __DIR__ . '/auth.php';
