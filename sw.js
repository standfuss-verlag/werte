/* Offline-Speicher der App. Bei jeder Änderung an den Dateien die Nummer erhöhen. */
var VERSION = "messwerte-v2";
var DATEIEN = [
  "./",
  "./index.html",
  "./jspdf.umd.min.js",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png",
  "./apple-touch-icon.png"
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(VERSION).then(function (c) { return c.addAll(DATEIEN); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (namen) {
      return Promise.all(namen.filter(function (n) { return n !== VERSION; })
        .map(function (n) { return caches.delete(n); }));
    }).then(function () { return self.clients.claim(); })
  );
});

/* Erst Zwischenspeicher, sonst Netz. Neue Version wird im Hintergrund nachgeladen. */
self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(function (treffer) {
      var netz = fetch(e.request).then(function (antwort) {
        if (antwort && antwort.ok && new URL(e.request.url).origin === self.location.origin) {
          var kopie = antwort.clone();
          caches.open(VERSION).then(function (c) { c.put(e.request, kopie); });
        }
        return antwort;
      }).catch(function () { return treffer; });
      return treffer || netz;
    })
  );
});
