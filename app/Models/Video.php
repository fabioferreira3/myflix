<?php

namespace App\Models;

use AchyutN\LaravelHLS\Traits\ConvertsToHLS;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;
use Laravel\Scout\Searchable;
use ProtoneMedia\LaravelFFMpeg\Support\FFMpeg;

class Video extends Model
{
    use HasUuids, Searchable, ConvertsToHLS;

    protected $guarded = ['id'];
    protected $appends = ['full_path', 'thumbnail_folder_path', 'thumbnail_url', 'hls_playlist_url'];
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

    public function getFullPathAttribute()
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

    public function getHlsPlaylistUrlAttribute()
    {
        // Check if HLS has been converted and is available
        if (!$this->hls_path || $this->conversion_progress < 100) {
            return null;
        }

        // Generate the HLS playlist URL based on the package route pattern
        // The Laravel HLS package typically uses a route like: /hls/{model}/{id}/playlist.m3u8
        return route('hls.playlist', ['model' => 'video', 'id' => $this->id]);
    }

    public function getAudioPublicUrl()
    {
        if (!$this->audio_file_path) {
            return null;
        }

        return Storage::disk('s3')->temporaryUrl(
            $this->audio_file_path,
            now()->addMinutes(10)
        );
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
