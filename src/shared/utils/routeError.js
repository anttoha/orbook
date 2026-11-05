// Текст під заголовком «Etwas ist schiefgelaufen».
// Технічні подробиці (error.message) не показуємо: людині вони нічого не скажуть.
export function routeErrorText(error) {
  if (error?.status === 404) return "Diese Seite gibt es nicht.";
  return "Bitte lade die Seite neu. Wenn das nicht hilft, versuch es später noch einmal.";
}
