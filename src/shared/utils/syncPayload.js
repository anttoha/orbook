// ─────────────────────────────────────────────────────────────
// Sync-блок целиком (часть 25): не только заметки, а всё, что пользователь выбрал.
// Блок шифруется как раньше (syncCrypto.js); сервер видит только зашифрованный текст.
// Блок: { notes, tasks, marks, kurse: { value, updatedAt } | null, darstellung: { value, updatedAt } | null }
// Старый блок { notes } тоже подходит: недостающие части — пустые.
// ─────────────────────────────────────────────────────────────
import { mergeNotes } from "./notes";

// Части, которые можно включать и выключать (по умолчанию все включены)
export const SYNC_PARTS = ["notes", "aufgaben", "kurse", "darstellung"];
export const ALL_PARTS = { notes: true, aufgaben: true, kurse: true, darstellung: true };

const MAX_PLAIN_BYTES = 48 * 1024; // блок ≤ 64 КБ в base64: открытый JSON — не больше ~48 КБ
const MARK_DAYS = 60; // галочки у домашек старше 60 дней больше не нужны

// Что синхронизируется из «Meine Kurse» и «Darstellung» (снимок настроек)
export const kurseOf = (user) => ({ picked: user.picked ?? [], hiddenRequired: user.hiddenRequired ?? [], coursesChosen: Boolean(user.coursesChosen) });
export const darstellungOf = (user, theme) => ({
  theme,
  startView: user.startView,
  dayView: user.dayView,
  compactWeek: user.compactWeek,
  fontScale: user.fontScale,
  changedFormat: user.changedFormat,
  showWeekend: user.showWeekend,
  colorOverrides: user.colorOverrides ?? {},
});

// Расшифрованный блок → полный вид (у старого блока есть только notes)
export const readBlock = (plain) => ({
  notes: plain?.notes ?? [],
  tasks: plain?.tasks ?? [],
  marks: plain?.marks ?? [],
  kurse: plain?.kurse ?? null,
  darstellung: plain?.darstellung ?? null,
});

// Настройка: побеждает более новое изменение. Без времени (ни разу не меняли здесь) — уступает
export function newerSetting(local, remote) {
  if (!remote) return local;
  if (!local?.updatedAt) return remote;
  if (!remote.updatedAt) return local;
  return local.updatedAt > remote.updatedAt ? local : remote;
}

const freshMarks = (marks, now) => {
  const cutoff = new Date(now.getTime() - MARK_DAYS * 86400000).toISOString();
  return marks.filter((mark) => mark.updatedAt >= cutoff);
};

// Слить своё и пришедшее. Выключенная часть берётся из блока как есть:
// это устройство её не меняет, но и не стирает для других устройств
export function mergeBlock(local, remote, parts = ALL_PARTS, now = new Date()) {
  return {
    notes: parts.notes ? mergeNotes(local.notes, remote.notes, now) : remote.notes,
    tasks: parts.aufgaben ? mergeNotes(local.tasks, remote.tasks, now) : remote.tasks,
    marks: parts.aufgaben ? freshMarks(mergeNotes(local.marks, remote.marks, now), now) : remote.marks,
    kurse: parts.kurse ? newerSetting(local.kurse, remote.kurse) : remote.kurse,
    darstellung: parts.darstellung ? newerSetting(local.darstellung, remote.darstellung) : remote.darstellung,
  };
}

export const sameBlock = (a, b) => JSON.stringify(a) === JSON.stringify(b);
export const fitsInBlock = (block) => new TextEncoder().encode(JSON.stringify(block)).length <= MAX_PLAIN_BYTES;

// Синхронизация: GET → слить → (если изменилось) PUT с baseVersion; на 409 — сначала.
// request(method, body) → { status, data } (404 и 409 — статусом, остальные ошибки бросаются).
// Возвращает { block, version, changed }. Блок не расшифровался → Error("wrong_code"), ничего не пишем.
export async function syncBlock({ keys, local, parts = ALL_PARTS, request, crypto: box, now = new Date(), maxTries = 5 }) {
  for (let attempt = 0; attempt < maxTries; attempt++) {
    const got = await request("GET");
    let remote = readBlock(null);
    let version = 0; // на сервере ничего нет (404): начинаем с baseVersion 0
    if (got.status === 200) {
      try {
        remote = readBlock(await box.decryptNotes(keys, got.data.data));
      } catch {
        throw new Error("wrong_code");
      }
      version = got.data.version;
    }
    const block = mergeBlock(local, remote, parts, now);
    if (version > 0 && sameBlock(block, remote)) return { block, version, changed: false };
    if (!fitsInBlock(block)) throw new Error("too_big");
    const put = await request("PUT", { data: await box.encryptNotes(keys, block), baseVersion: version });
    if (put.status === 200) return { block, version: put.data.version, changed: true };
    // 409: другое устройство успело записать — берём свежую версию и сливаем заново
  }
  throw new Error("conflict");
}
