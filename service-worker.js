// Service Worker - для работы офлайн и установки как приложение
const CACHE_NAME = 'stickman-runner-v1';
const urlsToCache = [
  './',
  './index.html',
  './game.js',
  './manifest.json'
];

// Установка Service Worker
self.addEventListener('install', event => {
  console.log('Service Worker устанавливается...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Кэш открыт');
        return cache.addAll(urlsToCache);
      })
      .catch(err => console.log('Ошибка кэша:', err))
  );
  self.skipWaiting();
});

// Активация Service Worker
self.addEventListener('activate', event => {
  console.log('Service Worker активирован');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Удаление старого кэша:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Обработка запросов
self.addEventListener('fetch', event => {
  // Пропускаем non-GET запросы
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Если найдено в кэше - вернуть
        if (response) {
          return response;
        }

        return fetch(event.request).then(response => {
          // Не кэшировать если ошибка
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Кэшировать копию ответа
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
      .catch(() => {
        // Офлайн режим
        return caches.match('./index.html');
      })
  );
});

// Фоновая синхронизация (опционально)
self.addEventListener('sync', event => {
  if (event.tag === 'sync-game-data') {
    event.waitUntil(
      // Здесь можно добавить синхронизацию данных
      Promise.resolve()
    );
  }
});

console.log('Service Worker загружен');
