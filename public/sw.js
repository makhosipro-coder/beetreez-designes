var CACHE_NAME = 'design-studio-v1';
var STATIC_CACHE = 'design-studio-static-v1';
var API_CACHE = 'design-studio-api-v1';

var PRECACHE_URLS = [
  '/',
  '/offline',
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(function (cache) {
      return cache.addAll(PRECACHE_URLS);
    }),
  );
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys
          .filter(function (key) {
            return key !== STATIC_CACHE && key !== API_CACHE;
          })
          .map(function (key) {
            return caches.delete(key);
          }),
      );
    }),
  );
  self.clients.claim();
});

self.addEventListener('sync', function (event) {
  if (event.tag === 'save-design') {
    event.waitUntil(syncDesigns());
  }
});

self.addEventListener('fetch', function (event) {
  var request = event.request;
  var url = new URL(request.url);

  if (request.mode === 'navigate') {
    event.respondWith(navigationHandler(request));
    return;
  }

  if (url.pathname.startsWith('/api/') && request.method === 'GET') {
    event.respondWith(staleWhileRevalidate(request, API_CACHE));
    return;
  }

  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstHandler(request, API_CACHE));
    return;
  }

  event.respondWith(cacheFirstHandler(request, STATIC_CACHE));
});

async function syncDesigns() {
  var cache = await caches.open(API_CACHE);
  var keys = await cache.keys();
  for (var req of keys) {
    if (req.method !== 'POST' && req.method !== 'PUT') continue;
    try {
      var response = await fetch(req);
      if (response.ok) {
        await cache.put(req, response.clone());
      }
    } catch (_a) {}
  }
}

async function staleWhileRevalidate(request, cacheName) {
  var cached = await caches.match(request);
  var fetchPromise = fetch(request).then(function (response) {
    if (response.ok) {
      var cache = caches.open(cacheName);
      cache.then(function (c) { return c.put(request, response.clone()); });
    }
    return response;
  }).catch(function () { return cached || new Response(JSON.stringify({ error: 'offline' }), { status: 503, headers: { 'Content-Type': 'application/json' } }); });
  return cached || fetchPromise;
}

async function navigationHandler(request) {
  try {
    var response = await fetch(request);
    if (response.ok) {
      var cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (_a) {
    var cached = await caches.match(request);
    if (cached) return cached;
    var offline = await caches.match('/offline');
    return offline || new Response('Offline', { status: 503 });
  }
}

async function networkFirstHandler(request, cacheName) {
  if (request.method !== 'GET') {
    try {
      var response = await fetch(request);
      if (response.ok && cacheName) {
        var cache = await caches.open(cacheName);
        cache.put(request, response.clone());
      }
      return response;
    } catch (_a) {
      return new Response(JSON.stringify({ error: 'offline' }), { status: 503, headers: { 'Content-Type': 'application/json' } });
    }
  }
  try {
    var response = await fetch(request);
    if (response.ok) {
      var cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (_a) {
    var cached = await caches.match(request);
    if (cached) return cached;
    return new Response(JSON.stringify({ error: 'offline' }), { status: 503, headers: { 'Content-Type': 'application/json' } });
  }
}

async function cacheFirstHandler(request, cacheName) {
  var cached = await caches.match(request);
  if (cached) return cached;
  try {
    var response = await fetch(request);
    if (response.ok) {
      var cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (_a) {
    return new Response('', { status: 503 });
  }
}
