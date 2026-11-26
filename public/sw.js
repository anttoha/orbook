// ─────────────────────────────────────────────────────────────
// sw.js — service worker ORBook (часть 17, с части 31e — ещё и офлайн):
//   1) показывает уведомление, когда сервер прислал push (docs/API.md «Mitteilungen»);
//   2) по нажатию открывает ORBook на нужном дне;
//   3) часть 31e: хранит страницы сайта на телефоне, чтобы ORBook (и Android-приложение) открывался без интернета.
//      Страница — «сначала сеть»: есть интернет — всегда свежая версия сразу после выкладки, нет — последняя сохранённая.
//      Файлы сборки (/assets/…, имена с хэшем) — «сначала сохранённые»: новая версия сайта приходит с новыми именами.
//      Данные (/api/…) не трогаем: офлайн-план хранит само приложение (offlineCache.js).
// ─────────────────────────────────────────────────────────────
const PAGES = "orbook-pages-v1";
const FILES = "orbook-files-v1";
// Файлы сборки одинаковы для любых заголовков запроса (Vary не учитываем) — иначе скрипт мог бы «не найтись»
const MATCH = { ignoreVary: true };

// Новая версия sw.js включается сразу, а не после закрытия всех вкладок.
// Часть 48: первая страница загрузилась ещё без sw.js и в кэш не попала — кладём её сейчас, чтобы офлайн
// работал уже после одного визита. Не получилось (сеть пропала) — не беда: уведомления всё равно включаются
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(precache().catch(() => {}));
});

// Пути своего сайта из HTML (src, href) и CSS (url(...)): сборка, шрифты, theme-init.js, иконки
const linked = (text, pattern) => [...text.matchAll(pattern)].map((match) => match[1]);

async function precache() {
  const response = await fetch("/", { cache: "no-cache" });
  if (!response.ok) return;
  const files = await caches.open(FILES);
  const save = async (path) => {
    if (await files.match(path, MATCH)) return files.match(path, MATCH); // уже есть
    const answer = await fetch(path);
    if (!answer.ok) throw new Error(path);
    await files.put(path, answer.clone());
    return answer;
  };
  const paths = linked(await response.clone().text(), /(?:src|href)="(\/[^"]+)"/g);
  await Promise.all(
    paths.map(async (path) => {
      const saved = await save(path);
      if (!path.endsWith(".css")) return;
      await Promise.all(linked(await saved.clone().text(), /url\(["']?(\/assets\/[^"')]+)/g).map(save));
    }),
  );
  // страницу — последней: сохранённая главная всегда со всеми своими файлами
  await (await caches.open(PAGES)).put("/", response);
}
self.addEventListener("activate", (event) =>
  event.waitUntil(
    (async () => {
      // старые версии хранилища (другое имя) больше не нужны
      for (const name of await caches.keys()) if (![PAGES, FILES].includes(name)) await caches.delete(name);
      await self.clients.claim();
    })(),
  ),
);

// Страница: сначала сеть (и запомнить), без сети — сохранённая; совсем ничего нет — главная из сохранённых
async function page(request) {
  const cache = await caches.open(PAGES);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put("/", response.clone()); // одностраничное приложение: любая страница = index.html
    return response;
  } catch (error) {
    const saved = await cache.match("/");
    if (saved) return saved;
    throw error;
  }
}

// Файлы сборки и картинки: сохранённые, если есть; иначе из сети (и запомнить)
async function file(request) {
  const cache = await caches.open(FILES);
  const saved = await cache.match(request, MATCH);
  if (saved) {
    // файлы без хэша в имени (theme-init.js, иконки) — тихо обновить на следующий раз
    if (!new URL(request.url).pathname.startsWith("/assets/")) fetch(request).then((r) => r.ok && cache.put(request, r)).catch(() => {});
    return saved;
  }
  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone()).then(() => trim(cache));
  return response;
}

// После каждой выкладки появляются новые файлы — самые старые выбрасываем, чтобы хранилище не росло
async function trim(cache, max = 120) {
  const keys = await cache.keys();
  for (const old of keys.slice(0, Math.max(0, keys.length - max))) await cache.delete(old);
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return; // данные и чужие сайты — как обычно
  if (request.mode === "navigate") event.respondWith(page(request));
  else event.respondWith(file(request));
});

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
