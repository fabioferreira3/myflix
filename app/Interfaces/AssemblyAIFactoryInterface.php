<?php

namespace App\Interfaces;

use App\Packages\AssemblyAI\AssemblyAI;

interface AssemblyAIFactoryInterface
{
    public function make(): AssemblyAI;
}
