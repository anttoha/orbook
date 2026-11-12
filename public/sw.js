// ─────────────────────────────────────────────────────────────
// sw.js — service worker ORBook (часть 17). Делает только две вещи:
//   1) показывает уведомление, когда сервер прислал push (docs/API.md «Mitteilungen»);
//   2) по нажатию открывает ORBook на нужном дне.
// Страницы и данные НЕ кэширует: офлайн-план уже хранит приложение (offlineCache.js),
// а лишний кэш мешал бы новой версии сайта появиться сразу после выкладки.
// ─────────────────────────────────────────────────────────────

// Новая версия sw.js включается сразу, а не после закрытия всех вкладок
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

// Пришёл push: {title, body, url, tag}. Одинаковый tag заменяет старое уведомление (новый план на тот же день)
self.addEventListener("push", (event) => {
  const read = () => {
    try {
      return event.data ? event.data.json() : {};
    } catch {
      return { body: event.data?.text() }; // не JSON — показать как текст
    }
  };
  const data = read();
  event.waitUntil(
    self.registration.showNotification(data.title || "ORBook", {
      body: data.body || "",
      tag: data.tag,
      renotify: Boolean(data.tag),
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      lang: "de",
      data: { url: data.url || "/woche" },
    }),
  );
});

// Нажали на уведомление: уже открытое окно ORBook — перейти в нём, иначе открыть новое
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = new URL(event.notification.data?.url || "/woche", self.location.origin).href;
  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      const open = windows.find((w) => new URL(w.url).origin === self.location.origin);
      if (open) {
        await open.focus();
        return open.navigate(url).catch(() => open.postMessage({ type: "open", url }));
      }
      return self.clients.openWindow(url);
    })(),
  );
});
