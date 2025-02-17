<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Library extends Model
{
    use HasFactory, HasUuids;

    protected $guarded = ['id'];

    public function segments()
    {
        return $this->hasMany(Segment::class);
    }
}
