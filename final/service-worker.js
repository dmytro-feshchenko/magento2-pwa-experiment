var dataCacheName = 'm2-pwa-cache-data-v2';
var cacheName = 'm2-pwa-cache-v2';
var filesToCache = [
  '/',
  '/index.html',
  '/scripts/app.js',
  '/styles/app.css',
  '/manifest.json',
  '/styles/styles-m.css',
  '/styles/styles-l.css',
  '/images/ic_refresh_white_24px.svg',
  '/images/select-bg.svg',
  '/fonts/Luma-Icons.woff2',
  '/fonts/opensans/bold/opensans-700.woff2',
  '/fonts/opensans/regular/opensans-400.woff2',
  '/fonts/opensans/semibold/opensans-600.woff2',
];

self.addEventListener('install', function(e) {
  console.log('[ServiceWorker] Install');
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener('activate', function(e) {
  console.log('[ServiceWorker] Activate');
  e.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (key !== cacheName) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  console.log('[Service Worker] Fetch', e.request.url);
  var dataUrl = 'http://localhost';
  if (e.request.url.indexOf(dataUrl) > -1) {
    e.respondWith(
      caches.open(dataCacheName).then(function(cache) {
        return fetch(e.request).then(function(response){
          cache.put(e.request.url, response.clone());
          return response;
        });
      })
    );
  } else {
    e.respondWith(
      caches.match(e.request).then(function(response) {
        return response || fetch(e.request);
      })
    );
  }
});
