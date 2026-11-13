// ─────────────────────────────────────────────────────────────
// invite.js — тексти й адреси запрошення (частина 16). Чисті функції — тому з тестом.
// ─────────────────────────────────────────────────────────────

// Повна адреса: домен беремо з сайту (демо і прод — різні), у коді домену немає
export const inviteUrl = (token, origin = window.location.origin) => `${origin}/i/${token}`;

// Те саме без «https://» — коротше для підпису під QR
export const shortUrl = (url) => url.replace(/^https?:\/\//, "");

// Текст для WhatsApp. className може бути порожнім — тоді без назви класу
export const inviteMessage = (url, className) => `Hier ist der ORBook-Link${className ? ` für die ${className}` : ""}: Stundenplan, Vertretungen und Tests.\n${url}`;

// Помилка «Beitreten» → що показати:
//   invalid — посилання вже не діє (показуємо звичайне поле коду)
//   full    — ліміт пристроїв
//   retry   — інше (мережа, блокування): текст і «Nochmal versuchen»
export function joinProblem(error) {
  if (!error) return null;
  if (error.code === "invite_invalid" || error.code === "code_locked" || error.code === "code_expired") return { kind: "invalid" };
  if (error.code === "code_full") {
    const { devices, maxDevices } = error.details ?? {};
    return { kind: "full", text: maxDevices ? `Kein Platz mehr: ${devices ?? maxDevices} von ${maxDevices} ${maxDevices === 1 ? "Gerät" : "Geräten"}.` : "Kein Platz mehr für neue Geräte." };
  }
  if (error.status === 0) return { kind: "retry", text: "Keine Verbindung — bitte nochmal versuchen." };
  return { kind: "retry", text: error.message };
}

// «Klasse 9b»; назви класу немає — «deine Klasse»
export const classTitle = (className) => (className ? `Klasse ${className}` : "Deine Klasse");

// Часть 29: ссылку открыли на устройстве, где уже есть вход. Чем ссылка будет для этого устройства:
//   "known" — её класс уже есть (и работает) → просто открыть его
//   "add"   — другой класс → «Klasse hinzufügen» (сервер добавит класс, прежние останутся)
// inviteClass — class из GET /public/invite/{token} (у старого сервера нет → "add")
export function inviteForDevice(inviteClass, list) {
  const found = inviteClass?.id != null && (list ?? []).find((item) => item.id === inviteClass.id);
  return found && !found.gone ? "known" : "add";
}
