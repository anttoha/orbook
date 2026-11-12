// Рядок «Verantwortlich»: контакт заповнює адмін, тому обидва поля можуть бути порожні.
// Порожньо — відсилаємо до адміна, щоб «Deine Rechte» («schreib an Verantwortlich») не вели в нікуди.
export function responsibleText(privacy) {
  const contact = [privacy?.responsibleName, privacy?.responsibleEmail].filter(Boolean).join(" · ");
  return `${contact ? `${contact}.` : "Noch nicht eingetragen. Bis dahin hilft der Admin deiner Klasse."} Server in Deutschland.`;
}
