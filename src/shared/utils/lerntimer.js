// ─────────────────────────────────────────────────────────────
// Lerntimer (часть 44): Pomodoro и «Lernzeit». Только чистые функции — их проверяют тесты.
// Таймер считает от времени старта (а не счётчиком): закрыл вкладку, вернулся — остаток всё равно верный.
// run: { phase: "focus" | "pause", code, round, startedAt, pausedAt, pausedMs, durMs } — времена в мс (Date.now()).
// Сессия (засчитанный кусок учёбы): { id, code, day: "YYYY-MM-DD", at: "16:05", min, updatedAt }.
// ─────────────────────────────────────────────────────────────
import { addDays, mondayOf } from "./format";

const MIN = 60000;
export const KEEP_DAYS = 400; // старше — из Sync-блока выкидываем

// Готовые режимы; «eigene» — свои минуты из настроек
export const PRESETS = {
  25: { focus: 25, pause: 5, long: 15, rounds: 4 },
  50: { focus: 50, pause: 10, long: 20, rounds: 2 },
};
export const DEFAULT_SETTINGS = { preset: "25", focus: 25, pause: 5, long: 15, rounds: 4, sound: true, vibrate: true, autoPause: false };
// Границы шагов в «Einstellungen»: [минимум, максимум, шаг]
export const LIMITS = { focus: [5, 90, 5], pause: [1, 30, 1], long: [5, 45, 5], rounds: [1, 8, 1] };

// Минуты текущего режима
export const timesOf = (settings) => PRESETS[settings?.preset] ?? { ...PRESETS[25], ...pickTimes(settings) };
const pickTimes = (s) => Object.fromEntries(Object.keys(LIMITS).filter((k) => Number.isFinite(s?.[k])).map((k) => [k, s[k]]));

// Шаг «−» / «+» в настройках, не выходя за границы
export function stepValue(key, value, dir) {
  const [lo, hi, step] = LIMITS[key];
  return Math.min(hi, Math.max(lo, value + dir * step));
}

// ── Идущий таймер ──

export const startRun = (phase, { code = null, round = 1, minutes }, now) => ({ phase, code, round, startedAt: now, pausedAt: null, pausedMs: 0, durMs: minutes * MIN });

export const elapsedMs = (run, now) => Math.max(0, (run.pausedAt ?? now) - run.startedAt - run.pausedMs);
export const remainingMs = (run, now) => Math.max(0, run.durMs - elapsedMs(run, now));
export const isOver = (run, now) => Boolean(run) && remainingMs(run, now) === 0;
export const progressOf = (run, now) => (run ? remainingMs(run, now) / run.durMs : 1); // 1 — полное кольцо, 0 — пусто

export const pauseRun = (run, now) => (run.pausedAt ? run : { ...run, pausedAt: now });
export const resumeRun = (run, now) => (run.pausedAt ? { ...run, pausedAt: null, pausedMs: run.pausedMs + (now - run.pausedAt) } : run);

// Когда закончится (если не на паузе) — для «fertig um 16:52» и будильника Android
export const endsAt = (run, now) => now + remainingMs(run, now);

// Засчитанные минуты: только целые прошедшие, без пауз
export const countedMinutes = (run, now) => Math.floor(Math.min(elapsedMs(run, now), run.durMs) / MIN);

// Перерыв после раунда: последний раунд — длинная пауза
export const breakAfter = (round, times) => (round >= times.rounds ? { minutes: times.long, long: true } : { minutes: times.pause, long: false });
export const nextRound = (round, times) => (round >= times.rounds ? 1 : round + 1);

// «17:42»; час и больше — «1:05:00»
export function clockText(ms) {
  const total = Math.ceil(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = String(total % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${m}:${s}`;
}

// ── Сессии ──

const pad = (n) => String(n).padStart(2, "0");
export const localDay = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
export const localTime = (date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`;

// Кусок учёбы → сессия. Меньше минуты — null (не засчитываем)
export function sessionOf(run, now) {
  const min = countedMinutes(run, now);
  if (min < 1) return null;
  const start = new Date(run.startedAt);
  return { id: `l-${crypto.randomUUID()}`, code: run.code ?? null, day: localDay(start), at: localTime(start), min, updatedAt: new Date(now).toISOString() };
}

export const liveSessions = (sessions) => (sessions ?? []).filter((s) => !s.deleted && s.min > 0);
const sum = (list) => list.reduce((total, s) => total + s.min, 0);
const inRange = (s, from, to) => s.day >= from && s.day <= to;

export const minutesOn = (sessions, day) => sum(liveSessions(sessions).filter((s) => s.day === day));
// Сегодня — новые сверху
export const sessionsOn = (sessions, day) => liveSessions(sessions).filter((s) => s.day === day).sort((a, b) => (a.at < b.at ? 1 : -1));

// «1 h 15 min», «45 min», «2 h»
export function durationText(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h && m) return `${h} h ${m} min`;
  return h ? `${h} h` : `${m} min`;
}
// Коротко для карточки: «3 h 20», «45 min»
export const durationShort = (min) => (min >= 60 ? `${Math.floor(min / 60)} h${min % 60 ? ` ${min % 60}` : ""}` : `${min} min`);

// ── Statistik ──

// Период: неделя (Mo–So), месяц, полугодие (Aug–Jan / Feb–Jul). today — "YYYY-MM-DD"
export function rangeOf(range, today) {
  if (range === "week") {
    const from = mondayOf(today);
    return { from, to: addDays(from, 6), prevFrom: addDays(from, -7), prevTo: addDays(from, -1) };
  }
  const [y, m] = today.split("-").map(Number);
  if (range === "halfyear") {
    const first = m >= 8 || m === 1;
    const year = m === 1 ? y - 1 : y;
    const from = first ? `${year}-08-01` : `${y}-02-01`;
    const to = first ? `${year + 1}-01-31` : `${y}-07-31`;
    const prevFrom = first ? `${year}-02-01` : `${y - 1}-08-01`;
    return { from, to, prevFrom, prevTo: addDays(from, -1) };
  }
  const from = `${y}-${pad(m)}-01`;
  const prevFrom = m === 1 ? `${y - 1}-12-01` : `${y}-${pad(m - 1)}-01`;
  return { from, to: addDays(m === 12 ? `${y + 1}-01-01` : `${y}-${pad(m + 1)}-01`, -1), prevFrom, prevTo: addDays(from, -1) };
}

// Всё для раздела «Lernzeit»: минуты, раунды, разница с прошлым периодом, по предметам
export function lernzeit(sessions, range, today) {
  const { from, to, prevFrom, prevTo } = rangeOf(range, today);
  const list = liveSessions(sessions).filter((s) => inRange(s, from, to));
  const minutes = sum(list);
  const before = sum(liveSessions(sessions).filter((s) => inRange(s, prevFrom, prevTo)));
  return { minutes, rounds: list.length, diff: minutes - before, bySubject: bySubject(list) };
}

export function bySubject(list) {
  const map = new Map();
  for (const s of list) map.set(s.code ?? null, (map.get(s.code ?? null) ?? 0) + s.min);
  return [...map].map(([code, min]) => ({ code, min })).sort((a, b) => b.min - a.min);
}

// Mo–So этой недели: [{ day, min }]
export const weekDays = (sessions, today) => {
  const monday = mondayOf(today);
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i)).map((day) => ({ day, min: minutesOn(sessions, day) }));
};

// ── Sync ──

// Старые сессии (старше KEEP_DAYS) не храним; не влезает — выкидываем самые старые
export function trimSessions(sessions, today, fits = () => true) {
  const cutoff = addDays(today, -KEEP_DAYS);
  let list = (sessions ?? []).filter((s) => s.day >= cutoff).sort((a, b) => (a.day + a.at < b.day + b.at ? -1 : 1));
  while (list.length > 0 && !fits(list)) list = list.slice(Math.ceil(list.length / 10));
  return list;
}
