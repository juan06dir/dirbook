const CACHE = "dirbook-v1";
const OFFLINE_PAGE = "/";

// Instalar — guarda la página principal en caché
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.add(OFFLINE_PAGE))
  );
  self.skipWaiting();
});

// Activar — elimina cachés viejas
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch — red primero, caché como fallback offline
self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(OFFLINE_PAGE))
    );
  }
});
