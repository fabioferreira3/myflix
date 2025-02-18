<?php

use App\Http\Controllers\WebhooksController;
use Illuminate\Support\Facades\Route;

Route::post('/webhooks/assembly-ai', [WebhooksController::class, 'assemblyAI']);
