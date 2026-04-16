import HLSVideoPlayer from '@/Components/HLSVideoPlayer';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Segment } from '@/types/segment';
import { Video } from '@/types/video';
import { checkWhisperHealth } from '@/utils/whisper';
import { Head, useForm, usePage } from '@inertiajs/react';
import { KeyboardEvent, useState } from 'react';
import {
    FaArrowLeft,
    FaClock,
    FaPencilAlt,
    FaSave,
    FaTimes,
} from 'react-icons/fa';
import Select from 'react-select';
import { toast } from 'react-toastify';

interface VideoShowProps {
    video: Video;
}

export default function VideoShow({ video }: VideoShowProps) {
    const { segments }: any = usePage().props;
    const [showTranscription, setShowTranscription] = useState(false);
    const [editingMetadata, setEditingMetadata] = useState(false);
    const [participantInput, setParticipantInput] = useState('');
    const [tagInput, setTagInput] = useState('');

    const { post, processing } = useForm({
        language: video.language ?? 'pt',
    });
    const { post: postSegment, setData } = useForm<any>({ segment_ids: [] });

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
                setEditingMetadata(false);
            },
            onError: () => {
                toast.error('Failed to update metadata');
            },
        });
    };

    const transcription = video.diarization_text ?? video.transcription;
    const previewLength = 50;

    const getPreviewText = (text: string) => {
        const words = text.split(' ');
        if (words.length <= previewLength) return text;
        return words.slice(0, previewLength).join(' ') + '...';
    };

    const handleTranscription = async () => {
        const isHealthy = await checkWhisperHealth();
        if (!isHealthy) {
            toast.error(
                'Whisper service is unavailable. Please try again later.',
            );
            return;
        }
        post(route('videos.transcript', video.id), {
            preserveScroll: true,
            preserveUrl: true,
            onSuccess: () => {
                toast.success('Transcription queued!');
            },
            onError: (err: any) => {
                console.log(err);
                toast.error('Failed to transcribe video');
            },
        });
    };

    const handleAIAnalysis = () => {
        post(route('videos.ai-analysis', video.id), {
            preserveScroll: true,
            preserveUrl: true,
            onSuccess: () => {
                toast.success('Analysis completed');
            },
            onError: () => {
                toast.error('Failed to analyze video');
            },
        });
    };

    const handleTranslation = () => {
        post(route('videos.translate', video.id), {
            preserveScroll: true,
            preserveUrl: true,
            onSuccess: () => {
                toast.success('Translation completed');
            },
            onError: () => {
                toast.error('Failed to translate video');
            },
        });
    };

    const handleAudioDownload = () => {
        const baronSessionId = (window as any).baronSessionId;
        let url = `/videos/download-audio/${video.id}`;
        if (baronSessionId) {
            url += `?baron_session_id=${baronSessionId}`;
        }
        window.location.href = url;
    };

    const handleHLSConversion = () => {
        post(route('videos.convert-hls', video.id), {
            preserveScroll: true,
            preserveUrl: true,
            onSuccess: () => {
                toast.success('HLS conversion started!');
            },
            onError: () => {
                toast.error('Failed to start HLS conversion');
            },
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-gray-500 transition hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                        aria-label="Go back"
                    >
                        <FaArrowLeft className="text-xs" />
                        Back
                    </button>
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        {video.title}
                    </h2>
                </div>
            }
        >
            <Head title={video.title} />

            <div className="mx-auto">
                <div className="flex gap-4">
                    <div className="relative w-2/3">
                        <HLSVideoPlayer
                            videoId={video.id}
                            hlsPlaylistUrl={video.hls_playlist_url}
                            posterUrl={video.thumbnail_url}
                            className="h-auto w-full rounded-lg"
                        />
                    </div>
                    <div className="flex flex-1 flex-col gap-4 rounded-lg bg-gray-700 p-4">
                        {!editingMetadata ? (
                            <>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-gray-300">
                                        Metadata
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setEditingMetadata(true)}
                                        className="flex items-center gap-1 rounded bg-gray-600 px-2 py-1 text-xs text-gray-300 hover:bg-gray-500 hover:text-white"
                                    >
                                        <FaPencilAlt size={10} /> Edit
                                    </button>
                                </div>
                                <div className="flex flex-col gap-2 text-sm">
                                    <div className="flex gap-2">
                                        <span className="text-gray-400">
                                            Author:
                                        </span>
                                        <span className="text-white">
                                            {video.metadata?.author || (
                                                <span className="italic text-gray-500">
                                                    —
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="text-gray-400">
                                            Date:
                                        </span>
                                        <span className="text-white">
                                            {video.metadata?.date || (
                                                <span className="italic text-gray-500">
                                                    —
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                    {video.metadata?.participants &&
                                        video.metadata.participants.length >
                                            0 && (
                                            <div className="flex flex-col gap-1">
                                                <span className="text-gray-400">
                                                    Participants:
                                                </span>
                                                <div className="flex flex-wrap gap-1">
                                                    {video.metadata.participants.map(
                                                        (p) => (
                                                            <span
                                                                key={p}
                                                                className="rounded-full bg-gray-600 px-2 py-0.5 text-xs text-white"
                                                            >
                                                                {p}
                                                            </span>
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    {video.metadata?.tags &&
                                        video.metadata.tags.length > 0 && (
                                            <div className="flex flex-col gap-1">
                                                <span className="text-gray-400">
                                                    Tags:
                                                </span>
                                                <div className="flex flex-wrap gap-1">
                                                    {video.metadata.tags.map(
                                                        (t) => (
                                                            <span
                                                                key={t}
                                                                className="rounded-full bg-purple-800 px-2 py-0.5 text-xs text-white"
                                                            >
                                                                {t}
                                                            </span>
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-gray-300">
                                        Edit Metadata
                                    </span>
                                    <button
                                        type="button"
                                        title="Cancel editing"
                                        onClick={() =>
                                            setEditingMetadata(false)
                                        }
                                        className="text-gray-400 hover:text-white"
                                    >
                                        <FaTimes size={14} />
                                    </button>
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-semibold text-gray-300">
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
                                        className="rounded bg-gray-600 px-3 py-1.5 text-sm text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-semibold text-gray-300">
                                        Date
                                    </label>
                                    <input
                                        type="date"
                                        title="date"
                                        value={metadataData.date}
                                        onChange={(e) =>
                                            setMetadataData(
                                                'date',
                                                e.target.value,
                                            )
                                        }
                                        className="rounded bg-gray-600 px-3 py-1.5 text-sm text-white outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-semibold text-gray-300">
                                        Participants
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={participantInput}
                                            onChange={(e) =>
                                                setParticipantInput(
                                                    e.target.value,
                                                )
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
                                            placeholder="Name, press Enter"
                                            className="flex-1 rounded bg-gray-600 px-3 py-1.5 text-sm text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={addParticipant}
                                            className="rounded bg-purple-600 px-2 py-1.5 text-sm hover:bg-purple-500"
                                        >
                                            Add
                                        </button>
                                    </div>
                                    {metadataData.participants.length > 0 && (
                                        <div className="mt-1 flex flex-wrap gap-1">
                                            {metadataData.participants.map(
                                                (p, i) => (
                                                    <span
                                                        key={i}
                                                        className="flex items-center gap-1 rounded-full bg-gray-600 px-2 py-0.5 text-xs"
                                                    >
                                                        {p}
                                                        <button
                                                            type="button"
                                                            title="Remove"
                                                            onClick={() =>
                                                                removeParticipant(
                                                                    i,
                                                                )
                                                            }
                                                            className="text-gray-400 hover:text-white"
                                                        >
                                                            <FaTimes size={8} />
                                                        </button>
                                                    </span>
                                                ),
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-semibold text-gray-300">
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
                                            placeholder="Tag, press Enter"
                                            className="flex-1 rounded bg-gray-600 px-3 py-1.5 text-sm text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={addTag}
                                            className="rounded bg-purple-600 px-2 py-1.5 text-sm hover:bg-purple-500"
                                        >
                                            Add
                                        </button>
                                    </div>
                                    {metadataData.tags.length > 0 && (
                                        <div className="mt-1 flex flex-wrap gap-1">
                                            {metadataData.tags.map((t, i) => (
                                                <span
                                                    key={i}
                                                    className="flex items-center gap-1 rounded-full bg-purple-800 px-2 py-0.5 text-xs"
                                                >
                                                    {t}
                                                    <button
                                                        type="button"
                                                        title="Remove"
                                                        onClick={() =>
                                                            removeTag(i)
                                                        }
                                                        className="text-purple-300 hover:text-white"
                                                    >
                                                        <FaTimes size={8} />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end gap-2 pt-1">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setEditingMetadata(false)
                                        }
                                        className="rounded bg-gray-600 px-3 py-1.5 text-sm hover:bg-gray-500"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        disabled={isUpdatingMetadata}
                                        onClick={handleMetadataSubmit}
                                        className="flex items-center gap-1.5 rounded bg-purple-600 px-3 py-1.5 text-sm hover:bg-purple-500 disabled:opacity-50"
                                    >
                                        {isUpdatingMetadata ? (
                                            <>
                                                <FaClock size={12} /> Saving...
                                            </>
                                        ) : (
                                            <>
                                                <FaSave size={12} /> Save
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col gap-2 border-t border-gray-600 pt-3">
                            <div className="text-sm text-gray-400">
                                Segments:
                            </div>
                            <Select
                                isMulti
                                isSearchable
                                onChange={(selected) => {
                                    setData({
                                        segment_ids: selected.map(
                                            (s: any) => s.value,
                                        ),
                                    });
                                    postSegment(
                                        route(
                                            'videos.assign-segments',
                                            video.id,
                                        ),
                                    );
                                }}
                                options={segments.data.map(
                                    (segment: Segment) => {
                                        return {
                                            value: segment.id,
                                            label: segment.title,
                                        };
                                    },
                                )}
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-4 flex justify-end gap-4">
                    {video.language == 'en' && (
                        <button
                            disabled={processing}
                            onClick={handleTranslation}
                            className="rounded bg-gray-700 px-4 py-1 text-white"
                        >
                            Translate
                        </button>
                    )}
                    {video.audio_file_path && (
                        <button
                            onClick={handleAudioDownload}
                            className="rounded bg-gray-700 px-4 py-1 text-white"
                        >
                            Download Audio
                        </button>
                    )}
                    {!video.hls_playlist_url && (
                        <button
                            disabled={processing}
                            onClick={handleHLSConversion}
                            className="rounded bg-blue-600 px-4 py-1 text-white disabled:opacity-50"
                        >
                            {processing ? 'Please wait...' : 'Convert to HLS'}
                        </button>
                    )}
                    {!video.transcription && (
                        <button
                            disabled={processing}
                            onClick={handleTranscription}
                            className="rounded bg-gray-700 px-4 py-1 text-white"
                        >
                            {processing ? 'Please wait...' : 'Transcribe Video'}
                        </button>
                    )}
                    {video.diarization_text &&
                        (!video.metadata ||
                            Object.keys(video.metadata).length === 0) && (
                            <button
                                disabled={processing}
                                onClick={handleAIAnalysis}
                                className="rounded bg-gray-600 px-4 py-1 text-white"
                            >
                                {processing
                                    ? 'Please wait...'
                                    : 'Analyze Transcription'}
                            </button>
                        )}
                </div>
                <div className="flex flex-col gap-6 px-4 py-6">
                    {video.metadata && !!video.metadata.title && (
                        <div className="flex flex-col gap-4">
                            <h2 className="text-xl font-bold text-white">
                                Title: {video.metadata.title as string}
                            </h2>
                        </div>
                    )}
                    {video.metadata && !!video.metadata.summary && (
                        <div className="flex flex-col gap-4">
                            <h2 className="text-xl font-bold text-white">
                                Summary
                            </h2>
                            <div className="text-white">
                                {video.metadata.summary as string}
                            </div>
                        </div>
                    )}
                    {video.metadata && !!video.metadata.key_sentences && (
                        <div className="flex flex-col gap-4 border-b border-t border-gray-400 p-4">
                            <h2 className="text-xl font-bold text-white">
                                Key Sentences:
                            </h2>
                            <ul className="list-disc">
                                {(video.metadata.key_sentences as string[]).map(
                                    (sentence: string) => (
                                        <li
                                            key={sentence}
                                            className="text-white"
                                        >
                                            {sentence}
                                        </li>
                                    ),
                                )}
                            </ul>
                        </div>
                    )}
                    {video.transcription && (
                        <>
                            <div className="flex items-center gap-4">
                                <h2 className="text-xl font-bold text-white">
                                    Full Transcription
                                </h2>
                                {showTranscription && (
                                    <button
                                        className="rounded bg-gray-600 px-4 py-1 text-white"
                                        onClick={() =>
                                            setShowTranscription(false)
                                        }
                                    >
                                        Hide
                                    </button>
                                )}
                            </div>
                            <div
                                className="flex flex-col gap-6 text-white"
                                dangerouslySetInnerHTML={{
                                    __html: showTranscription
                                        ? transcription
                                        : getPreviewText(transcription),
                                }}
                            />
                            {!showTranscription && (
                                <button
                                    onClick={() => setShowTranscription(true)}
                                    className="self-start rounded bg-gray-600 px-4 py-1 text-white"
                                >
                                    View Transcription
                                </button>
                            )}
                            {video.metadata.translations &&
                                (
                                    video.metadata.translations as {
                                        language: string;
                                        text: string;
                                    }[]
                                ).length > 0 && (
                                    <div className="flex flex-col gap-4 border-b border-t border-gray-400 p-4">
                                        <h2 className="text-xl font-bold text-white">
                                            Translations
                                        </h2>
                                        {(
                                            video.metadata.translations as {
                                                language: string;
                                                text: string;
                                            }[]
                                        ).map(
                                            (translation: {
                                                language: string;
                                                text: string;
                                            }) => {
                                                return (
                                                    <div
                                                        key={
                                                            translation.language
                                                        }
                                                    >
                                                        <h3 className="text-white">
                                                            {
                                                                translation.language
                                                            }
                                                        </h3>
                                                        <div className="text-white">
                                                            {translation.text}
                                                        </div>
                                                    </div>
                                                );
                                            },
                                        )}
                                    </div>
                                )}
                        </>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
