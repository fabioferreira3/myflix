<?php

namespace App\Jobs;

use App\Services\FileService;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ScanDirectory implements ShouldQueue
{
    use Queueable, Dispatchable, InteractsWithQueue, SerializesModels;

    public function __construct(public string $directory)
    {
    }

    public function handle(): void
    {
        $fs = new FileService;
        $fs->requestDirectoryScan($this->directory);
    }
}
