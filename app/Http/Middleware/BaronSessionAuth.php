<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class BaronSessionAuth
{
    /**
     * Handle an incoming request.
     *
     * This middleware checks for authentication from Baron's session cookies.
     * Baron will set a session cookie that contains the user_id.
     *
     * Expected cookie name: baron_session (configurable via BARON_SESSION_COOKIE env)
     * Expected session structure: The session should contain 'user_id' field
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Get the Baron session cookie name from config
        $baronSessionCookie = config('auth.baron_session_cookie', 'baron_session');

        // Check if Baron session ID exists (from URL parameter or cookie)
        $baronSessionId = $request->input('baron_session_id') ?? $request->cookie($baronSessionCookie);

        if ($baronSessionId) {
            // Get session data from Baron's session
            // Baron uses database sessions, so we query the sessions table
            $sessionData = DB::connection(config('auth.baron_session_connection', 'baron'))
                ->table(config('auth.baron_session_table', 'sessions'))
                ->where('id', $baronSessionId)
                ->first();

            if ($sessionData) {
                // Decode the session payload
                $payload = $this->decodeSessionData($sessionData->payload);

                // Laravel stores authenticated user ID with key pattern: login_web_{hash}
                // Find the login key
                $userId = null;
                foreach ($payload as $key => $value) {
                    if (str_starts_with($key, 'login_web_')) {
                        $userId = $value;
                        break;
                    }
                }

                if ($userId) {
                    // Find the user in myflix database
                    $user = User::find($userId);

                    if ($user) {
                        // Set the user for this request (baron_session_id passed with every request)
                        Auth::setUser($user);
                    }
                }
            }
        }

        return $next($request);
    }

    /**
     * Decode Laravel session data
     *
     * Laravel stores session data as a base64-encoded serialized string
     */
    protected function decodeSessionData(string $data): array
    {
        try {
            // Laravel's session data is base64 encoded
            $decoded = base64_decode($data);

            if ($decoded === false) {
                return [];
            }

            // Unserialize the data
            $unserialized = @unserialize($decoded);

            if ($unserialized === false) {
                return [];
            }

            return is_array($unserialized) ? $unserialized : [];
        } catch (\Exception $e) {
            Log::error('Failed to decode Baron session data: ' . $e->getMessage());
            return [];
        }
    }
}
