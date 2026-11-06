import { retryText } from "../api/api";

// Скільки триває блокування після кількох неправильних паролів. Сервер не віддає це число
// до входу (security.lockMinutes, за замовчуванням 10). Точний час приходить разом із 429.
export const LOCK_MINUTES = 10;

// Текст під полем пароля. Сервер уже пише німецькою, тому переважно показуємо його текст.
export function loginErrorText(error) {
  if (error.code === "wrong_password") {
    const left = error.details?.attemptsLeft;
    if (!(left > 0)) return error.message; // кількість невідома або спроби скінчились
    return `${error.message} Noch ${left} ${left === 1 ? "Versuch" : "Versuche"}, dann ${LOCK_MINUTES} Minuten Pause.`;
  }
  if (error.status === 429) return retryText(error);
  if (error.code === "not_configured") return "ORBook ist noch nicht eingerichtet.";
  return error.message;
}

// Скільки мілісекунд кнопка «Öffnen» лишається вимкненою. 0 — не вимикати.
export function lockDuration(error) {
  if (error.code !== "locked") return 0;
  return (error.retryAfter ?? error.details?.retryAfter ?? LOCK_MINUTES * 60) * 1000;
}

// Текст під полем «Admin-Passwort» (docs/frontend/09-admin.md): блокування адміна — 30 хвилин
export function adminLoginErrorText(error) {
  if (error.code === "wrong_password") {
    const left = error.details?.attemptsLeft;
    return left > 0 ? `${error.message} Noch ${left} ${left === 1 ? "Versuch" : "Versuche"}.` : error.message;
  }
  if (error.status === 429) return retryText(error);
  if (error.code === "not_configured") return "Das Admin-Passwort ist noch nicht gesetzt.";
  return error.message;
}
