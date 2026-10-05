/* ==================== sw.js ==================== */

const CACHE_NAME = 'matjarna-v1.0.0';
const RUNTIME_CACHE = 'matjarna-runtime-v1';

const PRECACHE_URLS = [
    './',
    './index.html',
    './Pages/products.html',
    './Pages/categories.html',
    './Pages/about.html',
    './Pages/cart.html',
    './Pages/splash.html',
    './Auth/login.html',
    './Auth/register.html',
    './shared/config.js',
    './shared/cart.js',
    './shared/navbar.css',
    './shared/navbar.js',
    './shared/toast.css',
    './shared/toast.js',
    './manifest.json',
    './favicon.svg'
];

self.addEventListener('install', event => {
    console.log('🔧 Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('📦 Pre-caching files...');
                return Promise.allSettled(
                    PRECACHE_URLS.map(url => 
                        cache.add(url).catch(err => {
                            console.warn(`⚠️ Failed to cache ${url}:`, err);
                        })
                    )
                );
            })
            .then(() => {
                console.log('✅ Service Worker: Installed');
                return self.skipWaiting();
            })
    );
});

self.addEventListener('activate', event => {
    console.log('🚀 Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(name => name !== CACHE_NAME && name !== RUNTIME_CACHE)
                        .map(name => {
                            console.log(`🗑️ Deleting old cache: ${name}`);
                            return caches.delete(name);
                        })
                );
            })
            .then(() => {
                console.log('✅ Service Worker: Activated');
                return self.clients.claim();
            })
    );
});

self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // تجاهل الطلبات دي:
    // 1. مش GET
    // 2. Supabase (لازم يكون دايمًا online)
    // 3. Chrome extensions
    if (request.method !== 'GET' ||
        url.hostname.includes('supabase.co') ||
        url.protocol === 'chrome-extension:') {
        return;
    }

    event.respondWith(
        caches.match(request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    fetch(request)
                        .then(response => {
                            if (response && response.status === 200) {
                                caches.open(RUNTIME_CACHE).then(cache => {
                                    cache.put(request, response.clone());
                                });
                            }
                        })
                        .catch(() => { /* offline - مفيش مشكلة */ });
                    
                    return cachedResponse;
                }

                return fetch(request)
                    .then(response => {
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        const responseToCache = response.clone();
                        caches.open(RUNTIME_CACHE).then(cache => {
                            cache.put(request, responseToCache);
                        });

                        return response;
                    })
                    .catch(error => {
                        console.warn('⚠️ Fetch failed for:', request.url);
                        
                        if (request.destination === 'document') {
                            return caches.match('./index.html');
                        }
                        
                        throw error;
                    });
            })
    );
});

self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

console.log('✅ Service Worker loaded');