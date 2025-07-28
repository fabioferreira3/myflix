<?php

namespace App\Console\Commands;

use App\Services\FileService;
use Illuminate\Console\Command;

class ScanDirectory extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:scan {dir}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $fs = new FileService;
        $fs->requestDirectoryScan($this->argument('dir'));
    }
}
