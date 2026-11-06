import { create } from "zustand";
import { persist } from "zustand/middleware";
import { deleteSyncBlock, makeSyncRequest } from "../api/sync";
import { mergeNotes, sameNotes, syncErrorText, syncNotes } from "../utils/notes";
import { decryptNotes, deriveSync, encryptNotes, generateSyncCode, normalizeSyncCode } from "../utils/syncCrypto";
import { useUserStore } from "./userStore";

// ─────────────────────────────────────────────────────────────
// syncStore — синхронізація нотаток (docs/frontend/06-notizen.md).
// У localStorage ("orbook.sync") лежать тільки code, version, lastSyncAt.
// Сам код нікуди не відправляємо: на сервер ідуть лише syncId (заголовок) і зашифрований блок.
// ─────────────────────────────────────────────────────────────

const BOX = { encryptNotes, decryptNotes }; // шифрування для syncNotes

// Ключі рахуються довго (PBKDF2, до 1–2 с на слабкому телефоні) — рахуємо раз на код
const keyCache = new Map();
const keysFor = (code) => {
  if (!keyCache.has(code)) keyCache.set(code, deriveSync(code));
  return keyCache.get(code);
};

let retryTimer = null; // повтор після 429

export const useSyncStore = create(
  persist(
    (set, get) => ({
      code: null, // "K7QM-4TXP-R2AB-…" або null — синхронізація вимкнена
      version: 0, // версія блоку на сервері після останньої синхронізації
      lastSyncAt: null, // ISO: коли востаннє вдалось
      status: "idle", // "idle" | "syncing" | "error"
      error: null, // німецький текст помилки
      disabled: false, // школа вимкнула синхронізацію (403 feature_disabled)
      lastSynced: null, // список нотаток після синхронізації: якщо нотатки ті самі — не синхронізуємо знову

      // Синхронізувати зараз. Друга синхронізація поки йде перша — не потрібна: зміни підхопить наступна
      runSync: async () => {
        const { code, status, disabled } = get();
        if (!code || disabled || status === "syncing") return;
        clearTimeout(retryTimer);
        set({ status: "syncing" });
        try {
          const keys = await keysFor(code);
          const res = await syncNotes({ keys, notes: useUserStore.getState().notes, request: makeSyncRequest(keys.syncId), crypto: BOX });
          if (get().code !== code) return; // поки чекали, код змінили — результат уже не наш
          applyNotes(res.notes, set);
          set({ version: res.version, lastSyncAt: new Date().toISOString(), status: "idle", error: null });
        } catch (error) {
          handleError(error, set, get);
        }
      },

      // «Code erzeugen»: увімкнути синхронізацію з новим кодом
      enable: async () => {
        set({ code: generateSyncCode(), version: 0, lastSyncAt: null, error: null });
        await get().runSync();
      },

      // «Verbinden»: код з іншого пристрою.
      // { status: "ok" } — злили; { status: "empty", code } — на сервері нічого (можлива помилка в коді)
      // Помилки: Error("Ungültiger Sync-Code"), Error("wrong_code"), ApiError
      connect: async (text) => {
        const chars = normalizeSyncCode(text); // кидає помилку, якщо код неправильний
        const code = chars.match(/.{4}/g).join("-");
        const keys = await keysFor(code);
        const got = await makeSyncRequest(keys.syncId)("GET");
        if (got.status === 404) return { status: "empty", code };
        try {
          await decryptNotes(keys, got.data.data); // перевіряємо до того, як щось змінювати
        } catch {
          throw new Error("wrong_code");
        }
        await get().switchCode(code);
        return { status: "ok" };
      },

      // Перейти на код (після «Trotzdem verwenden?» теж) і одразу синхронізувати
      switchCode: async (code) => {
        set({ code, version: 0, lastSyncAt: null, error: null, status: "idle" });
        await get().runSync();
      },

      // «Neuen Code erzeugen»: записати все під новим кодом, потім видалити старий блок.
      // Не вдалось — лишаємо старий код (кидаємо помилку далі)
      renewCode: async () => {
        const old = get().code;
        const code = generateSyncCode();
        const keys = await keysFor(code);
        const res = await syncNotes({ keys, notes: useUserStore.getState().notes, request: makeSyncRequest(keys.syncId), crypto: BOX });
        if (old) await deleteSyncBlock((await keysFor(old)).syncId);
        applyNotes(res.notes, set);
        set({ code, version: res.version, lastSyncAt: new Date().toISOString(), status: "idle", error: null });
      },

      // «Meine Sync-Notizen löschen»: блок на сервері видалити, код забути. Нотатки на пристрої лишаються
      forget: async () => {
        const { code } = get();
        if (code) await deleteSyncBlock((await keysFor(code)).syncId);
        set({ code: null, version: 0, lastSyncAt: null, status: "idle", error: null });
      },
    }),
    {
      name: "orbook.sync", // ключ з документації
      partialize: (s) => ({ code: s.code, version: s.version, lastSyncAt: s.lastSyncAt }), // стан і помилку не зберігаємо
    },
  ),
);

// Записати злитий список у нотатки (тільки якщо щось змінилось — інакше екрани перемалюються даремно)
function applyNotes(merged, set) {
  const current = useUserStore.getState().notes;
  // Поки йшов запит, користувач міг щось змінити — зливаємо ще раз з поточними
  const next = mergeNotes(current, merged);
  if (!sameNotes(next, current)) useUserStore.getState().setNotes(next);
  set({ lastSynced: useUserStore.getState().notes });
}

function handleError(error, set, get) {
  if (error?.code === "feature_disabled") return set({ disabled: true, status: "idle", error: null });
  if (error?.status === 429 && error.retryAfter) retryTimer = setTimeout(() => get().runSync(), error.retryAfter * 1000);
  set({ status: "error", error: syncErrorText(error) });
}
