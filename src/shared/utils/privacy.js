import { translate } from "../i18n/translate";
// Рядок «Verantwortlich»: контакт заповнює адмін, тому обидва поля можуть бути порожні.
// Порожньо — відсилаємо до адміна, щоб «Deine Rechte» («schreib an Verantwortlich») не вели в нікуди.
export function responsibleText(privacy) {
  const contact = [privacy?.responsibleName, privacy?.responsibleEmail].filter(Boolean).join(" · ");
  return translate("{v1} Server in Deutschland.", { v1: contact ? `${contact}.` : translate("Noch nicht eingetragen. Bis dahin hilft der Admin deiner Klasse.") });
}
