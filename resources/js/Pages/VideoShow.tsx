import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Video } from '@/types/video';
import { Head } from '@inertiajs/react';

interface VideoShowProps {
    video: Video;
}

export default function VideoShow({ video }: VideoShowProps) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Video Show
                </h2>
            }
        >
            <Head title={video.title} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <video
                        width="640"
                        height="360"
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
            </div>
        </AuthenticatedLayout>
    );
}
