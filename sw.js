// Service Worker for Performance Optimization
const CACHE_NAME = 'portfolio-v2';
const urlsToCache = [
    '/',
    '/index.html',
    '/critical.css',
    '/styles.min.css',
    '/responsive.css',
    '/navigation.js',
    '/performance.js',
    '/Profile.png',
    '/favicon.ico'
];

// Install event - cache resources
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
            .catch(error => {
                console.log('Cache install failed:', error);
            })
    );
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
    const { request } = event;
    if (request.method !== 'GET') return;
    const url = new URL(request.url);
    const isHttp = url.protocol === 'http:' || url.protocol === 'https:';
    if (!isHttp) return;

    const accept = request.headers.get('accept') || '';
    const isHtml = request.destination === 'document' || accept.includes('text/html');

    if (isHtml) {
        event.respondWith(
            fetch(request)
                .then(networkResponse => {
                    const responseToCache = networkResponse.clone();
                    if (url.origin === self.location.origin && networkResponse.status === 200) {
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(request, responseToCache).catch(() => {});
                        });
                    }
                    return networkResponse;
                })
                .catch(() => {
                    return caches.match(request).then(r => r || caches.match('/index.html'));
                })
        );
        return;
    }

    event.respondWith(
        caches.match(request)
            .then(cacheResponse => {
                if (cacheResponse) {
                    return cacheResponse;
                }
                return fetch(request).then(networkResponse => {
                    if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                        return networkResponse;
                    }
                    const responseToCache = networkResponse.clone();
                    if (url.origin === self.location.origin) {
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(request, responseToCache).catch(() => {});
                        });
                    }
                    return networkResponse;
                });
            })
            .catch(() => caches.match('/index.html'))
    );
});

// Background sync for offline form submissions
self.addEventListener('sync', event => {
    if (event.tag === 'backgroundSync') {
        event.waitUntil(doBackgroundSync());
    }
});

async function doBackgroundSync() {
    // Implementation for background sync
    console.log('Background sync triggered');
}

// Push notifications
self.addEventListener('push', event => {
    const options = {
        body: event.data ? event.data.text() : 'New notification',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now()
        }
    };

    event.waitUntil(
        self.registration.showNotification('Portfolio Update', options)
    );
});

// Message handling
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});