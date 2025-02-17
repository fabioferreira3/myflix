interface Video {
    id: number;
    title: string;
    thumbnail_url: string;
}

interface VideoThumbProps {
    video: Video;
}

export default function VideoThumb({ video }: VideoThumbProps) {
    return (
        <div className="rounded-md border p-4 shadow-sm">
            <img src={video.thumbnail_url} />
            <h3 className="font-bold">{video.title}</h3>
        </div>
    );
}
