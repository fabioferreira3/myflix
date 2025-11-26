<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RequireBaronOrIframe
{
    /**
     * Handle an incoming request.
     *
     * This middleware ensures MyFlix is only accessible:
     * 1. When embedded as an iframe from Baron
     * 2. OR when user is authenticated via Baron session
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if request has baron_session_id parameter (initial iframe load)
        $hasBaronSession = $request->has('baron_session_id');

        // Check if user is authenticated (baron session was already processed)
        $isAuthenticated = Auth::check();

        // Check if request is from an iframe by looking at Sec-Fetch-Dest header
        $isIframe = $request->header('Sec-Fetch-Dest') === 'iframe';

        // Check if referer is from Baron (localhost or your Baron domain)
        $referer = $request->header('referer');
        $isFromBaron = $referer && (
            str_contains($referer, 'localhost') ||
            str_contains($referer, '127.0.0.1')
        );

        // Allow if any of these conditions are met:
        // 1. Has baron_session_id (initial load from Baron)
        // 2. Is authenticated (baron session worked)
        // 3. Is iframe request from Baron
        if ($hasBaronSession || $isAuthenticated || ($isIframe && $isFromBaron)) {
            return $next($request);
        }

        // Otherwise, show forbidden page
        return redirect()->route('forbidden');
    }
}
