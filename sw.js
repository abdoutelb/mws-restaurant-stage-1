var dataCacheName = 'restaurant-v1';
var cacheName = 'restaurant-app';

console.log("inside.");

// items to be caches
var cachedItems = [
    'index.html',
    'restaurant.html',
    'css/styles.css',
    'js/main.js',
    'js/dbhelper.js',
    'js/restaurant_info.js',
];

// when sw install
self.addEventListener('install', function (e) {
    e.waitUntil(caches.open(cacheName).then(function (cache) {
        return cache.addAll(cachedItems);
    }));
});

// when sw activate
self.addEventListener('activate', function (e) {
    e.waitUntil(caches.keys().then(function (keyList) {
        return Promise.all(keyList.map(function (key) {
            if (key !== cacheName && key !== dataCacheName) {
                return caches.delete(key);
            }
        }));
    }));
    return self
        .clients
        .claim();
});

// fetch the cache items
self.addEventListener('fetch', function (e) {

    const url = new URL(e.request.url);

    if (url.pathname.startsWith('/restaurant.html')) {
        e.respondWith(caches.match('restaurant.html').then(response => response || fetch(e.request)));
        return;
    }

    if (e.pathname === '/') {
        e.respondWith(caches.open(dataCacheName).then(function (cache) {
            return fetch(e.request).then(function (response) {
                cache.put(e.request.url, response.clone());
                return response;
            });
        }));
    } else {
        e.respondWith(caches.match(e.request).then(function (response) {
            return response || fetch(e.request);
        }));
    }

    
});
