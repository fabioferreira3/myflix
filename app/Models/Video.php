<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;
use Laravel\Scout\Searchable;
use ProtoneMedia\LaravelFFMpeg\Support\FFMpeg;

class Video extends Model
{
    use HasUuids, Searchable;

    protected $guarded = ['id'];
    protected $appends = ['url', 'thumbnail_folder_path', 'thumbnail_url'];
    protected $casts = ['metadata' => 'array'];

    public function segments()
    {
        return $this->morphToMany(
            Segment::class,
            'segmentable',
            'segment_items',
            'segmentable_id',
            'segment_id'
        );
    }

    public function getUrlAttribute()
    {
        return Storage::disk('nas')->path($this->file_path);
    }

    public function getThumbnailFolderPathAttribute()
    {
        return 'thumbnails/' . $this->id;
    }

    public function getThumbnailUrlAttribute()
    {
        return asset('storage/local/' . $this->thumbnail_folder_path . '/0.png');
    }

    public function refreshThumbnails()
    {
        $files = Storage::disk('local')->files($this->thumbnail_folder_path);
        Storage::disk('local')->delete($files);

        $mediaOpener = FFMpeg::fromDisk('nas')->open($this->file_path);
        foreach (
            [
                3,
                7,
                14
            ] as $key => $seconds
        ) {
            $mediaOpener = $mediaOpener->getFrameFromSeconds($seconds)
                ->export()
                ->toDisk('local')
                ->save($this->thumbnail_folder_path . "/{$key}.png");
        }
    }
}
