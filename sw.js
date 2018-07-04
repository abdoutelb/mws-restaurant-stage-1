var dataCacheName = 'restaurant-v1';
var cacheName = 'restaurant-app-1';

console.log("inside.");

// items to be caches
var cachedItems = [
    '/',
    '/dist/dbhelper-min.js',
    '/dist/main-min.js',
    '/dist/restaurant_info-min.js',
    '/css/styles-min.css',
  '/img/1.jpg',
  '/img/2.jpg',
  '/img/3.jpg',
  '/img/4.jpg',
  '/img/5.jpg',
  '/img/6.jpg',
  '/img/7.jpg',
  '/img/8.jpg',
  '/img/9.jpg',
  '/img/10.jpg',
  'index.html',
  'restaurant.html',
];

// when sw install
self.addEventListener('install', function (e) {
    e.waitUntil(caches.open(cacheName).then(function (cache) {
        return cache.addAll(cachedItems);
    }));
});

//when sw activate
// self.addEventListener('activate', function (e) {
//     e.waitUntil(caches.keys().then(function (keyList) {
//         return Promise.all(keyList.map(function (key) {
//             if (key !== cacheName && key !== dataCacheName) {
//                 return caches.delete(key);
//             }
//         }));
//     }));
//     return self
//         .clients
//         .claim();
// });

// fetch the cache items
self.addEventListener('fetch', function (event) {
    if (event.request.url.includes('restaurant.html?id=')) {
      const strippedurl = event.request.url.split('?')[0];
      console.log('== event ==', event);
      event.respondWith(
        caches.match(strippedurl)
          .then(function (response) {
          return response || fetch(event.response);
        })
      );
      console.log('== caches ==', caches);
      return;
    }
    event.respondWith(
      caches.match(event.request)
        .then(function (response) {
        return response || fetch(event.request);
      })
    );
  });

// self.addEventListener('fetch', function (e) {

//     const url = new URL(e.request.url);

//     if (url.pathname.startsWith('/restaurant.html')) {
//         e.respondWith(caches.match('restaurant.html').then(response => response || fetch(e.request)));
//         return;
//     }

//     if (e.pathname === '/') {
//         e.respondWith(caches.open(dataCacheName).then(function (cache) {
//             return fetch(e.request).then(function (response) {
//                 cache.put(e.request.url, response.clone());
//                 return response;
//             });
//         }));
//     } else {
//         e.respondWith(caches.match(e.request).then(function (response) {
//             return response || fetch(e.request);
//         }));
//     }

    
// });
