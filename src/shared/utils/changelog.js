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

// Есть ли то, что человек ещё не видел (метка NEU в «Mehr»)
export const hasNews = (seen, entries) => Boolean(entries[0]) && seen !== entries[0].version;

// Показывать ли окно «Was ist neu» само.
// Новичок (ещё не выбрал курсы) окна не получает: для него всё и так новое — его версию просто помечаем как увиденную.
export const shouldAutoShow = ({ seen, entries, isNewUser }) => hasNews(seen, entries) && !isNewUser;
