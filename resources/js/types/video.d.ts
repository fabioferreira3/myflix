export interface VideoMetadata {
    title?: string;
    author?: string;
    date?: string;
    participants?: string[];
    tags?: string[];
    [key: string]: unknown;
}

export interface Video {
    id: string;
    title: string;
    thumbnail_url: string;
    language: string;
    url: string;
    transcription: string;
    diarization_text: string;
    metadata: VideoMetadata;
    audio_file_path: string;
    hls_path: string | null;
    conversion_progress: number;
    hls_playlist_url: string | null;
}
