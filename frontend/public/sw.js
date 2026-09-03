// NewsFree365 Native Web Push Service Worker
self.addEventListener('push', function (event) {
  if (!event.data) return;

  let payload = {};
  try {
    payload = event.data.json();
  } catch (e) {
    payload = {
      title: 'NewsFree365 Breaking News',
      body: event.data.text(),
      url: '/',
    };
  }

  const title = payload.title || 'NewsFree365 Breaking News';
  const options = {
    body: payload.body || 'Tap to read the full story on NewsFree365.',
    icon: payload.icon || '/icon.svg',
    badge: payload.badge || '/icon.svg',
    image: payload.image || undefined,
    tag: payload.tag || 'newsfree365-breaking',
    renotify: true,
    data: {
      url: payload.url || payload.data?.url || '/',
      timestamp: Date.now(),
    },
    actions: [
      { action: 'open', title: 'Read Story' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
