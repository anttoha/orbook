// «Verlauf des Tages» (часть 26): что менялось между Fassungen плана одного дня.
// Сервер отдаёт только сами Fassungen (GET /api/day/versions), разницу считаем здесь.
// Поля урока бывают null (subject, teacher, room, course) — везде запасной текст.
import { addDays, lessonName, weekdayShort } from "./format";

// Один урок в разных Fassungen узнаём по номеру урока и курсу (у «лишних» уроков курса нет — тогда предмет)
const keyOf = (lesson) => `${lesson.period}|${lesson.course?.nr ?? lesson.subject?.code ?? "–"}`;

// Что видно ученику в уроке; если это не изменилось — изменения нет
const looks = (lesson) => [lesson.status, lesson.subject?.code, lesson.teacher, lesson.room].join("|");

const TITLE = (lesson) => `${lesson.period}. Std · ${lessonName(lesson)}`;

// Вид изменения → бейдж справа в ленте
const KIND_BY_STATUS = { cancelled: "aus", substitution: "vertretung", room_change: "raum", moved: "verlegt", added: "neu", normal: "normal" };
export const KIND_BADGE = { aus: "FÄLLT AUS", vertretung: "VERTRETUNG", raum: "RAUM", verlegt: "VERLEGT", neu: "NEU", weg: "WEG", normal: "WIE IMMER", info: "NEU" };

// «Kle statt Mü · Raum 204 statt 108»: только то, что правда поменялось
export function differenceText(now, before) {
  if (now.status === "cancelled") return now.info?.trim() || "fällt aus";
  const parts = [];
  if (before && now.subject?.code !== before.subject?.code) parts.push(`${lessonName(now)} statt ${lessonName(before)}`);
  if (before && now.teacher !== before.teacher) parts.push(`${now.teacher ?? "–"} statt ${before.teacher ?? "–"}`);
  if (before && now.room !== before.room) parts.push(`Raum ${now.room ?? "?"} statt ${before.room ?? "?"}`);
  if (parts.length) return parts.join(" · ");
  if (before?.status === "cancelled") return "findet wieder statt";
  return now.info?.trim() || "geändert";
}

const sameInfo = (a = [], b = []) => a.length === b.length && a.every((line, i) => line === b[i]);

// Изменения от older к newer. visible(lesson) — показывать ли этот урок (Meine Kurse / Alle Kurse).
// → { items: [{ key, code, title, kind, text }], hidden: N изменений в чужих курсах, infoChanged }
export function versionChanges(newer, older, visible = () => true) {
  const before = new Map((older?.lessons ?? []).map((lesson) => [keyOf(lesson), lesson]));
  const after = new Map((newer?.lessons ?? []).map((lesson) => [keyOf(lesson), lesson]));
  const items = [];
  let hidden = 0;
  const add = (lesson, item) => (visible(lesson) ? items.push({ key: keyOf(lesson), code: lesson.subject?.code ?? null, title: TITLE(lesson), period: lesson.period, ...item }) : hidden++);

  for (const [key, lesson] of after) {
    const old = before.get(key);
    if (!old) add(lesson, { kind: lesson.status === "cancelled" ? "aus" : "neu", text: lesson.status === "cancelled" ? differenceText(lesson) : lesson.info?.trim() || "neu im Plan" });
    else if (looks(lesson) !== looks(old)) add(lesson, { kind: KIND_BY_STATUS[lesson.status] ?? "neu", text: differenceText(lesson, old) });
  }
  for (const [key, old] of before) {
    if (!after.has(key)) add(old, { kind: "weg", text: "nicht mehr im Plan" });
  }
  items.sort((a, b) => a.period - b.period);
  return { items, hidden, infoChanged: Boolean(older) && !sameInfo(newer?.info, older?.info) };
}

// Первая Fassung: «Veröffentlicht · 6 Stunden, alles normal» / «… · 6 Stunden · 1 fällt aus, 1 Vertretung»
export function firstVersionText(version, visible = () => true) {
  const lessons = (version?.lessons ?? []).filter(visible);
  const periods = new Set(lessons.map((lesson) => lesson.period)).size;
  const count = (status) => lessons.filter((lesson) => lesson.status === status).length;
  const extras = [
    [count("cancelled"), "fällt aus", "fallen aus"],
    [count("substitution"), "Vertretung", "Vertretungen"],
    [count("room_change"), "Raumänderung", "Raumänderungen"],
  ]
    .filter(([n]) => n > 0)
    .map(([n, one, many]) => `${n} ${n === 1 ? one : many}`);
  const hours = `${periods} ${periods === 1 ? "Stunde" : "Stunden"}`;
  return extras.length ? `Veröffentlicht · ${hours} · ${extras.join(", ")}` : `Veröffentlicht · ${hours}, alles normal`;
}

// Подпись Fassung: «Heute 07:12», «Gestern 15:15», «Mo 14:02» (в пределах недели), «Mo 3.11. 14:02»
export function versionLabel(moment, today) {
  if (!moment) return "—";
  const date = moment.slice(0, 10);
  const time = moment.slice(11, 16);
  if (date === today) return `Heute ${time}`;
  if (date === addDays(today, -1)) return `Gestern ${time}`;
  if (date > addDays(today, -7) && date < today) return `${weekdayShort(date)} ${time}`;
  const [, month, day] = date.split("-");
  return `${weekdayShort(date)} ${Number(day)}.${Number(month)}. ${time}`;
}

// Для предложения: «heute um 07:12», «gestern um 15:15», «am Mo um 14:02», «am Mo 3.9. um 14:02»
export function momentPhrase(moment, today) {
  const label = versionLabel(moment, today);
  if (label === "—") return "unbekannt";
  const time = label.slice(-5);
  const when = label.slice(0, -6);
  return when === "Heute" || when === "Gestern" ? `${when.toLowerCase()} um ${time}` : `am ${when} um ${time}`;
}

// Подсказка над старой Fassung: «So stand der Plan gestern um 15:15. Heute um 07:12 hat er sich geändert.»
export function versionNote(version, newer, today) {
  const first = `So stand der Plan ${momentPhrase(version?.fetchedAt, today)}.`;
  if (!newer) return first;
  const next = momentPhrase(newer.fetchedAt, today);
  return `${first} ${next.charAt(0).toUpperCase()}${next.slice(1)} hat er sich geändert.`;
}

// Лента «Verlauf des Tages»: версии новые сверху (как с сервера) + что изменилось в каждой
export function dayHistory(versions, visible = () => true) {
  const list = versions ?? [];
  return list.map((version, i) => {
    const older = list[i + 1] ?? null;
    const changes = older ? versionChanges(version, older, visible) : null;
    return {
      id: version.id,
      fetchedAt: version.fetchedAt,
      current: i === 0,
      first: !older,
      changes,
      summary: older ? null : firstVersionText(version, visible),
    };
  });
}

// Старая Fassung рядом с текущей: у каких её уроков сейчас всё иначе и как («Jetzt: fällt aus»)
// → Map(key → текст) только для изменившихся уроков
export function changedSince(oldVersion, current) {
  const now = new Map((current?.lessons ?? []).map((lesson) => [keyOf(lesson), lesson]));
  const result = new Map();
  for (const lesson of oldVersion?.lessons ?? []) {
    const fresh = now.get(keyOf(lesson));
    if (!fresh) result.set(keyOf(lesson), "nicht mehr im Plan");
    else if (looks(fresh) !== looks(lesson)) result.set(keyOf(lesson), differenceText(fresh, lesson));
  }
  return result;
}

export { keyOf as versionLessonKey };
