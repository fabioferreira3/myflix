// resources/js/Pages/Dashboard.tsx
import VideoThumb from '@/Components/VideoThumb';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

interface DashboardProps {
    videos: {
        id: number;
        title: string;
    }[];
}

export default function Dashboard({ videos }: DashboardProps) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Search Form */}
                    <div className="mt-6 bg-white p-4 shadow sm:rounded-t-lg dark:bg-gray-800">
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
                    {/* Video Grid */}
                    <div className="overflow-hidden bg-white shadow-xl sm:rounded-b-lg dark:bg-gray-800">
                        <div className="grid grid-cols-4 gap-4 p-4">
                            {videos.map((video) => (
                                <VideoThumb key={video.id} video={video} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
