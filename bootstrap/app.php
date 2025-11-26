<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [
            \App\Http\Middleware\BaronSessionAuth::class,
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        // Register custom middleware aliases
        $middleware->alias([
            'baron.auth' => \App\Http\Middleware\RequireBaronAuth::class,
            'baron.iframe' => \App\Http\Middleware\RequireBaronOrIframe::class,
        ]);

        // Use custom Authenticate middleware that doesn't redirect to /login
        $middleware->redirectGuestsTo(fn() => abort(403, 'Access to MyFlix requires authentication from Baron.'));
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
