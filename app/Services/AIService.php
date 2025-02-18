<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use OpenAI\Laravel\Facades\OpenAI;

class AIService
{

    public function extractAnalysis($text)
    {
        $prompt = "I need you to analyze the following transcription in Brazilian Portuguese and give me a response in json format (also in Brazilian Portuguese). Do not add any other comments before of after the task. Only provide the final json containing: \n\nAttributes:\n- 'title': generate a title for the talk\n- 'summary': a short paragraph summarizing his talk\n- 'key_sentences': an array, with up to 5 key sentences in the talk that relates to the title\n- 'tags': an array with up to 5 tags\n\n\nTranscription:\n\n";
        $prompt .= $text;
        $result = OpenAI::chat()->create([
            'model' => 'o3-mini',
            'messages' => [
                ['role' => 'user', 'content' => $prompt],
            ],
        ]);

        return $result->choices[0]->message->content;
    }
}
