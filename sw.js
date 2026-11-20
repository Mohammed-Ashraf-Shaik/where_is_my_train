/**
 * RailPulse AI - Progressive Web App Service Worker
 * Enables 100% offline transit tracking inside passenger coaches without cell tower data
 * Strategy: Cache First, Network Fallback
 */

const CACHE_NAME = "railpulse-v1.3.0";

const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/style.css",
  "./js/app.js",
  "./js/data/trainData.js",
  "./js/audio/soundEngine.js",
  "./js/audio/announcementPack.js",
  "./js/engine/physicsEngine.js",
  "./js/engine/trackRenderer.js",
  "./js/engine/weatherFX.js",
  "./js/views/cabView.js",
  "./js/views/platformView.js",
  "./js/ai/aiCopilot.js",
  "./js/ai/aiDelayPredictor.js",
  "./js/ai/aiCrowdPredictor.js",
  "./js/ai/offlineTriangulator.js",
  "./js/ai/emergencyAidAI.js",
  "./js/components/coachLayout.js",
  "./js/components/pnrChecker.js",
  "./js/components/telemetryHUD.js",
  "./js/components/liveStationBoard.js",
  "./js/components/berthInspector.js",
  "./js/components/eCatering.js",
  "./js/components/advancedTelemetry.js",
  "./js/components/platformWalkLocator.js",
  "./js/components/trackTopologyMonitor.js"
];

// Install Event - Pre-cache critical application bundle
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[ServiceWorker] Pre-caching offline railway assets");
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Clean up stale cache versions
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("[ServiceWorker] Purging legacy cache:", key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Cache First with Network Fallback
self.addEventListener("fetch", (event) => {
  // Only handle GET requests for internal or static resources
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        // Cache valid HTTP responses
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === "basic") {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // If offline and request is an HTML navigation, serve offline cached index
        if (event.request.headers.get("accept") && event.request.headers.get("accept").includes("text/html")) {
          return caches.match("./index.html");
        }
      });
    })
  );
});
