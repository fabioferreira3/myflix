import VideoThumb from '@/Components/VideoThumb';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'react-toastify';

interface DashboardProps {
    // videos: Video[];
    videos: any;
}

export default function Dashboard({ videos }: DashboardProps) {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('query') || '';

    const [scanning, setScanning] = useState(false);

    const handleScan = () => {
        setScanning(true);
        router.post(
            route('scan'),
            {},
            {
                onSuccess: () =>
                    toast.success('Import & Sync finished successfully.'),
                onError: () =>
                    toast.error('Failed to start the scan. Please try again.'),
                onFinish: () => setScanning(false),
            },
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        Dashboard
                    </h2>
                    <button
                        onClick={handleScan}
                        disabled={scanning}
                        className="rounded-md bg-green-700 px-4 py-2 text-sm text-white hover:bg-green-600 focus:outline-none focus:ring focus:ring-green-500 disabled:opacity-50"
                    >
                        {scanning ? 'Syncing...' : 'Import & Sync'}
                    </button>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="mx-auto">
                {/* Search Form */}
                <div className="bg-white p-4 shadow sm:rounded-t-lg dark:bg-neutral-900">
                    <form
                        action={route('videos.search')}
                        method="GET"
                        className="flex items-center space-x-2"
                    >
                        <input
                            type="text"
                            defaultValue={query}
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

                <div className="overflow-hidden bg-white shadow-xl sm:rounded-b-lg dark:bg-neutral-900">
                    <div className="grid grid-cols-4 gap-4 p-4">
                        {videos.data.map((video) => (
                            <VideoThumb key={video.id} video={video} />
                        ))}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
