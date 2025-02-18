<?php

namespace App\Providers;

use App\Factories\AssemblyAIFactory;
use App\Interfaces\AssemblyAIFactoryInterface;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(AssemblyAIFactoryInterface::class, AssemblyAIFactory::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
    }
}
