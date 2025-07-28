<?php

declare(strict_types=1);

use App\Models\Video;

return [
    /**
     * Middlewares the HLS routes should use.
     * This should be an array of middleware names that will be applied
     * to the HLS routes.
     *
     * Default: []
     */
    'middlewares' => [
        // 'auth', // Uncomment to enable authentication middleware
    ],

    /**
     * The queue name for HLS conversion jobs.
     * This should be a string that defines the queue
     * name where the HLS conversion jobs will be dispatched.
     *
     * Default: "default"
     */
    'queue_name' => 'default',

    /**
     * This determines whether the HLS output files should be encrypted
     * using AES-128 encryption.
     *
     * Default: true
     */
    'enable_encryption' => true,

    /**
     * The bitrates for different resolutions. (In kbps)
     * This should be an associative array where the keys are
     * resolution strings in the format '{resolution}'
     * and the values are the corresponding bitrates in kbps.
     */
    'bitrates' => [
        '360p' => 600,
        '480p' => 1000,
        '720p' => 2500,
        '1080p' => 4500,
        '1440p' => 7000,
        '2160p' => 12000,
    ],

    /**
     * The resolutions for HLS conversion.
     * This should be an associative array where the keys are
     * resolution strings in the format '{resolution}'
     * and the values are the corresponding resolution strings
     * in the format '{width}x{height}'.
     *
     * Example: ['480p' => '854x480', '720p' => '1280x720', '1080p' => '1920x1080']
     */
    'resolutions' => [
        '360p' => '640x360',
        '480p' => '854x480',
        '720p' => '1280x720',
        '1080p' => '1920x1080',
        '1440p' => '2560x1440',
        '2160p' => '3840x2160',
    ],

    /**
     * The database column that is used to store the original video path.
     * This should be a string column that contains the path to the original
     * video file in default storage.
     *
     * Default: 'video_path'
     */
    'video_column' => 'file_path',

    /**
     * The database column that is used to store the HLS folder.
     * This should be a string column that contains the path to the HLS
     * output folder in default storage.
     *
     * Default: 'hls_path'
     */
    'hls_column' => 'hls_path',

    /**
     * The database column that is used to store the conversion progress.
     * This should be an integer column that contains the progress percentage
     * of the HLS conversion.
     *
     * Default: 'conversion_progress'
     */
    'progress_column' => 'conversion_progress',

    /**
     * The disk where the original video files are stored.
     * This should be a valid disk name as defined in your
     * `config/filesystems.php` file.
     *
     * Default: 'public'
     */
    'video_disk' => 'nas',

    /**
     * The disk where the HLS output files are stored.
     * This should be a valid disk name as defined in your
     * `config/filesystems.php` file.
     *
     * Default: 'local'
     */
    'hls_disk' => 'nas',

    /**
     * The disk where the encryption secrets are stored.
     * This should be a valid disk name as defined in your
     * `config/filesystems.php` file.
     *
     * Default: 'local'
     */
    'secrets_disk' => 'nas',

    /**
     * The path where the HLS output files will be stored.
     * This should be a valid path relative to the disk defined
     * in `hls_disk`.
     *
     * Default: 'hls'
     */
    'hls_output_path' => 'hls',

    /**
     * The path where the encryption secrets will be stored.
     * This should be a valid path relative to the disk defined
     * in `secret_disk`.
     *
     * Default: 'hls/secrets'
     */
    'secrets_output_path' => 'hls/secrets',

    /**
     * The model aliases to detect the class for conversion.
     * This should be an array of model class names that
     * implement the ConvertsToHLS trait.
     *
     * Default: []
     */
    'model_aliases' => [
        'video' => Video::class,
    ],

    /**
     * This determines whether the original video file should be deleted
     * after the HLS conversion is complete.
     *
     * Default: false
     */
    'delete_original_file_after_conversion' => false,
];
