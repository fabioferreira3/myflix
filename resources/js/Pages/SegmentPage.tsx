import VideoThumb from '@/Components/VideoThumb';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Segment } from '@/types/segment';
import { Video } from '@/types/video';
import { Head } from '@inertiajs/react';

interface SegmentPageProps {
    segment: Segment;
    videos: Video[];
}

export default function SegmentPage({ segment, videos }: SegmentPageProps) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    {segment.title}
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="mx-auto">
                {/* Search Form */}
                <div className="bg-white p-4 shadow sm:rounded-t-lg dark:bg-gray-800">
                    <form
                        action={route('videos.search')}
                        method="GET"
                        className="flex items-center space-x-2"
                    >
                        <input
                            type="text"
                            name="query"
                            placeholder="Search..."
                            className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring focus:ring-blue-500 dark:border-gray-600"
                        />
                        <button
                            type="submit"
                            className="rounded-md bg-purple-800 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-500"
                        >
                            Go
                        </button>
                    </form>
                </div>

                <div className="overflow-hidden bg-white shadow-xl sm:rounded-b-lg dark:bg-gray-800">
                    <div className="grid grid-cols-4 gap-4 p-4">
                        {videos.map((video) => (
                            <VideoThumb key={video.id} video={video} />
                        ))}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
