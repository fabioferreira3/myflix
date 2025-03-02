import { Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { BsThreeDotsVertical as DotsIcon } from 'react-icons/bs';
import { FaClock, FaFileAlt, FaRobot, FaSave } from 'react-icons/fa';
import { toast } from 'react-toastify';

import { useOutsideClick } from '@/hooks/useOutsideClick';
import { Video } from '@/types/video';
import Modal from './Modal';

interface VideoThumbProps {
    video: Video;
}

export default function VideoThumb({ video }: VideoThumbProps) {
    const [editing, setEditing] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showTranscribeModal, setShowTranscribeModal] = useState(false);
    const { innerBorderRef } = useOutsideClick(() => setEditing(false));
    const { innerBorderRef: innerMenuBorderRef } = useOutsideClick(() =>
        setShowMenu(false),
    );
    const {
        data: videoData,
        setData: setVideoData,
        post: postUpdate,
        processing: isUpdating,
    } = useForm({ ...video });

    const {
        data: transcribeData,
        setData: setTranscribeData,
        post: postTranscribe,
        processing: isTranscribing,
    } = useForm({
        expected_speakers: 1,
        language: 'pt',
    });

    const handleUpdate = () => {
        postUpdate(route('videos.update', video.id), {
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

    const handleAnalyze = () => {
        postUpdate(route('videos.ai-analysis', video.id), {
            preserveScroll: true,
            preserveUrl: true,
            onSuccess: () => {
                toast.success('Video analysis completed!');
            },
        });
        toast.info('Analyzing video...');
        setShowMenu(false);
    };

    const handleTranscriptSubmit = () => {
        if (transcribeData.expected_speakers < 1) {
            return toast.error('Expected speakers must be at least 1');
        }
        postTranscribe(route('videos.transcript', video.id), {
            preserveScroll: true,
            preserveUrl: true,
            onSuccess: () => {
                toast.success('Transcription queued!');
                setShowTranscribeModal(false);
            },
        });
    };

    return (
        <div className="flex flex-col rounded border border-gray-500">
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
                    {video.metadata.title && (
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
                    <div className="relative flex w-full items-center justify-between gap-2">
                        <div onClick={() => setEditing(true)}>
                            {video.title}
                        </div>

                        <div className="flex h-full">
                            <button
                                title="menu"
                                type="button"
                                onClick={() => setShowMenu(true)}
                            >
                                <DotsIcon />
                            </button>
                            {showMenu && (
                                <div
                                    ref={innerMenuBorderRef}
                                    className="absolute right-0 top-8 z-50 flex w-48 flex-col rounded-b border-x border-b border-gray-500 bg-gray-700"
                                >
                                    <button
                                        onClick={() => setShowEditModal(true)}
                                        className="p-2 text-end hover:bg-gray-500"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() =>
                                            setShowTranscribeModal(true)
                                        }
                                        className="p-2 text-end hover:bg-gray-500"
                                    >
                                        Transcribe
                                    </button>
                                    {video.transcription && (
                                        <button
                                            className="p-2 text-end hover:bg-gray-500"
                                            onClick={handleAnalyze}
                                        >
                                            Analyze with AI
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
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
                            disabled={isUpdating}
                            onClick={handleUpdate}
                            className="h-full rounded bg-purple-600 p-2"
                        >
                            {!isUpdating && <FaSave />}
                            {isUpdating && <FaClock />}
                        </button>
                    </div>
                )}
            </div>
            {showEditModal && (
                <Modal
                    maxWidth="lg"
                    onClose={() => setShowEditModal(false)}
                    show
                    closeable
                >
                    <div className="bg-gray-300 p-4">eita</div>
                </Modal>
            )}
            {showTranscribeModal && (
                <Modal
                    maxWidth="lg"
                    onClose={() => setShowTranscribeModal(false)}
                    show
                    closeable
                >
                    <div className="bg-gray-300 p-4">
                        <div className="text-xl font-bold">
                            Transcribe: {video.title}
                        </div>
                        <div className="mt-4 flex flex-col gap-2">
                            <div className="flex items-center gap-4">
                                <div>Expected speakers:</div>
                                <input
                                    defaultValue={
                                        transcribeData.expected_speakers
                                    }
                                    name="expected_speakers"
                                    title="expected_speakers"
                                    className="w-12 rounded border-gray-200 px-2 py-1 text-center"
                                    type="number"
                                    onBlur={(e) => {
                                        setTranscribeData({
                                            ...transcribeData,
                                            expected_speakers: parseInt(
                                                e.target.value,
                                            ),
                                        });
                                    }}
                                />
                            </div>
                            <div className="flex items-center gap-4">
                                <div>Language:</div>
                                <select
                                    defaultValue={transcribeData.language}
                                    title="language"
                                    className="rounded border-gray-200 outline-none"
                                    name="language"
                                    onChange={(e: any) => {
                                        setTranscribeData({
                                            ...transcribeData,
                                            language: e.target.value,
                                        });
                                    }}
                                >
                                    <option value="en">English</option>
                                    <option value="pt">Portuguese</option>
                                </select>
                            </div>
                            <div>
                                <button
                                    disabled={isTranscribing}
                                    type="button"
                                    className="rounded bg-gray-600 px-3 py-1 text-white"
                                    onClick={handleTranscriptSubmit}
                                >
                                    {!isTranscribing ? 'Go' : 'Please wait...'}
                                </button>
                            </div>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}
