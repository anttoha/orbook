import { create } from "zustand";
import { persist } from "zustand/middleware";
import { deleteSubscription, getPushKey, getSubscription, putSubscription, sendTestPush } from "../api/push";
import { DEFAULT_PUSH, keyToBytes, needsRefresh, pushSupport, readEnvironment, subscriptionBody } from "../utils/push";
import { useUserStore } from "./userStore";

// ─────────────────────────────────────────────────────────────
// pushStore — «Mitteilungen» этого устройства (часть 17, docs/API.md «Mitteilungen»).
// В localStorage ("orbook.push"): включено ли, пункты, «Meine Kurse / Ganze Klasse», Ruhezeit,
// закрыта ли карточка «ORBook als App». Саму подписку браузер хранит сам (pushManager).
// ─────────────────────────────────────────────────────────────

// Подписка браузера на этом устройстве (или null). Без service worker (режим разработки) — null.
async function browserSubscription() {
  const registration = await navigator.serviceWorker?.getRegistration();
  return (await registration?.pushManager?.getSubscription()) ?? null;
}

const settingsOf = (state) => ({ prefs: state.prefs, mine: state.mine, quiet: state.quiet });

// Понятные тексты ошибок (немецкие, для тоста)
export function pushErrorText(error) {
  if (error?.code === "offline" || error?.status === 0) return "Nicht gespeichert – keine Verbindung";
  if (error?.code === "feature_disabled") return "Deine Schule hat Mitteilungen ausgeschaltet";
  if (error?.status === 429) return "Gerade erst gesendet. Kurz warten";
  if (error?.name === "NotAllowedError") return "Der Browser hat es nicht erlaubt";
  return error?.message || "Hat nicht geklappt. Später nochmal versuchen";
}

export const usePushStore = create(
  persist(
    (set, get) => ({
      enabled: false, // на этом устройстве включено (сервер знает подписку)
      ...DEFAULT_PUSH,
      lastSyncAt: null, // когда последний раз отправили подписку на сервер (мс)
      lastSentAt: null, // ISO: когда сервер последний раз что-то доставил
      reminderTime: "18:00", // когда приходит «Für morgen» (настройка админа, приходит с сервера)
      installDismissed: false, // карточку «ORBook als App» в Mehr закрыли
      support: "ok", // pushSupport(): ok | ios-install | unsupported | denied (не сохраняется)
      busy: false,

      // Перечитать, что умеет устройство, и сверить с сервером (открыли «Mitteilungen»)
      check: async () => {
        const support = pushSupport(readEnvironment());
        set({ support });
        if (!get().enabled) return;
        const sub = await browserSubscription().catch(() => null);
        if (!sub || support !== "ok") return set({ enabled: false });
        try {
          const server = await getSubscription(sub.endpoint);
          set({ lastSentAt: server.lastSentAt, reminderTime: server.reminderTime ?? get().reminderTime });
        } catch (error) {
          if (error.status === 404) await get().send(sub); // сервер забыл устройство — тихо записаться снова
        }
      },

      // «Einschalten»: браузер спросит разрешение один раз
      enable: async () => {
        set({ busy: true });
        try {
          const permission = await Notification.requestPermission();
          if (permission !== "granted") {
            set({ support: permission === "denied" ? "denied" : "ok" });
            return false;
          }
          const registration = await navigator.serviceWorker.ready;
          const key = await getPushKey();
          const sub =
            (await registration.pushManager.getSubscription()) ??
            (await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyToBytes(key) }));
          await get().send(sub);
          set({ enabled: true });
          return true;
        } finally {
          set({ busy: false });
        }
      },

      // Отправить подписку и выбор на сервер
      send: async (sub) => {
        const body = subscriptionBody(sub.toJSON(), settingsOf(get()), useUserStore.getState().picked);
        const server = await putSubscription(body);
        set({ lastSyncAt: Date.now(), lastSentAt: server.lastSentAt, reminderTime: server.reminderTime ?? get().reminderTime });
      },

      // Переключатель, курсы, Ruhezeit: сразу на сервер. Не вышло — вернуть как было (ошибку покажет тост)
      update: async (patch) => {
        const before = settingsOf(get());
        set(patch);
        if (!get().enabled) return;
        try {
          const sub = await browserSubscription();
          if (sub) await get().send(sub);
        } catch (error) {
          set(before);
          throw error;
        }
      },

      // «Auf diesem Gerät ausschalten»
      disable: async () => {
        set({ busy: true });
        try {
          const sub = await browserSubscription();
          if (sub) {
            await deleteSubscription(sub.endpoint).catch(() => {}); // офлайн — сервер сам удалит через 60 дней
            await sub.unsubscribe();
          }
          set({ enabled: false, lastSentAt: null });
        } finally {
          set({ busy: false });
        }
      },

      test: async () => {
        const sub = await browserSubscription();
        if (!sub) throw new Error("Mitteilungen sind auf diesem Gerät aus");
        return sendTestPush(sub.endpoint);
      },

      // При старте приложения и после смены «Meine Kurse»: раз в сутки (или сразу — force) напомнить серверу о себе
      refresh: async (force = false) => {
        if (!get().enabled || (!force && !needsRefresh(get().lastSyncAt))) return;
        const sub = await browserSubscription().catch(() => null);
        if (!sub) return set({ enabled: false });
        await get().send(sub).catch(() => {}); // офлайн — попробуем при следующем запуске
      },

      dismissInstall: () => set({ installDismissed: true }),
    }),
    {
      name: "orbook.push",
      partialize: ({ enabled, prefs, mine, quiet, lastSyncAt, lastSentAt, reminderTime, installDismissed }) => ({
        enabled,
        prefs,
        mine,
        quiet,
        lastSyncAt,
        lastSentAt,
        reminderTime,
        installDismissed,
      }),
    },
  ),
);
