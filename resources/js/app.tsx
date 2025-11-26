import '../css/app.css';
import './bootstrap';

import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { ToastContainer } from 'react-toastify';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// Get Baron session ID from initial URL
const baronSessionId = new URLSearchParams(window.location.search).get(
    'baron_session_id',
);
console.log('MyFlix app.tsx - Baron session ID:', baronSessionId);

// Set up Inertia router to preserve baron_session_id on all visits
if (baronSessionId) {
    router.on('before', (event) => {
        console.log('Inertia navigation before:', event.detail.visit.url);

        // Preserve baron_session_id in all Inertia visits
        try {
            const url = new URL(
                event.detail.visit.url.href || event.detail.visit.url,
                window.location.origin,
            );

            if (!url.searchParams.has('baron_session_id')) {
                url.searchParams.set('baron_session_id', baronSessionId);
                event.detail.visit.url = url;
                console.log('Added baron_session_id to navigation:', url.href);
            }
        } catch (error) {
            console.error('Error adding baron_session_id:', error);
        }
    });

    // Notify Baron (parent window) of URL changes
    router.on('navigate', (event) => {
        // Check if page exists
        if (!event.detail.page) {
            console.warn('Navigate event fired but page is null');
            return;
        }

        // event.detail.page.url is the full URL, extract the pathname
        let path: string;
        try {
            // If it's an absolute URL
            path = new URL(event.detail.page.url, window.location.origin)
                .pathname;
        } catch {
            // If it's already a pathname
            path = event.detail.page.url || window.location.pathname;
        }

        console.log('MyFlix navigated to:', path);

        // Send message to parent (Baron)
        if (window.parent !== window) {
            window.parent.postMessage(
                {
                    type: 'url-change',
                    path: path,
                },
                '*',
            ); // In production, use specific origin
        }
    });
}

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob('./Pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <>
                <App {...props} />
                <ToastContainer theme="dark" />
            </>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});
