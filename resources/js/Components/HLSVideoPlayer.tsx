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

        // Get baron session ID from global window object
        const baronSessionId = (window as any).baronSessionId;

        // Helper function to append baron_session_id to URLs
        const appendSessionId = (url: string): string => {
            if (baronSessionId && !url.includes('baron_session_id=')) {
                const separator = url.includes('?') ? '&' : '?';
                return `${url}${separator}baron_session_id=${baronSessionId}`;
            }
            return url;
        };

        // If HLS is available and supported
        if (hlsPlaylistUrl && Hls.isSupported()) {
            const hls = new Hls({
                enableWorker: false,
            });

            hlsRef.current = hls;
            hls.loadSource(appendSessionId(hlsPlaylistUrl));
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
            video.src = appendSessionId(hlsPlaylistUrl);
        }
        // If no HLS available, fallback to regular MP4 streaming
        else {
            const streamUrl = route('videos.stream', videoId);
            video.src = appendSessionId(streamUrl);
        }

        return () => {
            if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
            }
        };
    }, [hlsPlaylistUrl, videoId]);

    // Get baron session ID for fallback source
    const baronSessionId = (window as any).baronSessionId;
    const fallbackSrc = (() => {
        const streamUrl = route('videos.stream', videoId);
        if (baronSessionId && !streamUrl.includes('baron_session_id=')) {
            const separator = streamUrl.includes('?') ? '&' : '?';
            return `${streamUrl}${separator}baron_session_id=${baronSessionId}`;
        }
        return streamUrl;
    })();

    return (
        <video
            ref={videoRef}
            className={className}
            controls
            poster={posterUrl}
            preload="metadata"
        >
            {/* Fallback source for browsers without HLS support */}
            {!hlsPlaylistUrl && <source src={fallbackSrc} type="video/mp4" />}
            Your browser does not support the video tag.
        </video>
    );
}
