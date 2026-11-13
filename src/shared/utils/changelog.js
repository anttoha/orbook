import { dayNumber, monthLong } from "./format";

// Группы записи в том порядке, в каком их показываем
export const GROUPS = [
  { key: "neu", title: "Neu", variant: "changed" },
  { key: "behoben", title: "Behoben", variant: "ok" },
  { key: "entfernt", title: "Entfernt", variant: "off" },
];

// Только непустые группы: { key, title, variant, items }
export const groupsOf = (entry) => GROUPS.map((g) => ({ ...g, items: entry?.[g.key] ?? [] })).filter((g) => g.items.length > 0);

export const changeCount = (entry) => groupsOf(entry).reduce((sum, g) => sum + g.items.length, 0);

// «12. November» и «12. November 2026»
export const newsDate = (iso) => `${dayNumber(iso)}. ${monthLong(iso)}`;
export const newsDateLong = (iso) => `${newsDate(iso)} ${iso.slice(0, 4)}`;

// «8. November 2026 · 2 Änderungen» — подпись свёрнутой версии
export const entryHint = (entry) => {
  const n = changeCount(entry);
  return `${newsDateLong(entry.date)} · ${n} ${n === 1 ? "Änderung" : "Änderungen"}`;
};

// «0.14.1» → [0, 14, 1]: сравнивать версии числами, а не строками («0.10» новее «0.9»)
const versionParts = (version) => String(version ?? "").split(".").map((part) => Number(part) || 0);
export function compareVersions(a, b) {
  const [x, y] = [versionParts(a), versionParts(b)];
  for (let i = 0; i < Math.max(x.length, y.length); i++) {
    if ((x[i] ?? 0) !== (y[i] ?? 0)) return (x[i] ?? 0) - (y[i] ?? 0);
  }
  return 0;
}

// Есть ли то, что человек ещё не видел (метка NEU в «Mehr»): верхняя запись НОВЕЕ увиденной.
// Именно «новее», а не «другая»: если запись убрали (только для админа), окно не откроется второй раз
export const hasNews = (seen, entries) => Boolean(entries[0]) && (!seen || compareVersions(entries[0].version, seen) > 0);

// Показывать ли окно «Was ist neu» само.
// Новичок (ещё не выбрал курсы) окна не получает: для него всё и так новое — его версию просто помечаем как увиденную.
// Все версии, которых человек ещё не видел (новее seen), сверху вниз. seen нет — только последняя
export const unseenEntries = (seen, entries) => {
  const fresh = seen ? entries.filter((entry) => compareVersions(entry.version, seen) > 0) : [];
  return fresh.length ? fresh : entries.slice(0, 1);
};

export const shouldAutoShow = ({ seen, entries, isNewUser }) => hasNews(seen, entries) && !isNewUser;
