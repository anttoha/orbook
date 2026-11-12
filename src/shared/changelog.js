// Что нового в приложении. Дописывай запись СВЕРХУ при каждом релизе — вместе с docs/releases/vX.Y.Z.md.
// Тексты — по-немецки, коротко и по-человечески: так, как сказал бы одноклассник, а не пресс-служба.
// picture — необязательная картинка (ключ из components/changelog/NewsPicture.jsx).
export const changelog = [
  {
    version: "0.8.4",
    date: "2026-11-12",
    picture: "alleKurse",
    neu: [
      "Die Seite „Neuigkeiten“. Hier steht, was sich geändert hat.",
      "„Alle Kurse“: Ein Tipp, und du siehst den ganzen Plan der Klasse.",
      "Sport gibt es jetzt getrennt für Mädchen und Jungen.",
      "„Mehr“ ist übersichtlicher: oben Seiten, darunter Einstellungen.",
    ],
    behoben: ["Am Anfang waren manchmal alle Kurse an, obwohl du nur einen gewählt hattest."],
    entfernt: ["Statistik ist nicht mehr unten in der Leiste. Du findest sie jetzt unter „Mehr“."],
  },
  {
    version: "0.8.3",
    date: "2026-11-08",
    behoben: ["Der Plan zeigt jetzt die nächsten fünf Schultage, auch am Wochenende.", "Im Browser-Tab ist jetzt das ORBook-Logo."],
  },
  {
    version: "0.8.2",
    date: "2026-11-07",
    neu: ["Zugangscodes kannst du dir noch einmal anzeigen lassen."],
  },
  {
    version: "0.8.1",
    date: "2026-11-07",
    neu: ["Neue Mitschüler kommen per Link oder QR-Code in die Klasse."],
    behoben: ["Ein paar Fehler bei der Kurswahl."],
  },
];
