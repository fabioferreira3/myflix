import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Configure CSRF token for axios requests
// Use X-XSRF-TOKEN header which Laravel reads from XSRF-TOKEN cookie
const token = document.head.querySelector(
    'meta[name="csrf-token"]',
) as HTMLMetaElement;
if (token) {
    // Set both headers for compatibility
    window.axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
    window.axios.defaults.headers.common['X-XSRF-TOKEN'] = token.content;
    console.log('✓ CSRF token configured for axios');
} else {
    console.error('✗ CSRF token not found in meta tag');
}

// Intercept all fetch requests (used by Inertia) to add CSRF token
const originalFetch = window.fetch;
window.fetch = function (...args: any[]) {
    let [resource, config] = args;

    console.log('📡 Fetch intercepted:', resource);

    // Handle Request objects differently
    if (resource instanceof Request) {
        // Clone the request to modify headers
        const headers = new Headers(resource.headers);

        // Add CSRF token - Laravel accepts both X-CSRF-TOKEN and X-XSRF-TOKEN
        const csrfToken = document.head.querySelector(
            'meta[name="csrf-token"]',
        ) as HTMLMetaElement;
        if (
            csrfToken &&
            !headers.has('X-CSRF-TOKEN') &&
            !headers.has('X-XSRF-TOKEN')
        ) {
            // Set both headers for maximum compatibility
            headers.set('X-CSRF-TOKEN', csrfToken.content);
            headers.set('X-XSRF-TOKEN', csrfToken.content);
            console.log('✓ Added CSRF tokens to Request object');
        } else if (!csrfToken) {
            console.error('✗ CSRF token not found when intercepting Request');
        } else {
            console.log('ℹ️ CSRF token already present in Request');
        }

        // Create new request with modified headers
        resource = new Request(resource.url, {
            method: resource.method,
            headers: headers,
            body: resource.body,
            mode: resource.mode,
            credentials: resource.credentials,
            cache: resource.cache,
            redirect: resource.redirect,
            referrer: resource.referrer,
            integrity: resource.integrity,
        });

        return originalFetch(resource);
    }

    // Handle string URLs with config object
    if (!config) {
        config = {};
    }
    if (!config.headers) {
        config.headers = {};
    }

    // Add CSRF token to headers - set both for compatibility
    const csrfToken = document.head.querySelector(
        'meta[name="csrf-token"]',
    ) as HTMLMetaElement;
    if (csrfToken) {
        if (
            !config.headers['X-CSRF-TOKEN'] &&
            !config.headers['x-csrf-token']
        ) {
            config.headers['X-CSRF-TOKEN'] = csrfToken.content;
        }
        if (
            !config.headers['X-XSRF-TOKEN'] &&
            !config.headers['x-xsrf-token']
        ) {
            config.headers['X-XSRF-TOKEN'] = csrfToken.content;
        }
        console.log('✓ Added CSRF tokens to fetch config');
    } else {
        console.error('✗ CSRF token not found when intercepting fetch');
    }

    return originalFetch(resource, config);
};
