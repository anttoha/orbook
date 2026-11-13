import { create } from "zustand";
import { persist } from "zustand/middleware";
import { deleteSyncBlock, makeSyncRequest } from "../api/sync";
import { useTheme } from "../hooks/useTheme";
import { mergeNotes, sameNotes, syncErrorText } from "../utils/notes";
import { ALL_PARTS, darstellungOf, kurseOf, syncBlock } from "../utils/syncPayload";
import { decryptNotes, deriveSync, encryptNotes, generateSyncCode, normalizeSyncCode } from "../utils/syncCrypto";
import { useClasses } from "./classesStore";
import { useTasksStore } from "./tasksStore";
import { useUserStore } from "./userStore";

// ─────────────────────────────────────────────────────────────
// syncStore — синхронизация через Sync-Code (docs/frontend/06-notizen.md, часть 25 — всё, не только заметки).
// В localStorage ("orbook.sync"): code, version, lastSyncAt, какие части включены и когда менялись настройки.
// Сам код никуда не отправляем: на сервер идут только syncId (заголовок) и зашифрованный блок.
// ─────────────────────────────────────────────────────────────

const BOX = { encryptNotes, decryptNotes }; // шифрование блока (эталон syncCrypto.js)

// Ключи считаются долго (PBKDF2, до 1–2 с на слабом телефоне) — считаем раз на код
const keyCache = new Map();
const keysFor = (code) => {
  if (!keyCache.has(code)) keyCache.set(code, deriveSync(code));
  return keyCache.get(code);
};

let retryTimer = null; // повтор после 429
let applying = false; // сейчас записываем пришедшее — это не «изменение пользователя»

// Часть 29: переключение класса меняет заметки и курсы в userStore, но это не правка пользователя
export function quietly(change) {
  applying = true;
  try {
    change();
  } finally {
    applying = false;
  }
}

// До части 29d в Sync-блоке лежат заметки и курсы одного класса — того, что был на устройстве первым.
// Открыт другой класс — эти части не трогаем (иначе заметки классов смешались бы)
const onHomeClass = () => {
  const { activeId, homeId } = useClasses.getState();
  return activeId == null || homeId == null || activeId === homeId;
};
const partsNow = (parts) => (onHomeClass() ? parts : { ...parts, notes: false, kurse: false });

export const useSyncStore = create(
  persist(
    (set, get) => ({
      code: null, // "K7QM-4TXP-R2AB-…" или null — синхронизация выключена
      version: 0, // версия блока на сервере после последней синхронизации
      lastSyncAt: null, // ISO: когда последний раз получилось
      status: "idle", // "idle" | "syncing" | "error"
      error: null, // немецкий текст ошибки
      disabled: false, // школа выключила синхронизацию (403 feature_disabled)
      parts: ALL_PARTS, // «Was wird synchronisiert» — у каждого устройства своё
      stamps: { kurse: null, darstellung: null }, // когда здесь меняли Meine Kurse и Darstellung (null — ни разу)

      // Синхронизировать сейчас. Вторая синхронизация, пока идёт первая, не нужна: изменения подхватит следующая
      runSync: async () => {
        const { code, status, disabled } = get();
        if (!code || disabled || status === "syncing") return;
        clearTimeout(retryTimer);
        set({ status: "syncing" });
        const classAtStart = useClasses.getState().activeId;
        try {
          const res = await syncWith(code, get());
          if (get().code !== code) return; // пока ждали, код сменили — результат уже не наш
          // пока ждали, открыли другой класс — его заметки и курсы этим блоком не трогаем
          const parts = useClasses.getState().activeId === classAtStart ? partsNow(get().parts) : { ...partsNow(get().parts), notes: false, kurse: false };
          applyBlock(res.block, parts, set);
          set({ version: res.version, lastSyncAt: new Date().toISOString(), status: "idle", error: null });
        } catch (error) {
          handleError(error, set, get);
        }
      },

      // «Code erzeugen»: включить синхронизацию с новым кодом
      enable: async () => {
        set({ code: generateSyncCode(), version: 0, lastSyncAt: null, error: null });
        await get().runSync();
      },

      // «Verbinden»: код с другого устройства.
      // { status: "ok" } — слили; { status: "empty", code } — на сервере ничего (возможна ошибка в коде)
      // Ошибки: Error("Ungültiger Sync-Code"), Error("wrong_code"), ApiError
      connect: async (text) => {
        const chars = normalizeSyncCode(text); // бросает ошибку, если код неправильный
        const code = chars.match(/.{4}/g).join("-");
        const keys = await keysFor(code);
        const got = await makeSyncRequest(keys.syncId)("GET");
        if (got.status === 404) return { status: "empty", code };
        try {
          await decryptNotes(keys, got.data.data); // проверяем до того, как что-то менять
        } catch {
          throw new Error("wrong_code");
        }
        await get().switchCode(code);
        return { status: "ok" };
      },

      // Перейти на код (после «Trotzdem verwenden?» тоже) и сразу синхронизировать.
      // Kurse и Darstellung на новом устройстве берутся с кода: свои отметки времени забываем
      switchCode: async (code) => {
        set({ code, version: 0, lastSyncAt: null, error: null, status: "idle", stamps: { kurse: null, darstellung: null } });
        await get().runSync();
      },

      // Переключатель «Was wird synchronisiert»
      setPart: (name, on) => {
        set({ parts: { ...get().parts, [name]: on } });
        get().runSync();
      },

      // Настройку изменили на этом устройстве (ставит watchChanges)
      touch: (name) => set({ stamps: { ...get().stamps, [name]: new Date().toISOString() } }),

      // «Neuen Code erzeugen»: записать всё под новым кодом, потом удалить старый блок.
      // Не получилось — оставляем старый код (бросаем ошибку дальше)
      renewCode: async () => {
        const old = get().code;
        const code = generateSyncCode();
        const res = await syncWith(code, get());
        if (old) await deleteSyncBlock((await keysFor(old)).syncId);
        applyBlock(res.block, partsNow(get().parts), set);
        set({ code, version: res.version, lastSyncAt: new Date().toISOString(), status: "idle", error: null });
      },

      // «Sync-Daten löschen»: блок на сервере удалить, код забыть. На устройстве всё остаётся
      forget: async () => {
        const { code } = get();
        if (code) await deleteSyncBlock((await keysFor(code)).syncId);
        set({ code: null, version: 0, lastSyncAt: null, status: "idle", error: null });
      },
    }),
    {
      name: "orbook.sync", // ключ из документации
      partialize: (s) => ({ code: s.code, version: s.version, lastSyncAt: s.lastSyncAt, parts: s.parts, stamps: s.stamps }), // состояние и ошибку не храним
    },
  ),
);

// Один проход синхронизации под кодом code
async function syncWith(code, { stamps, parts }) {
  const keys = await keysFor(code);
  return syncBlock({ keys, local: localBlock(stamps), parts: partsNow(parts), request: makeSyncRequest(keys.syncId), crypto: BOX });
}

// Своё на этом устройстве — в виде блока
function localBlock(stamps) {
  const user = useUserStore.getState();
  const { tasks, marks } = useTasksStore.getState();
  return {
    notes: user.notes,
    tasks,
    marks,
    kurse: { value: kurseOf(user), updatedAt: stamps.kurse },
    darstellung: { value: darstellungOf(user, useTheme.getState().theme), updatedAt: stamps.darstellung },
  };
}

const differs = (a, b) => JSON.stringify(a) !== JSON.stringify(b);
// Только поля, которые реально пришли (в блоке от другой версии приложения поля может не быть)
const defined = (value) => Object.fromEntries(Object.entries(value ?? {}).filter(([, v]) => v !== undefined));

// Записать слитый блок в сторы — только включённые части и только если что-то изменилось
// (иначе экраны перерисуются зря). Пока шёл запрос, пользователь мог что-то поменять — списки сливаем ещё раз
function applyBlock(block, parts, set) {
  applying = true;
  try {
    if (parts.notes) applyNotes(block.notes);
    if (parts.aufgaben) applyTasks(block);
    const stamps = { ...useSyncStore.getState().stamps };
    if (parts.kurse && block.kurse) {
      const value = defined(block.kurse.value);
      if (differs(kurseOf(useUserStore.getState()), kurseOf({ ...useUserStore.getState(), ...value }))) useUserStore.setState(value);
      stamps.kurse = block.kurse.updatedAt;
    }
    if (parts.darstellung && block.darstellung) {
      applyDarstellung(defined(block.darstellung.value));
      stamps.darstellung = block.darstellung.updatedAt;
    }
    set({ stamps });
  } finally {
    applying = false;
  }
}

function applyNotes(notes) {
  const current = useUserStore.getState().notes;
  const next = mergeNotes(current, notes);
  if (!sameNotes(next, current)) useUserStore.getState().setNotes(next);
}

function applyTasks(block) {
  const own = useTasksStore.getState();
  const next = { tasks: mergeNotes(own.tasks, block.tasks), marks: mergeNotes(own.marks, block.marks) };
  if (differs(next, { tasks: own.tasks, marks: own.marks })) own.setSynced(next);
}

// Тема и шрифт меняются через свои сеттеры: им ещё нужно поменять класс и атрибут на <html>
function applyDarstellung({ theme, fontScale, ...rest }) {
  const user = useUserStore.getState();
  if (Object.keys(rest).some((key) => differs(user[key], rest[key]))) useUserStore.setState(rest);
  if (fontScale !== undefined && fontScale !== user.fontScale) user.setFontScale(fontScale);
  if (theme && theme !== useTheme.getState().theme) useTheme.getState().setTheme(theme);
}

// Следить за изменениями пользователя: заметки, задачи, Meine Kurse, Darstellung.
// Изменённая настройка получает отметку времени (так при слиянии побеждает новое). onChange — синхронизировать позже
export function watchChanges(onChange) {
  const snapshot = () => {
    const user = useUserStore.getState();
    return { kurse: JSON.stringify(kurseOf(user)), darstellung: JSON.stringify(darstellungOf(user, useTheme.getState().theme)) };
  };
  let last = snapshot();
  const checkSettings = () => {
    const now = snapshot();
    const changed = Object.keys(now).filter((name) => now[name] !== last[name]);
    last = now;
    if (applying || changed.length === 0) return;
    changed.forEach((name) => useSyncStore.getState().touch(name));
    onChange();
  };
  const stopUser = useUserStore.subscribe((state, prev) => {
    if (state.notes !== prev.notes && !applying) onChange();
    checkSettings();
  });
  const stopTheme = useTheme.subscribe(checkSettings);
  const stopTasks = useTasksStore.subscribe((state, prev) => {
    if (!applying && (state.tasks !== prev.tasks || state.marks !== prev.marks)) onChange();
  });
  return () => {
    stopUser();
    stopTheme();
    stopTasks();
  };
}

function handleError(error, set, get) {
  if (error?.code === "feature_disabled") return set({ disabled: true, status: "idle", error: null });
  if (error?.status === 429 && error.retryAfter) retryTimer = setTimeout(() => get().runSync(), error.retryAfter * 1000);
  set({ status: "error", error: syncErrorText(error) });
}
