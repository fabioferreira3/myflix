import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Get Baron session ID from URL and add it to all requests
const urlParams = new URLSearchParams(window.location.search);
const baronSessionId = urlParams.get('baron_session_id');

if (baronSessionId) {
    // Store it globally for access
    (window as any).baronSessionId = baronSessionId;

    // Add to all axios requests
    window.axios.interceptors.request.use((config) => {
        // Add baron_session_id to all requests
        if (!config.params) {
            config.params = {};
        }
        config.params.baron_session_id = baronSessionId;
        return config;
    });

    // Intercept fetch requests (used by Inertia)
    const originalFetch = window.fetch;
    window.fetch = function (...args: any[]) {
        let [resource, config] = args;

        console.log('Fetch intercepted:', resource);

        if (typeof resource === 'string') {
            const url = new URL(resource, window.location.origin);
            if (!url.searchParams.has('baron_session_id')) {
                url.searchParams.set('baron_session_id', baronSessionId);
                console.log('Added baron_session_id to URL:', url.toString());
            }
            resource = url.toString();
        } else if (resource instanceof Request) {
            // Handle Request objects
            const url = new URL(resource.url);
            if (!url.searchParams.has('baron_session_id')) {
                url.searchParams.set('baron_session_id', baronSessionId);
                console.log(
                    'Added baron_session_id to Request:',
                    url.toString(),
                );
                resource = new Request(url.toString(), resource);
            }
        }

        return originalFetch(resource, config);
    };

    console.log('Baron session ID interceptor installed:', baronSessionId);
}
