const CACHE_NAME = "missing-persons-app-v2";
const APP_SHELL = ["./manifest.json", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first for HTML/navigation (so updates always show up immediately),
// cache-first only for static icons/manifest that rarely change.
self.addEventListener("fetch", (event) => {
  const url = event.request.url;
  if (url.includes("firestore.googleapis.com") || url.includes("firebase") || url.includes("imgbb.com") || url.includes("openstreetmap.org")) {
    return; // always go to network for live data / external services
  }
  if (event.request.mode === "navigate" || url.endsWith(".html")) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
