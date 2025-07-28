export interface Video {
    id: string;
    title: string;
    thumbnail_url: string;
    language: string;
    url: string;
    transcription: string;
    diarization_text: string;
    metadata: any;
    audio_file_path: string;
    hls_path: string | null;
    conversion_progress: number;
    hls_playlist_url: string | null;
}
