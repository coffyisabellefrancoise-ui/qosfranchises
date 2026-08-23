const CACHE_NAME = 'traducteur-ia-shell-v1';
const APP_SHELL = [
    './index.html',
    './traduction-audio.html',
    './dashboard-template.html',
    './manifest.json',
    './icons/icon-192.png',
    './icons/icon-512.png',
    './icons/icon-maskable-192.png',
    './icons/icon-maskable-512.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
        )
    );
    self.clients.claim();
});

// Les modèles d'IA (Hugging Face / jsdelivr) ne sont volontairement PAS
// interceptés ici : transformers.js gère déjà leur propre cache (Cache
// Storage), et les intercepter ici doublonnerait des téléchargements de
// plusieurs dizaines de Mo pour rien.
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    if (url.origin !== self.location.origin) return;

    // Documents HTML (navigation) : réseau en priorité, secours sur le cache
    // si hors-ligne. Ça garantit qu'une mise à jour du site (nouvelle version
    // de traduction-audio.html, etc.) arrive bien aux utilisateurs qui ont
    // "installé" l'app, plutôt que de rester bloqués sur une version figée
    // au moment de l'installation (ce que ferait un cache-first pur).
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                    return response;
                })
                .catch(() => caches.match(event.request))
        );
        return;
    }

    // Reste de l'app shell (icônes, manifest...) : cache-first, ça change rarement.
    event.respondWith(
        caches.match(event.request).then((cached) => {
            if (cached) return cached;
            return fetch(event.request).then((response) => {
                if (response.ok) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                }
                return response;
            }).catch(() => cached);
        })
    );
});
