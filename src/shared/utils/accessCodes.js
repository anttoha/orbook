// ─────────────────────────────────────────────────────────────
// Zugangscodes (частина 14c): тексти карток і форми. Без React — тому легко тестувати.
// ─────────────────────────────────────────────────────────────
import { schoolYearEnd } from "./admin";
import { addDays } from "./format";

// «Geräte höchstens»: 1 · 2 · 30 · Unbegrenzt · Andere (своє число в полі нижче). null — без ліміту
export const DEVICE_CHOICES = [
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "30", label: "30" },
  { value: "none", label: "Unbegrenzt" },
  { value: "custom", label: "Andere" },
];
export const MAX_DEVICES = 500; // те саме обмеження на сервері
const PRESETS = ["1", "2", "30"];

// Вибір + своє число → що надіслати серверу (null — без ліміту)
export function devicesFromChoice(choice, custom = "") {
  if (choice === "none") return null;
  return Number(choice === "custom" ? custom : choice);
}
// Ліміт із сервера → вибір у перемикачі (5 → «Andere» і 5 у полі)
export const choiceFromDevices = (max) => (max == null ? "none" : PRESETS.includes(String(max)) ? String(max) : "custom");

// Своє число: ціле від 1 до 500. Повертає текст помилки або null
export function customDevicesError(choice, custom) {
  if (choice !== "custom") return null;
  const n = Number(custom);
  return Number.isInteger(n) && n >= 1 && n <= MAX_DEVICES ? null : `Bitte eine Zahl von 1 bis ${MAX_DEVICES} eingeben.`;
}

// «Für wen?»: людині вистачає 2 (телефон + ноутбук), групі — 30
export const AUDIENCES = [
  { value: "person", label: "Eine Person" },
  { value: "group", label: "Eine Gruppe" },
];
export const defaultDevices = (audience) => (audience === "person" ? "2" : "30");
export const audienceHint = (audience) =>
  audience === "person" ? "Eine Person: ein Gerät reicht meistens." : "Eine Gruppe: z. B. alle Eltern oder die Vertretung.";

// Чип у картці: GRUPPE / PERSÖNLICH
export const audienceChip = (audience) => (audience === "person" ? "Persönlich" : "Gruppe");
export const audienceShort = (audience) => (audience === "person" ? "Person" : "Gruppe");

// «9 von 30 Geräten», «1 von 1 Gerät», «21 Geräte · unbegrenzt»
export function devicesText(devices, maxDevices) {
  const used = devices ?? 0;
  if (maxDevices == null) return `${used} ${used === 1 ? "Gerät" : "Geräte"} · unbegrenzt`;
  return `${used} von ${maxDevices} ${maxDevices === 1 ? "Gerät" : "Geräten"}`;
}

// Коротко для таблиці на ПК: «9 von 30», «21 · unbegrenzt»
export const devicesShort = (devices, maxDevices) => (maxDevices == null ? `${devices ?? 0} · unbegrenzt` : `${devices ?? 0} von ${maxDevices}`);

// Ліміт повний — нове пристрій не увійде (чип VOLL)
export const isFull = (code) => code.status === "ok" && code.maxDevices != null && code.devices >= code.maxDevices;

// «Halbjahr» = до 31 січня; якщо вже після — до кінця навчального року (рішення в spec 14c)
export function halfYearEnd(todayIso, yearEnd) {
  const year = Number(todayIso.slice(0, 4));
  const jan = todayIso.slice(5) <= "01-31" ? `${year}-01-31` : `${year + 1}-01-31`;
  const end = schoolYearEnd(todayIso, yearEnd);
  return end && end < jan ? end : jan;
}

// «Gültig bis»: 30 Tage · Halbjahr · Schuljahresende (без yearEnd — без останнього)
export const accessValidChoices = (yearEnd) => [
  { value: "30d", label: "30 Tage" },
  { value: "halbjahr", label: "Halbjahr" },
  ...(yearEnd ? [{ value: "schuljahresende", label: "Schuljahresende" }] : []),
];

// Дата, до якої код діятиме (для підпису «31. Juli 2027 · danach automatisch gesperrt»)
export function accessValidUntil(choice, todayIso, yearEnd) {
  if (choice === "30d") return addDays(todayIso, 30);
  if (choice === "halbjahr") return halfYearEnd(todayIso, yearEnd);
  return schoolYearEnd(todayIso, yearEnd);
}

// Що надіслати серверу в поле valid: «Halbjahr» сервер не знає — шлемо дату
export const accessValidValue = (choice, todayIso, yearEnd) => (choice === "halbjahr" ? halfYearEnd(todayIso, yearEnd) : choice);

// Нижній рядок картки: «zuletzt heute · bis 31. Juli» / «… · abgelaufen»
export const validTail = (code, shortDate) => (code.status === "expired" ? "abgelaufen" : `bis ${shortDate(code.validUntil)}`);

// Тост після дії: «»Eltern« gesperrt · 9 Geräte abgemeldet»
export function signedOutText(title, signedOut) {
  const n = signedOut ?? 0;
  if (!n) return title;
  return `${title} · ${n} ${n === 1 ? "Gerät" : "Geräte"} abgemeldet`;
}

// Підсумок над списком: «5 Zugänge · 35 Geräte angemeldet» (рядок Klassenpasswort теж рахуємо)
export function summaryText(codes, classPassword) {
  const count = codes.length + (classPassword ? 1 : 0);
  const devices = codes.reduce((sum, code) => sum + (code.devices ?? 0), 0) + (classPassword?.devices ?? 0);
  return `${count} ${count === 1 ? "Zugang" : "Zugänge"} · ${devices} ${devices === 1 ? "Gerät" : "Geräte"} angemeldet`;
}
