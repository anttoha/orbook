// ─────────────────────────────────────────────────────────────
// Регистрация sw.js и «Installieren» (часть 17).
// beforeinstallprompt приходит один раз и рано — ловим его сразу при старте и держим здесь,
// а useInstallPrompt читает, когда пользователь откроет Mehr.
// ─────────────────────────────────────────────────────────────
let deferredPrompt = null;
const listeners = new Set();
const notify = () => listeners.forEach((fn) => fn());

export function startPwa() {
  if (typeof window === "undefined") return;
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault(); // своё окно браузера не показываем: у нас карточка «ORBook als App»
    deferredPrompt = event;
    notify();
  });
  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    notify();
  });
  // В разработке (vite dev) sw.js не нужен: он мешал бы горячей перезагрузке
  if (import.meta.env.PROD && "serviceWorker" in navigator) {
    window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => {}));
  }
}

export const canPromptInstall = () => deferredPrompt !== null;

// Показать окно установки браузера. true — пользователь согласился
export async function promptInstall() {
  if (!deferredPrompt) return false;
  const event = deferredPrompt;
  deferredPrompt = null;
  notify();
  await event.prompt();
  const { outcome } = await event.userChoice;
  return outcome === "accepted";
}

export function subscribeInstall(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
