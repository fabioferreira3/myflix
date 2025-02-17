<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Segment extends Model
{
    use HasFactory, HasUuids;

    protected $guarded = ['id'];

    public function library()
    {
        return $this->belongsTo(Library::class);
    }

    public function videos()
    {
        return $this->morphedByMany(
            Video::class,
            'segmentable',
            'segment_items',
            'segment_id',
            'segmentable_id'
        )
            ->using(SegmentItem::class)
            ->withPivot('custom_title', 'order')
            ->withTimestamps();
    }
}
