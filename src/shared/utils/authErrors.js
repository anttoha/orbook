import { retryText } from "../api/api";
import { translate } from "../i18n/translate";

// Скільки триває блокування після кількох неправильних паролів. Сервер не віддає це число
// до входу (security.lockMinutes, за замовчуванням 10). Точний час приходить разом із 429.
export const LOCK_MINUTES = 10;

// Текст під полем пароля. Сервер уже пише німецькою, тому переважно показуємо його текст.
export function loginErrorText(error) {
  if (error.code === "wrong_password") {
    const left = error.details?.attemptsLeft;
    if (!(left > 0)) return error.message; // кількість невідома або спроби скінчились
    return translate("{message} Noch {left} {v3}, dann {LOCK_MINUTES} Minuten Pause.", { message: error.message, left, v3: left === 1 ? translate("Versuch") : translate("Versuche"), LOCK_MINUTES });
  }
  if (error.status === 429) return retryText(error);
  if (error.code === "not_configured") return translate("ORBook ist noch nicht eingerichtet.");
  // Zugangscode (частина 14c, макет handy-10): ліміт пристроїв повний
  if (error.code === "code_full") {
    const { devices, maxDevices } = error.details ?? {};
    const head = maxDevices ? translate("Schon auf {v1} von {maxDevices} {v3} angemeldet.", { v1: devices ?? maxDevices, maxDevices, v3: maxDevices === 1 ? translate("Gerät") : translate("Geräten") }) : error.message;
    return translate("{head} Admin fragen: Gerät abmelden oder Limit erhöhen.", { head });
  }
  if (error.code === "code_locked" || error.code === "code_expired") return translate("{message} Bitte beim Admin nachfragen.", { message: error.message });
  return error.message; // password_disabled — сервер уже пише, що робити
}

// Плашка «Du wurdest abgemeldet» на екрані входу (макет handy-11): сесію закінчив сервер.
// Особливий текст сервера («Dein Zugang gilt nicht mehr…») показуємо як є; звичайний — «Bitte neu anmelden.»
export function signedOutNotice(error) {
  const message = error?.message ?? "";
  const generic = !message || message === "Bitte zuerst anmelden.";
  return { title: "Du wurdest abgemeldet", text: generic ? translate("Bitte neu anmelden.") : message };
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
    return left > 0 ? `${error.message} Noch ${left} ${left === 1 ? translate("Versuch") : translate("Versuche")}.` : error.message;
  }
  if (error.status === 429) return retryText(error);
  if (error.code === "not_configured") return translate("Das Admin-Passwort ist noch nicht gesetzt.");
  return error.message;
}

// Текст під полем «Lehrer-Code» (макет handy-03). До вчителя — на «Sie»
export function teacherLoginErrorText(error) {
  const ask = translate("Bitte beim Admin der Klasse nachfragen.");
  if (error.code === "code_invalid") {
    const left = error.details?.attemptsLeft;
    const rest = left > 0 ? ` Noch ${left} ${left === 1 ? translate("Versuch") : translate("Versuche")}.` : "";
    return translate("Code unbekannt oder gesperrt. {ask}{rest}", { ask, rest });
  }
  if (error.code === "code_locked" || error.code === "code_expired") return `${error.message} ${ask}`;
  return loginErrorText(error); // 429, not_configured, мережа — як у пароля класу
}
