var dataCacheName = 'res-v1';
var cacheName = 'res-mws';

// items to be caches
var cachedItems = [
    '/',
    '/index.html',
    'css/styles.css',
    'js/dbhelper.js',
    'js/restaurant_info.js',
    'restaurant.html',
];

// when sw install
self.addEventListener('install', function (e) {
    e.waitUntil(
        caches.open(cacheName).then(function (cache) {
            return cache.addAll(cachedItems);
        })
    );
});

// when sw activate
self.addEventListener('activate', function (e) {
    e.waitUntil(
        caches.keys().then(function (keyList) {
            return Promise.all(keyList.map(function (key) {
                if (key !== cacheName && key !== dataCacheName) {
                    return caches.delete(key);
                }
            }));
        })
    );
    return self.clients.claim();
});

// fetch the cache items
self.addEventListener('fetch', function (e) {
    if (e.pathname === '/') {
        e.respondWith(
            caches.open(dataCacheName).then(function (cache) {
                return fetch(e.request).then(function (response) {
                    cache.put(e.request.url, response.clone());
                    return response;
                });
            })
        );
    } else {
        e.respondWith(
            caches.match(e.request).then(function (response) {
                return response || fetch(e.request);
            })
        );
    }
});
