const CACHE_NAME = 'note-app-v3'; // Tăng version
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon.png',
  './icon-512.png',
  'https://cdn.jsdelivr.net/npm/@picocss/pico@1/css/pico.min.css'
];

// 1. Cài đặt: Lưu các file tĩnh vào bộ nhớ đệm
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Ép bản mới hoạt động ngay
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Đã mở cache v3');
        return cache.addAll(urlsToCache);
      })
  );
});

// 2. Kích hoạt: Xóa cache cũ
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 3. Xử lý yêu cầu (Fetch): Network First cho HTML/API, trả về Cache khi mất mạng
self.addEventListener('fetch', (event) => {
  // BỎ QUA các request POST (như khi Thêm/Xóa dữ liệu) vì Cache không hỗ trợ lưu POST
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Tránh cache các request từ Google Script nếu bạn không muốn thấy dữ liệu cũ
        // Nếu muốn thấy dữ liệu cũ khi offline, ta có thể lưu nó lại:
        if (event.request.url.startsWith('http')) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        }
        return response;
      })
      .catch(() => {
        // Khi mất mạng, lấy dữ liệu từ cache ra dùng
        return caches.match(event.request).then(response => {
            if (response) return response;
            // Fallback về trang chủ nếu đang mở link lạ
            if (event.request.mode === 'navigate') {
                return caches.match('./index.html');
            }
            return undefined;
        });
      })
  );
});
