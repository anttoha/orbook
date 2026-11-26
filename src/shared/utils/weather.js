// ─────────────────────────────────────────────────────────────
// weather.js — погода (часть 50a). Чистые функции без React, все поля могут быть null.
// Данные — ответ GET /api/weather: { place: {name}, updatedAt, days: [{ date, code, tMax, tMin,
// rainMax, rainFrom, windMax, uvMax, hours: [{ hour, temp, code, rain }] }] }
// ─────────────────────────────────────────────────────────────
import { translate } from "../i18n/translate";
import { berlinClock, berlinToday } from "./admin";
import { planMomentText } from "./format";

// Пороги «что надеть» по умолчанию (в части 50b их можно поменять в «Für dich jetzt»)
export const DEFAULT_TIPS = { regenjacke: 50, jacke: 12, muetze: 3, sonnencreme: 6 };
// С какой вероятности дождя час в шторке подсвечивается синим
export const RAIN_HINT = 30;
// Ниже — день «trocken»
const DRY_BELOW = 20;

// Код погоды WMO → вид значка (компонент WeatherIcon рисует по нему lucide-иконку)
export function weatherKind(code) {
  if (code == null) return null;
  if (code <= 1) return "sun";
  if (code === 2) return "cloud-sun";
  if (code === 3) return "cloud";
  if (code === 45 || code === 48) return "fog";
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "snow";
  if (code >= 95) return "storm";
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return "rain";
  return "cloud"; // неизвестный код — нейтрально
}

// Погода на дату или null (нет прогноза: дальше 7 дней, выключено, не загружено)
export const dayOf = (weather, date) => weather?.days?.find((d) => d.date === date) ?? null;

// «07:05» → час прогноза (ближайший): 07:05 → 7, 07:40 → 8
export function hourAt(day, time) {
  if (!day?.hours?.length || !/^\d{1,2}:\d{2}$/.test(time ?? "")) return null;
  const [h, m] = time.split(":").map(Number);
  const target = m >= 30 ? h + 1 : h;
  return day.hours.find((x) => x.hour === target) ?? null;
}

// «ab 13 Uhr» или null
export const rainFrom = (day) => (day?.rainFrom != null ? translate("ab {h} Uhr", { h: day.rainFrom }) : null);

// «Regen 60 % ab 13 Uhr» / «Regen 30 %» / «trocken» / null (нет данных)
export function rainText(day) {
  if (day?.rainMax == null) return null;
  if (day.rainMax < DRY_BELOW) return translate("trocken");
  const from = rainFrom(day);
  return from ? translate("Regen {n} % {from}", { n: day.rainMax, from }) : translate("Regen {n} %", { n: day.rainMax });
}

// Вторая строка карточки: «Regen 60 % ab 13 Uhr · Wind 18 km/h» (чего нет — пропускаем)
export function summaryLine(day) {
  const parts = [rainText(day), day?.windMax != null ? translate("Wind {n} km/h", { n: day.windMax }) : null];
  const text = parts.filter(Boolean).join(" · ");
  return text ? text[0].toUpperCase() + text.slice(1) : "";
}

// «17°» или «–» без данных
export const degrees = (value) => (value == null ? "–" : `${value}°`);

// Время выхода: начало первого своего урока минус leaveMinutes → «07:05» или null
export function leaveTime(lessons, leaveMinutes = 45) {
  const starts = (lessons ?? [])
    .filter((l) => l.start && l.status !== "cancelled" && !l.notMine)
    .map((l) => toMinutes(l.start))
    .filter((m) => m != null);
  if (!starts.length) return null;
  const at = Math.max(0, Math.min(...starts) - leaveMinutes);
  return `${String(Math.floor(at / 60)).padStart(2, "0")}:${String(at % 60).padStart(2, "0")}`;
}

function toMinutes(time) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(time ?? "");
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
}

// «Что надеть» по погоде: [{ key, label }] в порядке Regenjacke, Jacke, Mütze & Schal, Sonnencreme.
// at — час к выходу (его температура), без него — минимум дня. Порог null — этот совет выключен.
export function weatherTips(day, at = null, tips = DEFAULT_TIPS) {
  if (!day) return [];
  const temp = at?.temp ?? day.tMin;
  const rain = day.rainMax;
  const out = [];
  if (tips.regenjacke != null && rain != null && rain >= tips.regenjacke) out.push({ key: "regenjacke", label: translate("Regenjacke") });
  if (tips.jacke != null && temp != null && temp < tips.jacke) out.push({ key: "jacke", label: translate("Jacke") });
  if (tips.muetze != null && temp != null && temp < tips.muetze) out.push({ key: "muetze", label: translate("Mütze & Schal") });
  if (tips.sonnencreme != null && day.uvMax != null && day.uvMax >= tips.sonnencreme) out.push({ key: "sonnencreme", label: translate("Sonnencreme") });
  return out;
}

// Часы школьного дня для шторки: 07…14 (что есть в прогнозе)
export const schoolHours = (day, from = 7, to = 14) => (day?.hours ?? []).filter((h) => h.hour >= from && h.hour <= to);

// «9° · trocken» / «9° · Regen 40 %» — погода в час выхода
export function leaveLine(hour) {
  if (!hour) return null;
  const rain = hour.rain == null ? null : hour.rain < RAIN_HINT ? translate("trocken") : translate("Regen {n} %", { n: hour.rain });
  return { temp: degrees(hour.temp), rain };
}

// «Stand»: когда сервер забрал прогноз (UTC) → «06:12» сегодня, иначе «gestern 21:30» / «Mi, 25.11. 21:30».
// Считаем от настоящего сегодня (не от демо-даты плана): время прогноза настоящее
export function standLabel(iso, now = new Date()) {
  const moment = Date.parse(iso ?? "");
  if (Number.isNaN(moment)) return null;
  const date = new Date(moment);
  const local = `${berlinToday(date)}T${berlinClock(date)}`;
  return berlinToday(now) === local.slice(0, 10) ? local.slice(11, 16) : planMomentText(local, berlinToday(now));
}

// Одно и то же место (админка: выбранное в списке, «есть что сохранить»). null и null — одно и то же
export const samePlace = (a, b) => (a && b ? a.lat === b.lat && a.lon === b.lon : !a && !b);
