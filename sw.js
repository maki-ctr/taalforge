// TaalForge v5 service worker: everything the app needs is cached on install,
// so lessons, exercises and the voice work without signal.
// Bump VERSION after changing any file so phones pick up the new copy.
const VERSION = "taalforge-v5.0.0";
const FILES = [
  "./", "index.html", "manifest.webmanifest", "css/app.css",
  "js/core.js", "js/dutch.js", "js/speech.js", "js/app.js", "js/a1.js",
  "data/nl.js", "data/fr.js", "data/scenarios.js", "data/vocab.js", "data/a1.js",
  "fonts/andika-latin-400-normal.woff2", "fonts/andika-latin-700-normal.woff2",
  "fonts/andika-latin-400-italic.woff2", "fonts/andika-latin-700-italic.woff2",
  "icons/icon-192.png", "icons/icon-512.png", "icons/icon-512-maskable.png", "icons/apple-touch-icon.png"
];
self.addEventListener("install", e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return; // API calls go straight to the network
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(hit => hit || fetch(e.request).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); }
      return res;
    }).catch(() => caches.match("index.html")))
  );
});
