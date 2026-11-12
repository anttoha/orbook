// Тексты страницы «Datenschutz» (часть 23). Источник фактов — код бэкенда и /opt/orbook-be/docs/DATENSCHUTZ.md.
// Меняется что-то в данных (новая таблица, cookie, срок) — поправь текст здесь и дату STAND.
// Формат раздела: title, intro — абзацы, rows — пары [что, пояснение] (cookies, сроки).

export const STAND = "2026-11-12";

// Коротко — первые строки страницы (макет 27). Иконки подставляет страница по id.
export const FACTS = [
  { id: "konten", title: "Keine Konten", text: "Keine Namen, keine E-Mails von Schülerinnen und Schülern. Du meldest dich mit dem Klassenpasswort oder einem Zugangscode an." },
  { id: "server", title: "Was auf dem Server liegt", text: "Der Stundenplan der Klasse und was ihr eintragt: Tests, Hausaufgaben, Termine, Links zu Materialien. Bei Schülern steht kein Name dabei." },
  { id: "notizen", title: "Deine Notizen", text: "Bleiben auf deinem Gerät. Beim Synchronisieren liegen sie verschlüsselt unter einem zufälligen Code. Der Server kann sie nicht lesen." },
  { id: "tracking", title: "Kein Tracking", text: "Keine Werbung, keine Analyse, keine IP-Adressen. Cookies nur für die Anmeldung und gegen Passwort-Raten." },
];

// Genauer — раскрывающиеся разделы под коротким списком
export const SECTIONS = [
  {
    id: "anmelden",
    title: "Anmelden",
    intro: [
      "Du kommst mit dem Klassenpasswort, einem Zugangscode oder einem Einladungslink rein. Lehrkräfte haben einen eigenen Lehrer-Code.",
      "Codes heißen nur „Code A“ oder ähnlich, nie nach einer Person. Passwörter speichert der Server nur als Prüfwert (Hash). Zugangscodes liegen zusätzlich verschlüsselt, damit der Admin sie noch einmal anzeigen kann.",
      "Für jedes angemeldete Gerät merkt sich der Server eine Sitzung: eine zufällige Kennung (als Hash), wann sie angelegt und zuletzt benutzt wurde und wann sie abläuft. Daraus zählt er, wie viele Geräte mit einem Code angemeldet sind. IP-Adresse, Gerätetyp und Browser speichert er nicht.",
    ],
  },
  {
    id: "eintraege",
    title: "Plan und Einträge",
    intro: [
      "Den Stundenplan holt der Server dort, wo die Schule ihn veröffentlicht (stundenplan24.de): Stunden, Fächer, Räume, Vertretungen, Ausfälle und die Kürzel der Lehrkräfte. Volle Namen von Lehrkräften kommen nicht vor.",
      "Was ihr eintragt: Tests (Datum, Stunde, Art, Fach, Thema, was man lernen und mitbringen soll, angehängte Links), Hausaufgaben (Fach, bis wann, Stunde, Text, angehängte Links), Termine (Titel, Datum, Uhrzeit, Ort, Notiz) und Links zu Materialien bei Google Drive oder OneDrive. Die Dateien selbst liegen nicht bei uns.",
      "Wer etwas eingetragen hat: Bei Schülern steht kein Name. Gespeichert wird nur, mit welchem Code es war — das sieht allein der Admin, als „Code A“. Bei Lehrkräften steht ihr Kürzel, zum Beispiel „eingetragen von Mü“. Bei Änderungen wird festgehalten, was sich geändert hat und ob es ein Schüler, eine Lehrkraft oder der Admin war.",
      "Bitte schreib keine Namen, Telefonnummern oder anderes Persönliches in Einträge.",
    ],
  },
  {
    id: "sync",
    title: "Notizen und Sync",
    intro: [
      "Notizen speichert die App nur auf deinem Gerät.",
      "Mit Notizen-Sync werden sie auf deinem Gerät verschlüsselt, bevor sie losgeschickt werden. Der Schlüssel steckt im Sync-Code, und den hast nur du. Der Server sieht eine zufällige Kennung und unlesbaren Datensalat (höchstens 64 KB).",
      "Sync-Code weg heißt: Die Notizen auf dem Server kann niemand mehr lesen, auch wir nicht.",
      "Löschen kannst du sie unten mit „Meine Sync-Notizen löschen“. Nach 365 Tagen ohne Zugriff löscht der Server sie von selbst.",
    ],
  },
  {
    id: "geraet",
    title: "Auf deinem Gerät",
    intro: [
      "Im Browser (localStorage) liegen: deine Kurse, Darstellung und Fachfarben, deine Notizen und dein Sync-Code, was du in „Neuigkeiten“ schon gesehen hast, und eine Kopie der letzten Pläne, damit die App auch ohne Netz geht.",
      "„Klasse verlassen“ löscht die Kopie der Pläne. Notizen und Einstellungen bleiben, bis du die Website-Daten im Browser löschst.",
      "Die App lädt nichts von fremden Servern: keine Schriften von Google, kein CDN, keine Analyse.",
    ],
  },
  {
    id: "cookies",
    title: "Cookies",
    intro: ["Es gibt genau drei. Alle sind technisch nötig (§ 25 Abs. 2 TDDDG), deshalb gibt es kein Cookie-Banner."],
    rows: [
      ["orbook_session", "Hält dich angemeldet. Bis zu 30 Tage."],
      ["orbook_device", "Zufällige Nummer gegen Passwort-Raten: zählt Fehlversuche auf diesem Gerät. Mit nichts verknüpft. Bis zu 1 Jahr."],
      ["orbook_admin", "Nur im Admin-Bereich. Bis zu 12 Stunden."],
    ],
  },
  {
    id: "fristen",
    title: "Wie lange wir Daten aufheben",
    intro: ["So ist es voreingestellt. Einige Zeiten kann der Admin ändern."],
    rows: [
      ["Stundenpläne", "365 Tage, der Verlauf der Änderungen 30 Tage"],
      ["Tests", "365 Tage nach dem Datum, gelöschte noch 30 Tage"],
      ["Hausaufgaben, Termine", "30 Tage nach dem Datum"],
      ["Materialien", "bis sie jemand löscht"],
      ["Anmeldung", "bis die Sitzung abläuft: 30 Tage, Admin 12 Stunden"],
      ["Sync-Notizen", "365 Tage ohne Zugriff"],
      ["Protokoll für den Admin", "30 Tage, ohne IP und ohne Namen"],
      ["Sicherungskopien", "14 Tage, vor größeren Änderungen bis zu 60 Tage"],
    ],
  },
  {
    id: "draussen",
    title: "Links nach draußen",
    intro: [
      "Materialien öffnen Google Drive oder OneDrive. „Teilen“ öffnet WhatsApp oder das Teilen-Menü deines Geräts. Dort gelten die Regeln dieser Anbieter. Die App schickt ihnen vorher nichts.",
      "Wir geben keine Daten weiter und verkaufen nichts. Der Server steht in Deutschland.",
    ],
  },
  {
    id: "rechte",
    title: "Deine Rechte",
    intro: [
      "Die App verarbeitet nur, was sie zum Funktionieren braucht (Art. 6 Abs. 1 lit. f DSGVO: berechtigtes Interesse, der Klasse einen aktuellen Plan zu geben).",
      "Du kannst fragen, was gespeichert ist, und Daten berichtigen oder löschen lassen oder widersprechen (Art. 15–21 DSGVO). Schreib dafür an die Person unter „Verantwortlich“. Du kannst dich auch bei einer Datenschutz-Aufsichtsbehörde beschweren.",
      "Vieles kannst du selbst: Sync-Notizen löschen, „Klasse verlassen“, Website-Daten im Browser löschen.",
    ],
  },
];
