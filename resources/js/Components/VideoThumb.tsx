import { Link, useForm } from '@inertiajs/react';
import { KeyboardEvent, useState } from 'react';
import { BsThreeDotsVertical as DotsIcon } from 'react-icons/bs';
import { FaClock, FaFileAlt, FaRobot, FaSave, FaTimes } from 'react-icons/fa';
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
    const [showMetadataModal, setShowMetadataModal] = useState(false);
    const [participantInput, setParticipantInput] = useState('');
    const [tagInput, setTagInput] = useState('');
    const { innerBorderRef } = useOutsideClick(() => setEditing(false));
    const { innerBorderRef: innerMenuBorderRef } = useOutsideClick(() =>
        setShowMenu(false),
    );
    const {
        data: videoData,
        setData: setVideoData,
        post: postUpdate,
        processing: isUpdating,
    } = useForm({ ...video, metadata: video.metadata as any });

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
        });
        toast.success('Analyzing video...');
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

    const existingMeta = video.metadata ?? {};
    const {
        data: metadataData,
        setData: setMetadataData,
        post: postMetadata,
        processing: isUpdatingMetadata,
    } = useForm({
        author: (existingMeta.author ?? '') as string,
        date: (existingMeta.date ?? '') as string,
        participants: (existingMeta.participants ?? []) as string[],
        tags: (existingMeta.tags ?? []) as string[],
    });

    const addParticipant = () => {
        const value = participantInput.trim();
        if (!value) return;
        setMetadataData('participants', [...metadataData.participants, value]);
        setParticipantInput('');
    };

    const removeParticipant = (index: number) => {
        setMetadataData(
            'participants',
            metadataData.participants.filter((_, i) => i !== index),
        );
    };

    const addTag = () => {
        const value = tagInput.trim();
        if (!value) return;
        setMetadataData('tags', [...metadataData.tags, value]);
        setTagInput('');
    };

    const removeTag = (index: number) => {
        setMetadataData(
            'tags',
            metadataData.tags.filter((_, i) => i !== index),
        );
    };

    const handleMetadataSubmit = () => {
        postMetadata(route('videos.update-metadata', video.id), {
            preserveScroll: true,
            preserveUrl: true,
            onSuccess: () => {
                toast.success('Metadata updated successfully');
                setShowMetadataModal(false);
            },
            onError: () => {
                toast.error('Failed to update metadata');
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
                                    className="absolute bottom-full right-0 z-50 flex w-48 flex-col rounded-t border-x border-b border-t border-gray-500 bg-gray-700"
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
                                    <button
                                        onClick={() => {
                                            setShowMetadataModal(true);
                                            setShowMenu(false);
                                        }}
                                        className="p-2 text-end hover:bg-gray-500"
                                    >
                                        Update Metadata
                                    </button>
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
            {showMetadataModal && (
                <Modal
                    maxWidth="lg"
                    onClose={() => setShowMetadataModal(false)}
                    show
                    closeable
                >
                    <div className="bg-gray-800 p-6 text-white">
                        <div className="mb-5 text-xl font-bold">
                            Update Metadata: {video.title}
                        </div>
                        <div className="flex flex-col gap-5">
                            {/* Author */}
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-semibold text-gray-300">
                                    Author
                                </label>
                                <input
                                    type="text"
                                    value={metadataData.author}
                                    onChange={(e) =>
                                        setMetadataData(
                                            'author',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="e.g. Fabio Ferreira"
                                    className="rounded bg-gray-700 px-3 py-2 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            {/* Date */}
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-semibold text-gray-300">
                                    Date
                                </label>
                                <input
                                    type="date"
                                    title="date"
                                    value={metadataData.date}
                                    onChange={(e) =>
                                        setMetadataData('date', e.target.value)
                                    }
                                    className="rounded bg-gray-700 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            {/* Participants */}
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-semibold text-gray-300">
                                    Participants
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={participantInput}
                                        onChange={(e) =>
                                            setParticipantInput(e.target.value)
                                        }
                                        onKeyDown={(
                                            e: KeyboardEvent<HTMLInputElement>,
                                        ) => {
                                            if (
                                                e.key === 'Enter' ||
                                                e.key === ','
                                            ) {
                                                e.preventDefault();
                                                addParticipant();
                                            }
                                        }}
                                        placeholder="Type name and press Enter"
                                        className="flex-1 rounded bg-gray-700 px-3 py-2 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={addParticipant}
                                        className="rounded bg-purple-600 px-3 py-2 hover:bg-purple-500"
                                    >
                                        Add
                                    </button>
                                </div>
                                {metadataData.participants.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {metadataData.participants.map(
                                            (p, i) => (
                                                <span
                                                    key={i}
                                                    className="flex items-center gap-1 rounded-full bg-gray-600 px-3 py-1 text-sm"
                                                >
                                                    {p}
                                                    <button
                                                        type="button"
                                                        title="Remove participant"
                                                        onClick={() =>
                                                            removeParticipant(i)
                                                        }
                                                        className="ml-1 text-gray-400 hover:text-white"
                                                    >
                                                        <FaTimes size={10} />
                                                    </button>
                                                </span>
                                            ),
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Tags */}
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-semibold text-gray-300">
                                    Tags
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={tagInput}
                                        onChange={(e) =>
                                            setTagInput(e.target.value)
                                        }
                                        onKeyDown={(
                                            e: KeyboardEvent<HTMLInputElement>,
                                        ) => {
                                            if (
                                                e.key === 'Enter' ||
                                                e.key === ','
                                            ) {
                                                e.preventDefault();
                                                addTag();
                                            }
                                        }}
                                        placeholder="Type tag and press Enter"
                                        className="flex-1 rounded bg-gray-700 px-3 py-2 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                    <button
                                        type="button"
                                        className="rounded bg-purple-600 px-3 py-2 hover:bg-purple-500"
                                        onClick={addTag}
                                    >
                                        Add
                                    </button>
                                </div>
                                {metadataData.tags.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {metadataData.tags.map((t, i) => (
                                            <span
                                                key={i}
                                                className="flex items-center gap-1 rounded-full bg-purple-800 px-3 py-1 text-sm"
                                            >
                                                {t}
                                                <button
                                                    type="button"
                                                    title="Remove tag"
                                                    onClick={() => removeTag(i)}
                                                    className="ml-1 text-purple-300 hover:text-white"
                                                >
                                                    <FaTimes size={10} />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Submit */}
                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowMetadataModal(false)}
                                    className="rounded bg-gray-600 px-4 py-2 hover:bg-gray-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    disabled={isUpdatingMetadata}
                                    onClick={handleMetadataSubmit}
                                    className="flex items-center gap-2 rounded bg-purple-600 px-4 py-2 hover:bg-purple-500 disabled:opacity-50"
                                >
                                    {isUpdatingMetadata ? (
                                        <>
                                            <FaClock /> Saving...
                                        </>
                                    ) : (
                                        <>
                                            <FaSave /> Save
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}
