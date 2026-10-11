// ─────────────────────────────────────────────────────────────
// lessonClock.js — «Jetzt», «noch 27 min», «Pause · 20 min» за часом ШКОЛИ (Europe/Berlin).
// З гайду orbook-be (docs/frontend/03-plan.md).
// Годинник телефона може брехати, а в демо «сьогодні» зафіксоване — тому поправку
// беремо з meta.serverTime (там справжній час школи).
// ─────────────────────────────────────────────────────────────

const berlin = new Intl.DateTimeFormat("de-DE", {
  timeZone: "Europe/Berlin",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

// Date → { date: "YYYY-MM-DD", hhmm: "HH:MM", minutes: хвилин від півночі } у Берліні
export function berlinParts(date) {
  const p = Object.fromEntries(berlin.formatToParts(date).map((x) => [x.type, x.value]));
  const hhmm = `${p.hour}:${p.minute}`;
  return { date: `${p.year}-${p.month}-${p.day}`, hhmm, minutes: Number(p.hour) * 60 + Number(p.minute) };
}

// "10:30" → 630 (хвилин від півночі)
export const toMinutes = (hhmm) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));

// Годинник школи: різниця між serverTime і годинником пристрою запам'ятовується
export function createSchoolClock(serverTime, clientNow = () => Date.now()) {
  const skew = serverTime ? Date.parse(serverTime) - clientNow() : 0; // поправка в мілісекундах
  return { now: () => new Date(clientNow() + skew) };
}

// lessons — уроки ОДНОГО дня (вже відфільтровані «Meine Kurse»). Урок 10 без часу пропускається.
export function lessonState(lessons, now) {
  const { minutes } = berlinParts(now);
  const timed = lessons
    .filter((l) => l.start && l.end && l.status !== "cancelled")
    .sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
  const current = timed.find((l) => toMinutes(l.start) <= minutes && minutes < toMinutes(l.end)) ?? null;
  const next = timed.find((l) => toMinutes(l.start) > minutes) ?? null;
  const last = timed.at(-1) ?? null;
  return {
    current, // урок, що йде зараз, або null
    minutesLeft: current ? toMinutes(current.end) - minutes : null, // «noch 27 min»
    next, // найближчий наступний
    breakMinutes: !current && next ? toMinutes(next.start) - minutes : null, // «Pause · 20 min» до next
    over: Boolean(last) && minutes >= toMinutes(last.end), // уроки на сьогодні скінчились
  };
}

// «Danach 20 min Pause · 11:35 Geschichte, Raum 108» — після уроку, що йде
export function afterText(current, next, subjectName) {
  if (!next) return "Danach ist Schulschluss";
  const pause = toMinutes(next.start) - toMinutes(current.end);
  const room = next.room ? `, Raum ${next.room}` : "";
  const what = `${next.start} ${subjectName(next.subject)}${room}`;
  return pause > 0 ? `Danach ${pause} min Pause · ${what}` : `Danach · ${what}`;
}

// Яка частина уроку вже пройшла (0…1) — для смужки прогресу
export function lessonProgress(lesson, now) {
  const { minutes } = berlinParts(now);
  const start = toMinutes(lesson.start);
  const end = toMinutes(lesson.end);
  return Math.min(1, Math.max(0, (minutes - start) / (end - start)));
}

// Урок уже скінчився? (день у минулому або сьогодні після кінця уроку)
export function isLessonPast(lesson, dateIso, now) {
  const { date, minutes } = berlinParts(now);
  if (dateIso !== date) return dateIso < date; // інший день: минулий — так, майбутній — ні
  return Boolean(lesson.end) && toMinutes(lesson.end) <= minutes;
}

// Урок іде прямо зараз?
export function isLessonNow(lesson, dateIso, now) {
  const { date, minutes } = berlinParts(now);
  if (dateIso !== date || !lesson.start || !lesson.end || lesson.status === "cancelled") return false;
  return toMinutes(lesson.start) <= minutes && minutes < toMinutes(lesson.end);
}
