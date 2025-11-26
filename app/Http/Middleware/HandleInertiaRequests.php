<?php

namespace App\Http\Middleware;

use App\Http\Resources\SegmentResource;
use App\Models\Segment;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        // Get authenticated user (from Baron session or regular auth)
        $user = $request->user();

        return [
            ...parent::share($request),
            'segments' => SegmentResource::collection(Segment::all()),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                ] : null,
            ],
            'baronSessionId' => $request->input('baron_session_id'),
        ];
    }
}
