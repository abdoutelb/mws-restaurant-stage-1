var dataCacheName = 'restaurant-v2';
var cacheName = 'restaurant-app-2';

console.log("inside.");

// items to be caches
var cachedItems = [
  '/restaurants/',
  '/restaurants//js/dbhelper.js',
  '/restaurants//js/main.js',
  '/restaurants//js/restaurant_info.js',
  '/restaurants//css/styles.css',
  '/restaurants//img/1.jpg',
  '/restaurants//img/2.jpg',
  '/restaurants//img/3.jpg',
  '/restaurants//img/4.jpg',
  '/restaurants//img/5.jpg',
  '/restaurants//img/6.jpg',
  '/restaurants//img/7.jpg',
  '/restaurants//img/8.jpg',
  '/restaurants//img/9.jpg',
  '/restaurants//img/10.jpg',
  '/restaurants//img/res.png',
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
