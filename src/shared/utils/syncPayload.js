// ─────────────────────────────────────────────────────────────
// Sync-блок целиком (часть 25): не только заметки, а всё, что пользователь выбрал.
// Блок шифруется как раньше (syncCrypto.js); сервер видит только зашифрованный текст.
// Блок: { notes, tasks, marks, kurse: { value, updatedAt } | null, darstellung: { value, updatedAt } | null,
//         klassen: { [classId]: { notes, kurse, info } } | null }
// Старый блок { notes } тоже подходит: недостающие части — пустые.
// Часть 29d: у каждого класса свои заметки и курсы — они в klassen. Верхние notes/kurse — копия
// «домашнего» класса, чтобы старые версии приложения на других устройствах продолжали работать.
// ─────────────────────────────────────────────────────────────
import { EMPTY_CLASS_DATA } from "./classes";
import { appearanceOf } from "./appearance";
import { mergeNotes } from "./notes";

// Части, которые можно включать и выключать (по умолчанию все включены)
export const SYNC_PARTS = ["notes", "aufgaben", "kurse", "darstellung", "klassen"];
export const ALL_PARTS = { notes: true, aufgaben: true, kurse: true, darstellung: true, klassen: true };
// Устройство со старой версией хранит parts без klassen — отсутствие значит «включено»
const isOn = (parts, name) => parts?.[name] !== false;

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
  // часть 30a: Design, Akzentfarbe, фон Glas, «Animationen». Старая версия приложения эти поля просто сохранит и не тронет
  ...appearanceOf(user),
});

// Расшифрованный блок → полный вид (у старого блока есть только notes)
export const readBlock = (plain) => ({
  notes: plain?.notes ?? [],
  tasks: plain?.tasks ?? [],
  marks: plain?.marks ?? [],
  kurse: plain?.kurse ?? null,
  darstellung: plain?.darstellung ?? null,
  klassen: plain?.klassen ?? null, // null — блок записан до части 29d
});

// ── Классы (часть 29d) ──

// Имя на устройстве, цвет и место в списке «Meine Klassen». Zugangscodes в блок не кладём:
// на новом устройстве класс добавляется своим кодом
export const infoOf = (item, order) => ({ label: item.label ?? "", color: item.color ?? null, order });

const classEntry = (raw) => ({ notes: raw?.notes ?? [], kurse: raw?.kurse ?? null, info: raw?.info ?? null });

// Свои классы этого устройства → часть блока. Данные открытого класса лежат сверху в userStore,
// остальных — в byClass. stamps — когда здесь меняли курсы и имя/цвет каждого класса
export function localKlassen(user, activeId, list, stamps = {}) {
  return Object.fromEntries(
    list.map((item, order) => {
      const data = item.id === activeId ? user : { ...EMPTY_CLASS_DATA, ...(user.byClass?.[item.id] ?? {}) };
      const stamp = stamps[item.id] ?? {};
      return [String(item.id), { notes: data.notes ?? [], kurse: { value: kurseOf(data), updatedAt: stamp.kurse ?? null }, info: { value: infoOf(item, order), updatedAt: stamp.info ?? null } }];
    }),
  );
}

// Слить классы. Класс, которого на этом устройстве нет, остаётся в блоке как есть
export function mergeKlassen(local, remote, parts = ALL_PARTS, now = new Date()) {
  const ids = [...new Set([...Object.keys(remote ?? {}), ...Object.keys(local ?? {})])];
  return Object.fromEntries(
    ids.map((id) => {
      const mine = local?.[id];
      const theirs = classEntry(remote?.[id]);
      if (!mine) return [id, theirs];
      return [
        id,
        {
          notes: isOn(parts, "notes") ? mergeNotes(mine.notes, theirs.notes, now) : theirs.notes,
          kurse: isOn(parts, "kurse") ? newerSetting(mine.kurse, theirs.kurse) : theirs.kurse,
          info: isOn(parts, "klassen") ? newerSetting(mine.info, theirs.info) : theirs.info,
        },
      ];
    }),
  );
}

// Имя, цвет и порядок с другого устройства → список «Meine Klassen». Классы, которых в блоке нет, остаются на своих местах
export function applyInfo(list, klassen) {
  const infoOfItem = (item) => klassen?.[String(item.id)]?.info?.value;
  return list
    .map((item, index) => {
      const info = infoOfItem(item);
      const next = info ? { ...item, label: info.label ?? item.label, color: info.color ?? item.color } : item;
      return { next, key: info?.order ?? index, index };
    })
    .sort((a, b) => a.key - b.key || a.index - b.index)
    .map(({ next }) => next);
}

// Поля класса записать туда, где они живут: открытый класс — наверх userStore, остальные — в byClass
export function classPatch(user, id, activeId, patch) {
  if (id === activeId) return patch;
  return { byClass: { ...(user.byClass ?? {}), [id]: { ...EMPTY_CLASS_DATA, ...(user.byClass?.[id] ?? {}), ...patch } } };
}

// Блок без klassen (записан старой версией): его заметки и курсы — это «домашний» класс
const remoteKlassen = (remote, home) => remote.klassen ?? (home != null ? { [String(home)]: classEntry({ notes: remote.notes, kurse: remote.kurse }) } : {});

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
// home — «домашний» класс устройства: его заметки и курсы ещё и сверху (для старых версий)
export function mergeBlock(local, remote, parts = ALL_PARTS, now = new Date(), home = null) {
  // Устройство без классов (сервер до части 29): всё как раньше, чужие классы не трогаем
  if (!local.klassen) return { ...mergeTop(local, remote, parts, now), klassen: remote.klassen ?? null };
  const klassen = mergeKlassen(local.klassen, remoteKlassen(remote, home), parts, now);
  const homeData = home != null ? klassen[String(home)] : null;
  return {
    ...mergeTop(local, remote, parts, now),
    notes: homeData ? homeData.notes : remote.notes,
    kurse: homeData ? homeData.kurse : remote.kurse,
    klassen,
  };
}

function mergeTop(local, remote, parts, now) {
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
export async function syncBlock({ keys, local, parts = ALL_PARTS, home = null, request, crypto: box, now = new Date(), maxTries = 5 }) {
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
    const block = mergeBlock(local, remote, parts, now, home);
    if (version > 0 && sameBlock(block, remote)) return { block, version, changed: false };
    if (!fitsInBlock(block)) throw new Error("too_big");
    const put = await request("PUT", { data: await box.encryptNotes(keys, block), baseVersion: version });
    if (put.status === 200) return { block, version: put.data.version, changed: true };
    // 409: другое устройство успело записать — берём свежую версию и сливаем заново
  }
  throw new Error("conflict");
}
