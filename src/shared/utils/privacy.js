// Рядок «Verantwortlich»: контакт заповнює адмін, тому обидва поля можуть бути порожні.
export function responsibleText(privacy) {
  const contact = [privacy?.responsibleName, privacy?.responsibleEmail].filter(Boolean).join(" · ");
  return `${contact ? `${contact}.` : "Noch nicht angegeben."} Server in Deutschland.`;
}
