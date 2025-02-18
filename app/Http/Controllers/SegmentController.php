<?php

namespace App\Http\Controllers;

use App\Models\Segment;
use App\Models\Video;
use Illuminate\Support\Facades\Request;
use Inertia\Inertia;

class SegmentController extends Controller
{
    public function index(Segment $segment)
    {
        return Inertia::render('SegmentPage', [
            'segment' => $segment,
            'videos' => $segment->videos,
        ]);
    }
}
