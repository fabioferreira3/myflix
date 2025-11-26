<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;
use Inertia\Inertia;

class Authenticate extends Middleware
{
    /**
     * Get the path the user should be redirected to when they are not authenticated.
     *
     * Instead of redirecting to login, we return null to prevent redirect
     * and let our RequireBaronAuth middleware handle showing the forbidden page.
     */
    protected function redirectTo(Request $request): ?string
    {
        // Don't redirect - return a 403 forbidden response instead
        if (!$request->expectsJson()) {
            abort(403, 'Access to MyFlix requires authentication from Baron.');
        }

        return null;
    }
}
