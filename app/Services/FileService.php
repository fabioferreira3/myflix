<?php

namespace App\Services;

use App\Models\Video;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use IntlDateFormatter;

class FileService
{
    public function scanDirectory($directory)
    {
        $results = [];

        $directories = Storage::disk('nas')->directories($directory);
        $files = Storage::disk('nas')->files($directory);

        $filesData = [];
        foreach ($files as $file) {
            try {
                $ext = pathinfo($file, PATHINFO_EXTENSION);
                if (!in_array($ext, ['mp4', 'mov', 'flv', 'avi'])) {
                    continue;
                }
                $data = [
                    'basename'      => basename($file),
                    'full_path'     => $file,
                    'size'          => Storage::disk('nas')->size($file),
                    'extension'     => $ext,
                    'last_modified' => Storage::disk('nas')->lastModified($file),
                ];
                $filesData[] = $data;

                Video::create([
                    'title' => $data['basename'],
                    'file_path' => $data['full_path'],
                    'size' => $data['size'],
                    'extension' => $data['extension'],
                ]);
            } catch (Exception $e) {
                Log::warning("Skipping corrupted path: {$directory}. Error: " . $e->getMessage());
            }
        }

        $results[$directory] = $filesData;

        foreach ($directories as $subdir) {
            $subResults = $this->scanDirectory($subdir);
            $results = array_merge($results, $subResults);
        }

        return $results;
    }

    public function teste()
    {
        $formatter = new IntlDateFormatter(
            'pt_BR', // Locale
            IntlDateFormatter::FULL, // Date format (LONG, MEDIUM, SHORT, FULL)
            IntlDateFormatter::NONE, // No time component
            'America/Sao_Paulo', // Timezone
            IntlDateFormatter::GREGORIAN, // Calendar type
            "dd 'de' MMMM 'de' yyyy" // Date pattern
        );

        $videos = Video::all();
        foreach ($videos as $video) {
            $timestamp = $formatter->parse($video->title);
            if ($timestamp !== false) {
                $date = Carbon::createFromTimestamp($timestamp);
                $video->update(['date' => $date->format('Y-m-d')]);
            }
        }
    }
}
