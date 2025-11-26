<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class RequireBaronAuth
{
    /**
     * Handle an incoming request.
     *
     * This middleware checks if user is authenticated via Baron.
     * If not authenticated, shows a 403 Forbidden page instead of redirecting to login.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!Auth::check()) {
            // Redirect to the forbidden page instead of rendering it directly
            return redirect()->route('forbidden');
        }

        return $next($request);
    }
}
