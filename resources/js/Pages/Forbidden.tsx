import { Head } from '@inertiajs/react';

export default function Forbidden({ message }: { message?: string }) {
    return (
        <>
            <Head title="Access Forbidden" />

            <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
                <div className="text-center">
                    <div className="mb-4">
                        <h1 className="text-9xl font-bold text-gray-800 dark:text-gray-200">
                            403
                        </h1>
                    </div>

                    <div className="mb-8">
                        <h2 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-gray-200">
                            Access Forbidden
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            {message ||
                                'You do not have permission to access this resource.'}
                        </p>
                    </div>

                    <div className="text-sm text-gray-500 dark:text-gray-500">
                        <p>
                            Please ensure you are logged in to Baron to access
                            MyFlix.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
