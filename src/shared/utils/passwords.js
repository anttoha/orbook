// ─────────────────────────────────────────────────────────────
// Сторінка «Passwörter» в адмінці (частина 14b): перевірки й тексти без React.
// Мінімальну довжину так само перевіряє сервер (security/accounts.py) — тут лише щоб не чекати відповіді.
// ─────────────────────────────────────────────────────────────
export const CLASS_PASSWORD_MIN = 10;
export const ADMIN_PASSWORD_MIN = 12;

// «Mindestens 10 Zeichen.» або null, якщо довжина вже добра
export const lengthError = (password, min) => (password.length < min ? `Mindestens ${min} Zeichen.` : null);

// «1 Gerät abgemeldet», «24 Geräte abgemeldet»; число невідоме або 0 → null (нічого дописувати)
export function devicesText(count) {
  if (!(count > 0)) return null;
  return `${count} ${count === 1 ? "Gerät" : "Geräte"} abgemeldet`;
}

// Тост після зміни: «Passwort geändert · 24 Geräte abgemeldet»
export const changedText = (title, count) => [title, devicesText(count)].filter(Boolean).join(" · ");

// Готовий текст для чату класу після «Erzeugen». className може бути null (сервер ще не знає клас)
export function classShareText(password, { className, url }) {
  const forWhom = className ? `für die ${className}` : "für die Klasse";
  return `Neues ORBook-Passwort ${forWhom}: ${password}\n${url}`;
}
