import Pagination from '@/Components/Pagination';
import VideoThumb from '@/Components/VideoThumb';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

interface CollectionPageProps {
    title: string;
    routeName: string;
    videos: any;
    query: string;
}

export default function CollectionPage({ title, routeName, videos, query }: CollectionPageProps) {
    const [search, setSearch] = useState(query || '');

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        router.get(route(routeName), { query: search }, { preserveState: true });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    {title}
                </h2>
            }
        >
            <Head title={title} />

            <div className="mx-auto">
                <div className="bg-white p-4 shadow sm:rounded-t-lg dark:bg-neutral-900">
                    <form
                        onSubmit={handleSearch}
                        className="flex items-center space-x-2"
                    >
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
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
                    <Pagination links={videos.links} />
                    <div className="grid grid-cols-4 gap-4 p-4">
                        {videos.data.map((video: any) => (
                            <VideoThumb key={video.id} video={video} />
                        ))}
                    </div>
                    <Pagination links={videos.links} />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
