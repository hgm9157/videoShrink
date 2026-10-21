// 동영상 줄이기: 안드로이드 "공유"로 받은 동영상을 잠시 보관했다가 뷰어로 넘겨줍니다.
// 파일은 이 기기 안(Cache Storage)에만 잠깐 저장되고, 뷰어가 읽는 즉시 지워집니다.
const SHARE_CACHE = 'shared-file-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method === 'POST' && url.pathname.endsWith('/share-target')) {
    event.respondWith((async () => {
      const home = new URL('./', self.registration.scope);
      try {
        const form = await event.request.formData();
        const file = form.getAll('file').find((f) => f && typeof f !== 'string');
        if (!file) return Response.redirect(home.href + '?shared=none', 303);
        const cache = await caches.open(SHARE_CACHE);
        await cache.put(new URL('./__shared__', self.registration.scope).href, new Response(file, {
          headers: {
            'Content-Type': file.type || 'application/octet-stream',
            'X-File-Name': encodeURIComponent(file.name || '동영상.mp4'),
          },
        }));
        return Response.redirect(home.href + '?shared=1', 303);
      } catch (e) {
        return Response.redirect(home.href + '?shared=error', 303);
      }
    })());
  }
});
