var dataCacheName = 'restaurant-v2';
var cacheName = 'restaurant-app-2';

console.log("inside.");

// items to be caches
var cachedItems = [
  '/',
  '/js/dbhelper.js',
  '/js/main.js',
  '/js/restaurant_info.js',
  '/css/styles.css',
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
  '/img/res.png',
  'index.html',
  'restaurant.html'
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
    event.respondWith(
      caches.match(event.request,{ignoreSearch : true})
        .then(function (response) {
        return response || fetch(event.request);
      })
    );
  });