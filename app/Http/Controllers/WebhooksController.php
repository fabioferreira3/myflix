<?php

namespace App\Http\Controllers;

use App\Services\VideoService;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpKernel\Exception\HttpException;

class WebhooksController extends Controller
{
    public function assemblyAI(Request $request)
    {
        try {
            $token = $request->bearerToken();
            if ($token !== config('assemblyai.token')) {
                Log::error('Assembly AI invalid token sent', [$token]);
                abort(403);
            }

            $params = $request->all();
            if ($params['status'] === 'completed') {
                $vs = new VideoService();
                $vs->getAndSaveTranscription($params['video_id'], $params['transcript_id']);
            }
        } catch (HttpException $e) {
            if ($e->getStatusCode() === 403) {
                throw new HttpException($e->getStatusCode(), $e->getMessage());
            }
        } catch (Exception $e) {
            Log::error($e->getMessage());
        }
    }
}
