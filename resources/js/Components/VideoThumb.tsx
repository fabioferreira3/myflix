import { Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { FaClock, FaSave } from 'react-icons/fa';
import { toast } from 'react-toastify';

import { useOutsideClick } from '@/hooks/useOutsideClick';

interface Video {
    id: number;
    title: string;
    thumbnail_url: string;
}

interface VideoThumbProps {
    video: Video;
}

export default function VideoThumb({ video }: VideoThumbProps) {
    const [editing, setEditing] = useState(false);
    const { innerBorderRef } = useOutsideClick(() => setEditing(false));
    const {
        data: videoData,
        setData: setVideoData,
        post,
        processing,
    } = useForm({ ...video });

    const handleUpdate = () => {
        post(route('videos.update', video.id), {
            preserveScroll: true,
            preserveUrl: true,
            onSuccess: () => {
                setEditing(false);
                toast.success('Video updated successfully');
            },
            onError: () => {
                toast.error('Failed to update video');
            },
        });
    };

    return (
        <div className="flex flex-col overflow-hidden rounded border border-gray-500">
            <Link href={route('videos.show', video.id)}>
                <img alt={video.title} src={video.thumbnail_url} />
            </Link>
            <div
                ref={innerBorderRef}
                className="flex flex-grow items-center justify-center bg-gray-600 p-2 text-center font-bold text-white"
            >
                {!editing && (
                    <span onClick={() => setEditing(true)}>{video.title}</span>
                )}
                {editing && (
                    <div className="flex w-full items-center gap-1">
                        <input
                            className="w-full rounded text-xs text-gray-700 outline-none"
                            title={video.title}
                            value={videoData.title}
                            onChange={(e) => {
                                setVideoData({
                                    ...videoData,
                                    title: e.target.value,
                                });
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleUpdate();
                                }
                            }}
                        />
                        <button
                            type="button"
                            disabled={processing}
                            onClick={handleUpdate}
                            className="h-full rounded bg-purple-600 p-2"
                        >
                            {!processing && <FaSave />}
                            {processing && <FaClock />}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
