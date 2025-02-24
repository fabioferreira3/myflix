import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Segment } from '@/types/segment';
import { Video } from '@/types/video';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import Select from 'react-select';
import { toast } from 'react-toastify';

interface VideoShowProps {
    video: Video;
}

export default function VideoShow({ video }: VideoShowProps) {
    const { segments }: any = usePage().props;
    const [showTranscription, setShowTranscription] = useState(false);
    const { post, processing } = useForm({ ...video });
    const { post: postSegment, setData } = useForm<any>({ segment_ids: [] });

    const transcription = video.diarization_text ?? video.transcription;
    const previewLength = 50;

    const getPreviewText = (text: string) => {
        const words = text.split(' ');
        if (words.length <= previewLength) return text;
        return words.slice(0, previewLength).join(' ') + '...';
    };

    const handleTranscription = () => {
        post(route('videos.transcript', video.id), {
            preserveScroll: true,
            preserveUrl: true,
            onSuccess: () => {
                toast.success('Transcription queued!');
            },
            onError: () => {
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

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    {video.title}
                </h2>
            }
        >
            <Head title={video.title} />

            <div className="mx-auto">
                <div className="flex gap-4">
                    <div className="relative w-2/3">
                        <video
                            className="h-auto w-full rounded-lg"
                            controls
                            poster={video.thumbnail_url}
                        >
                            <source
                                src={route('videos.stream', video.id)}
                                type="video/mp4"
                            />
                            Your browser does not support the video tag.
                        </video>
                    </div>
                    <div className="flex flex-1 flex-col rounded-lg bg-gray-700 p-4">
                        <div className="flex items-center gap-2">
                            <div>Author:</div>
                            <div>Fabio</div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div>Date:</div>
                            <div>01/05/2024</div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div>Segments:</div>
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
                    {video.metadata && video.metadata.title && (
                        <div className="flex flex-col gap-4">
                            <h2 className="text-xl font-bold text-white">
                                Title: {video.metadata.title}
                            </h2>
                        </div>
                    )}
                    {video.metadata && video.metadata.summary && (
                        <div className="flex flex-col gap-4">
                            <h2 className="text-xl font-bold text-white">
                                Summary
                            </h2>
                            <div className="text-white">
                                {video.metadata.summary}
                            </div>
                        </div>
                    )}
                    {video.metadata && video.metadata.key_sentences && (
                        <div className="flex flex-col gap-4 border-b border-t border-gray-400 p-4">
                            <h2 className="text-xl font-bold text-white">
                                Key Sentences:
                            </h2>
                            <ul className="list-disc">
                                {video.metadata.key_sentences.map(
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
                        </>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
