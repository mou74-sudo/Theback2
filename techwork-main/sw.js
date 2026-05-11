// Service worker for offline caching.
// Caches the app shell (HTML, CSS, JS, Chart.js CDN) on first visit.
// Serves cached responses when the network is unavailable.
// Strategy: cache-first for static assets, network-first for API calls.

const CACHE_NAME = "techwork-v1";

const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/dashboard.html",
  "/ar.html",
  "/ar-camera.html",
  "/css/style.css",
  "/js/main.js",
  "/js/api.js",
  "/js/ui.js",
  "/js/mockData.js",
  "/js/toolcheck.js",
  "/js/anomaly.js",
  "/js/mlService.js",
  "/js/accessibility.js",
  "/js/dashboard.js",
  "/js/ar.js",
  "https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.min.js"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  // Let backend API calls go straight to network
  if (event.request.url.includes("localhost:3001")) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).then(response => {
        if (response.ok && event.request.method === "GET") {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      });
    }).catch(() => caches.match("/index.html"))
  );
});
