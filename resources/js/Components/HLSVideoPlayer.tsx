import Hls from 'hls.js';
import { useEffect, useRef } from 'react';

interface HLSVideoPlayerProps {
    videoId: string;
    hlsPlaylistUrl: string | null;
    posterUrl?: string;
    className?: string;
}

export default function HLSVideoPlayer({
    videoId,
    hlsPlaylistUrl,
    posterUrl,
    className = '',
}: HLSVideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<Hls | null>(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        // If HLS is available and supported
        if (hlsPlaylistUrl && Hls.isSupported()) {
            const hls = new Hls({
                enableWorker: false,
            });

            hlsRef.current = hls;
            hls.loadSource(hlsPlaylistUrl);
            hls.attachMedia(video);

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                console.log('HLS manifest loaded, found levels:', hls.levels);
            });

            hls.on(Hls.Events.ERROR, (event, data) => {
                console.error('HLS error:', data);
                if (data.fatal) {
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            console.log('Network error, try to recover');
                            hls.startLoad();
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            console.log('Media error, try to recover');
                            hls.recoverMediaError();
                            break;
                        default:
                            console.log('Fatal error, cannot recover');
                            hls.destroy();
                            break;
                    }
                }
            });

            return () => {
                if (hlsRef.current) {
                    hlsRef.current.destroy();
                    hlsRef.current = null;
                }
            };
        }
        // Fallback for browsers that support HLS natively (like Safari)
        else if (
            hlsPlaylistUrl &&
            video.canPlayType('application/vnd.apple.mpegurl')
        ) {
            video.src = hlsPlaylistUrl;
        }
        // If no HLS available, fallback to regular MP4 streaming
        else {
            video.src = route('videos.stream', videoId);
        }

        return () => {
            if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
            }
        };
    }, [hlsPlaylistUrl, videoId]);

    return (
        <video
            ref={videoRef}
            className={className}
            controls
            poster={posterUrl}
            preload="metadata"
        >
            {/* Fallback source for browsers without HLS support */}
            {!hlsPlaylistUrl && (
                <source
                    src={route('videos.stream', videoId)}
                    type="video/mp4"
                />
            )}
            Your browser does not support the video tag.
        </video>
    );
}
