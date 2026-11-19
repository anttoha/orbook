import { translate } from "../i18n/translate";
// Текст під заголовком «Etwas ist schiefgelaufen».
// Технічні подробиці (error.message) не показуємо: людині вони нічого не скажуть.
export function routeErrorText(error) {
  if (error?.status === 404) return translate("Diese Seite gibt es nicht.");
  return translate("Bitte lade die Seite neu. Wenn das nicht hilft, versuch es später noch einmal.");
}
