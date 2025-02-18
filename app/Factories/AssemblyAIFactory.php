<?php

namespace App\Factories;

use App\Interfaces\AssemblyAIFactoryInterface;
use App\Packages\AssemblyAI\AssemblyAI;

class AssemblyAIFactory implements AssemblyAIFactoryInterface
{
    public function make(): AssemblyAI
    {
        return new AssemblyAI();
    }
}
