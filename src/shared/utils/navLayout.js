import { matchPath } from "react-router-dom";
import { translate } from "../i18n/translate";
import { isTabActive } from "./isTabActive";

// ─────────────────────────────────────────────────────────────
// «Untere Leiste» (часть 35): что стоит в нижней панели телефона и в боковом меню ПК.
// Раскладка — список: ключ раздела ("start") или группа { id, name, icon, items: ["tests", "noten"] }.
// «Mehr» в списке не хранится: он всегда последний. Здесь только чистые функции — их проверяют тесты.
// ─────────────────────────────────────────────────────────────

// Разделы, которые можно поставить в панель. activeOn — где ещё вкладка светится,
// feature — раздел, который школа может выключить (me.features), ready: false — раздела ещё нет.
// Noten и Fehlzeiten (часть 36b) — только если у школы есть InfoPoint (features.noten)
export const SECTIONS = {
  start: { to: "/start", get label() { return translate("Start"); } },
  woche: { to: "/woche", get label() { return translate("Woche"); }, end: true, activeOn: ["/", "/tag"] },
  heute: { to: "/heute", get label() { return translate("Heute"); } },
  tests: { to: "/testen", get label() { return translate("Tests"); }, list: "exams" },
  aufgaben: { to: "/testen?liste=hausaufgaben", get label() { return translate("Aufgaben"); }, list: "homework" },
  termine: { to: "/testen?liste=termine", get label() { return translate("Termine"); }, list: "appointments" },
  noten: { to: "/noten", get label() { return translate("Noten"); }, feature: "noten", activeOn: ["/fehlzeiten"] },
  fehlzeiten: { to: "/fehlzeiten", get label() { return translate("Fehlzeiten"); }, feature: "noten" },
  materialien: { to: "/materialien", get label() { return translate("Materialien"); } },
  statistik: { to: "/statistik", get label() { return translate("Statistik"); }, feature: "statistics" },
  // Karteikarten (часть 43): по умолчанию в «Mehr», в панель — через «Untere Leiste»
  karteikarten: { to: "/karteikarten", get label() { return translate("Karteikarten"); } },
  // Lerntimer (часть 44): тоже в «Mehr», в панель — через «Untere Leiste»
  lerntimer: { to: "/lerntimer", get label() { return translate("Lerntimer"); } },
};
export const SECTION_KEYS = Object.keys(SECTIONS);

// Значки, которые можно выбрать для группы (сами иконки — в components/navbar/navIcons.js)
export const GROUP_ICONS = ["award", "clock", "folder", "chart", "star", "book"];

// Сколько пунктов верхнего уровня (без «Mehr»): телефон — 4 (+ Mehr = 5), ПК — 8. В группе — до 6
export const LIMITS = { phone: 4, pc: 8 };
export const GROUP_LIMIT = 6;
export const MENU_STYLES = ["kompakt", "gross"];

// «Leistung»: Tests, Noten (владелец) и Aufgaben — группа остаётся группой и в школе без InfoPoint
const leistung = () => ({ id: "leistung", name: "Leistung", icon: "award", items: ["tests", "noten", "aufgaben"] });
export const defaultNav = (device) =>
  device === "pc" ? ["start", "woche", "heute", leistung(), "materialien"] : ["start", "woche", leistung()];

export const isGroup = (item) => typeof item === "object" && item !== null;

// Раскладка из настроек (или из Sync) → проверенная: только известные разделы, без повторов,
// группы с id и не больше лимитов. Мусор или null — по умолчанию
export function cleanNav(list, device = "phone") {
  if (!Array.isArray(list)) return defaultNav(device);
  const seen = new Set();
  const groupIds = new Set();
  const take = (key) => typeof key === "string" && SECTIONS[key] && !seen.has(key) && seen.add(key);
  const out = [];
  for (const item of list) {
    if (out.length >= LIMITS[device]) break;
    if (isGroup(item)) {
      const id = typeof item.id === "string" && item.id && !groupIds.has(item.id) ? item.id : null;
      if (!id) continue;
      groupIds.add(id);
      const items = (Array.isArray(item.items) ? item.items : []).filter(take).slice(0, GROUP_LIMIT);
      const name = typeof item.name === "string" ? item.name.trim().slice(0, 24) : "";
      out.push({ id, name: name || "Gruppe", icon: GROUP_ICONS.includes(item.icon) ? item.icon : GROUP_ICONS[0], items });
    } else if (take(item)) out.push(item);
  }
  return out;
}

export const navOf = (nav, device) => cleanNav(nav?.[device], device);
export const menuStyleOf = (nav) => (MENU_STYLES.includes(nav?.menu) ? nav.menu : "kompakt");

// Раздел доступен: уже есть в приложении и школа его не выключила (features ещё нет — показываем)
export const sectionAvailable = (key, features) => {
  const s = SECTIONS[key];
  return Boolean(s) && s.ready !== false && (!s.feature || features?.[s.feature] !== false);
};

// Все разделы, которые стоят в раскладке (и в группах)
export const placedKeys = (list) => list.flatMap((item) => (isGroup(item) ? item.items : [item]));

// Разделы, которых нет в панели — им место в «Mehr» (в порядке SECTIONS)
export const restOf = (list, features) => {
  const placed = new Set(placedKeys(list));
  return SECTION_KEYS.filter((key) => !placed.has(key) && sectionAvailable(key, features));
};

// Какой список открыт на /testen: ?liste=hausaufgaben — Hausaufgaben (часть 14), ?liste=termine — Termine (18)
const LIST_MODES = { hausaufgaben: "homework", termine: "appointments" };
export const listModeOf = (search) => LIST_MODES[new URLSearchParams(search ?? "").get("liste")] ?? "exams";

// Вкладка для меню: { key, to, label, end, activeOn, lists }.
// Woche на телефоне светится и на /heute, пока Heute нет в панели.
// lists — какие списки /testen светят вкладку: Tests берёт себе и Aufgaben/Termine, если их нет в панели
const tabOf = (key, list) => {
  const s = SECTIONS[key];
  const placed = placedKeys(list);
  const activeOn = key === "woche" && !placed.includes("heute") ? [...s.activeOn, "/heute"] : s.activeOn;
  const lists = !s.list ? undefined : key === "tests" ? ["exams", ...["aufgaben", "termine"].filter((k) => !placed.includes(k)).map((k) => SECTIONS[k].list)] : [s.list];
  return { key, to: s.to, get label() { return s.label; }, end: s.end, activeOn, lists };
};

// Вкладка выбрана? Для списков /testen смотрим ещё и ?liste=
export const navTabActive = (tab, pathname, search) =>
  tab.lists ? Boolean(matchPath({ path: "/testen", end: false }, pathname)) && tab.lists.includes(listModeOf(search)) : isTabActive(tab, pathname);

// Пути разделов, которые сейчас в «Mehr»: на них светится вкладка «Mehr»
// (кроме тех, где уже светится вкладка из панели: Fehlzeiten — у Noten)
export const restPaths = (list, features) => {
  const covered = new Set(placedKeys(list).flatMap((key) => SECTIONS[key]?.activeOn ?? []));
  return restOf(list, features).filter((key) => !SECTIONS[key].list).map((key) => SECTIONS[key].to).filter((path) => !covered.has(path));
};

// Раскладка → то, что рисуют панель и сайдбар: [{ type: "link", tab } | { type: "group", id, name, icon, tabs }].
// Недоступные разделы пропускаем; пустую группу — тоже; группа из одного раздела становится обычной вкладкой
export function visibleNav(list, features) {
  const out = [];
  for (const item of list) {
    if (!isGroup(item)) {
      if (sectionAvailable(item, features)) out.push({ type: "link", tab: tabOf(item, list) });
      continue;
    }
    const tabs = item.items.filter((key) => sectionAvailable(key, features)).map((key) => tabOf(key, list));
    if (tabs.length === 1) out.push({ type: "link", tab: tabs[0] });
    else if (tabs.length > 1) out.push({ type: "group", id: item.id, name: item.name, icon: item.icon, tabs });
  }
  return out;
}

// ── Правка на странице «Untere Leiste» ──
// Для перетаскивания раскладка раскладывается по «контейнерам»: top (верхний уровень: ключи и id групп «g:…»),
// одна колонка на каждую группу (ключ — «g:id») и rest («In „Mehr“»). После хода собираем обратно.

export const groupKey = (id) => `g:${id}`;
const isGroupKey = (key) => key.startsWith("g:");

export function toContainers(list, features) {
  const c = { top: [], rest: restOf(list, features) };
  for (const item of list) {
    if (isGroup(item)) {
      c.top.push(groupKey(item.id));
      c[groupKey(item.id)] = [...item.items];
    } else c.top.push(item);
  }
  return c;
}

// Контейнеры → раскладка. Имя и значок групп берём из старой раскладки
export function fromContainers(c, list) {
  const groups = Object.fromEntries(list.filter(isGroup).map((g) => [groupKey(g.id), g]));
  return c.top.map((key) => (isGroupKey(key) ? { ...groups[key], items: c[key] ?? [] } : key));
}

export const containerOf = (c, id) => Object.keys(c).find((k) => c[k].includes(id));
const topCount = (c) => c.top.length;
// Пустое место в конце списка: «top», «rest» или «in:g:id» (внутри группы — id группы занят её строкой наверху)
export const dropZone = (key) => (isGroupKey(key) ? `in:${key}` : key);
export const zoneTarget = (over) => (over === "top" || over === "rest" ? over : over.startsWith("in:") ? over.slice(3) : null);

// Перенести пункт active на место over (пункт или сам контейнер). Возвращает { c, error }:
// error = "voll" — наверху нет места, "gruppe-voll" — в группе уже 6, "nein" — так нельзя (группу в группу)
export function moveItem(c, active, over, device = "phone") {
  if (!over || active === over) return { c, error: null };
  const from = containerOf(c, active);
  // «over» — пустая группа или список целиком: кладём в конец
  const zone = zoneTarget(over);
  const to = zone ?? containerOf(c, over);
  if (!from || !to) return { c, error: null };
  if (isGroupKey(active) && to !== "top") return { c, error: "nein" };
  if (from !== to && to === "top" && topCount(c) >= LIMITS[device]) return { c, error: "voll" };
  if (!c[to]) return { c, error: null };
  if (from !== to && isGroupKey(to) && c[to].length >= GROUP_LIMIT) return { c, error: "gruppe-voll" };
  const next = { ...c, [from]: c[from].filter((id) => id !== active) };
  const target = from === to ? next[from] : [...c[to]];
  const at = zone ? target.length : c[to].indexOf(over);
  target.splice(at < 0 ? target.length : at, 0, active);
  next[to] = target;
  return { c: next, error: null };
}

// Плюс у раздела в «In „Mehr“»: вниз, в конец (перед «Mehr»)
export function addToNav(list, key, device = "phone") {
  if (list.length >= LIMITS[device]) return { list, error: "voll" };
  return { list: [...list, key], error: null };
}

// Минус: убрать раздел (из верхнего уровня или из группы) — он появится в «Mehr»
export const removeFromNav = (list, key) =>
  list.filter((item) => item !== key).map((item) => (isGroup(item) ? { ...item, items: item.items.filter((k) => k !== key) } : item));

// «Gruppe hinzufügen»: новая пустая группа в конце (id — свободный номер)
export function addGroup(list, device = "phone") {
  if (list.length >= LIMITS[device]) return { list, id: null, error: "voll" };
  const ids = new Set(list.filter(isGroup).map((g) => g.id));
  let n = 1;
  while (ids.has(`gruppe${n}`)) n += 1;
  const id = `gruppe${n}`;
  return { list: [...list, { id, name: translate("Gruppe"), icon: "star", items: [] }], id, error: null };
}

// Имя, значок группы
export const updateGroup = (list, id, patch) => list.map((item) => (isGroup(item) && item.id === id ? { ...item, ...patch } : item));

// «Gruppe auflösen»: группа исчезает, её разделы уходят в «Mehr»
export const dissolveGroup = (list, id) => list.filter((item) => !(isGroup(item) && item.id === id));

// Сколько мест занято внизу — «4 von 5» (Mehr тоже место)
export const placesUsed = (list) => list.length + 1;

// ── Подсветка после правки (часть 38) ──
// Ключ пункта, как его видят панель и сайдбар: раздел — его ключ ("start"), группа — её id
const entryKey = (entry) => (entry.type === "link" ? entry.tab.key : entry.id);
// Что видно у группы: имя, значок и разделы — поменялось что-то из этого, группа светится
const entryLook = (entry) => (entry.type === "group" ? [entry.name, entry.icon, ...entry.tabs.map((tab) => tab.key)].join("|") : "");

// Какие пункты сохранили порядок: самая длинная цепочка, идущая в «до» по возрастанию (остальные — сдвинуты)
function keptInOrder(positions) {
  const best = positions.map(() => 1);
  const prev = positions.map(() => -1);
  positions.forEach((p, i) => {
    for (let j = 0; j < i; j++) if (positions[j] < p && best[j] + 1 > best[i]) [best[i], prev[i]] = [best[j] + 1, j];
  });
  const kept = new Set();
  for (let i = best.indexOf(Math.max(0, ...best)); i >= 0; i = prev[i]) kept.add(i);
  return kept;
}

// Что подсветить после правки раскладки: новые пункты, группы с другим содержимым, сдвинутые пункты
// и "mehr", если какой-то раздел ушёл в «Mehr». Сравниваем то, что видно (visibleNav), а не сырой список
export function navChanges(before, after, features) {
  const was = visibleNav(before, features);
  const now = visibleNav(after, features);
  const wasAt = new Map(was.map((entry, i) => [entryKey(entry), i]));
  const common = now.filter((entry) => wasAt.has(entryKey(entry)));
  const kept = keptInOrder(common.map((entry) => wasAt.get(entryKey(entry))));
  const out = now
    .filter((entry) => {
      const at = wasAt.get(entryKey(entry));
      if (at === undefined) return true; // новый
      if (entryLook(was[at]) !== entryLook(entry)) return true; // у группы другое имя, значок или разделы
      return !kept.has(common.indexOf(entry)); // сдвинут
    })
    .map(entryKey);
  const placedNow = new Set(placedKeys(after));
  if (placedKeys(before).some((key) => !placedNow.has(key))) out.push("mehr");
  return out;
}
