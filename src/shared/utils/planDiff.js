// Плашка «Neuer Plan»: що змінилось між збереженим і свіжим тижнем.
// Сервер каже тільки «план змінився» (plan/status.lastChangeAt), а що саме — рахує клієнт.
// Основа — гайд orbook-be (docs/frontend/08-zustaende.md).
import { addDays, subjectName } from "./format";

const signature = (lesson) => [lesson.period, lesson.status, lesson.subject?.code, lesson.teacher, lesson.room].join("|");

// Нові «особливі» уроки (заміни, відміни, зміни кабінету) на сьогодні й пізніше. prevWeek = null → [] (перше завантаження)
export function planChanges(prevWeek, nextWeek, todayIso) {
  if (!prevWeek) return [];
  const changes = [];
  for (const day of nextWeek.days) {
    if (day.date < todayIso || day.status !== "ok") continue;
    const before = new Set((prevWeek.days.find((d) => d.date === day.date)?.lessons ?? []).map(signature));
    for (const lesson of day.lessons) {
      if (lesson.status !== "normal" && !before.has(signature(lesson))) changes.push({ date: day.date, weekday: day.weekday, lesson });
    }
  }
  return changes.sort((a, b) => a.date.localeCompare(b.date) || a.lesson.period - b.lesson.period);
}

// «Morgen: 4. Std Geschichte → Vertretung», «Heute: 3. Std Englisch fällt aus», «Do: 2. Std Mathe → Raum 204»
export function changeText({ date, weekday, lesson }, todayIso) {
  const when = date === todayIso ? "Heute" : date === addDays(todayIso, 1) ? "Morgen" : weekday;
  const what = lesson.status === "cancelled" ? "fällt aus" : lesson.status === "room_change" ? `→ Raum ${lesson.room ?? "?"}` : "→ Vertretung";
  return `${when}: ${lesson.period}. Std ${subjectName(lesson.subject)} ${what}`;
}
