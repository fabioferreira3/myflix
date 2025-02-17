<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphPivot;
use Illuminate\Database\Eloquent\Relations\Pivot;

class SegmentItem extends MorphPivot
{
    use HasUuids;

    protected $guarded = ['id'];
    public $incrementing = false;
    protected $keyType = 'string';

    public function segment()
    {
        return $this->belongsTo(Segment::class);
    }

    public function segmentable()
    {
        return $this->morphTo();
    }
}
