const CACHE_NAME = 'note-app-v2';

self.addEventListener('install', (event) => {
  self.skipWaiting(); // Ép service worker mới hoạt động ngay lập tức
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    // Chiến lược Network First: Luôn lấy code mới nhất từ internet
    fetch(event.request)
      .then((response) => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        return response;
      })
      .catch(() => {
        // Nếu mất mạng, mới lấy từ cache ra dùng
        return caches.match(event.request);
      })
  );
});
