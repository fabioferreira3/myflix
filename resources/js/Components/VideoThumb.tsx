import { Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { FaClock, FaFileAlt, FaRobot, FaSave } from 'react-icons/fa';
import { toast } from 'react-toastify';

import { useOutsideClick } from '@/hooks/useOutsideClick';
import { Video } from '@/types/video';

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
            <div className="relative h-[200px]">
                <Link
                    href={route('videos.show', video.id)}
                    className="absolute inset-0 h-full"
                >
                    <img
                        alt={video.title}
                        src={video.thumbnail_url}
                        className="h-full w-full object-cover"
                    />
                </Link>

                <div className="text-whit2 absolute right-0 flex gap-2 p-2 text-white">
                    {video.transcription && (
                        <div>
                            <FaFileAlt />
                        </div>
                    )}
                    {video.diarization_text && (
                        <div>
                            <FaRobot />
                        </div>
                    )}
                </div>
            </div>
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
