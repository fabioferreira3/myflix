<?php

namespace App\Services;

use OpenAI\Laravel\Facades\OpenAI;

class AIService
{

    public function extractAnalysis($text)
    {
        $prompt = "I need you to analyze the following transcription and give me a response in json format (in Brazilian Portuguese). Do not add any other comments before of after the task. Only provide the final json containing: \n\nAttributes:\n- 'title': generate a title for the talk\n- 'summary': a short paragraph summarizing his talk\n- 'key_sentences': an array, with up to 5 key sentences in the talk that relates to the title\n- 'tags': an array with up to 5 tags\n\n\nTranscription:\n\n";
        $prompt .= $text;
        $result = OpenAI::chat()->create([
            'model' => 'o3-mini',
            'messages' => [
                ['role' => 'user', 'content' => $prompt],
            ],
        ]);

        return $result->choices[0]->message->content;
    }

    public function translate($text)
    {
        $prompt = "I need you to translate the following text to Brazilian Portuguese. Do not add any other comments before of after the task. Only provide the final translated text. \n\Original text:\n\n";
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
