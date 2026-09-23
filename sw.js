/* ==================== sw.js ==================== */
/* Service Worker — يدير الـ caching والـ offline */

const CACHE_NAME = 'matjarna-v1.0.0';
const RUNTIME_CACHE = 'matjarna-runtime-v1';

// ✅ الملفات الأساسية اللي تتحفظ في الـ cache
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

// ===== Install: حفظ الملفات الأساسية =====
self.addEventListener('install', event => {
    console.log('🔧 Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('📦 Pre-caching files...');
                // كل ملف على حدة عشان لو واحد فشل ميكسرش الكل
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

// ===== Activate: مسح الـ caches القديمة =====
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

// ===== Fetch: استراتيجية ذكية =====
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

    // ✅ استراتيجية خاصة: Cache First مع Network Fallback
    // (مناسبة للملفات الثابتة: CSS, JS, Images)
    event.respondWith(
        caches.match(request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    // تحديث في الخلفية (stale-while-revalidate)
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

                // مش موجود في الكاش → جيبه من الشبكة
                return fetch(request)
                    .then(response => {
                        // متحفظش لو مش 200 أو من نوع مش مدعوم
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // احفظه في الـ runtime cache
                        const responseToCache = response.clone();
                        caches.open(RUNTIME_CACHE).then(cache => {
                            cache.put(request, responseToCache);
                        });

                        return response;
                    })
                    .catch(error => {
                        console.warn('⚠️ Fetch failed for:', request.url);
                        
                        // لو الصفحة HTML → ارجع لـ offline page أو index
                        if (request.destination === 'document') {
                            return caches.match('./index.html');
                        }
                        
                        throw error;
                    });
            })
    );
});

// ===== رسالة من الصفحة لتحديث SW =====
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

console.log('✅ Service Worker loaded');