// Что нового в приложении. Дописывай запись СВЕРХУ при каждом релизе — вместе с docs/releases/vX.Y.Z.md.
// Тексты — по-немецки, коротко и по-человечески: так, как сказал бы одноклассник, а не пресс-служба.
// picture — необязательная картинка (ключ из components/changelog/NewsPicture.jsx).
export const changelog = [
  {
    version: "0.12.0",
    date: "2026-11-12",
    neu: [
      "Mitteilungen: ORBook meldet sich, wenn sich der Plan für morgen ändert, heute was ausfällt oder morgen ein Test ist. Einschalten unter Mehr → Mitteilungen.",
      "Du bestimmst, was kommt: nur deine Kurse oder die ganze Klasse, und nachts ist Ruhe.",
      "ORBook als App: unter Mehr auf „Installieren“ tippen. Auf dem iPhone zeigen wir dir, wie es geht.",
    ],
    behoben: ["Die Seite springt nicht mehr zur Seite, wenn sie mal scrollt und mal nicht."],
  },
  {
    version: "0.11.1",
    date: "2026-11-12",
    behoben: ["Doppelstunde: Die Hausaufgabe siehst du jetzt in beiden Stunden, nicht nur in der, zu der sie eingetragen wurde."],
  },
  {
    version: "0.11.0",
    date: "2026-11-12",
    neu: [
      "Neuer Plan kommt von selbst: Ist die App offen, siehst du ihn ein paar Sekunden nach der Schule. Kein Neuladen mehr.",
      "„Verlauf des Tages“ unter „Info zum Tag“: Was sich am Plan geändert hat und wann. Alte Fassungen kannst du dir ansehen.",
      "Unter der Woche steht „Live“. Tipp drauf: Du siehst für jeden Tag, ob der Plan schon da ist und wann zuletzt nachgeschaut wurde.",
    ],
    behoben: ["Kommt ein neuer Plan, schaut ORBook gleich alle Tage bis Ende nächster Woche an, nicht nur heute und morgen.", "„Jetzt prüfen“ prüft die Woche, die du gerade anschaust."],
  },
  {
    version: "0.10.0",
    date: "2026-11-12",
    neu: [
      "„Aufgaben“ statt „Hausaufgaben“: Hausaufgaben abhaken und eigene Aufgaben dazuschreiben. Das sieht nur du.",
      "Der Sync-Code nimmt jetzt alles mit: Notizen, Aufgaben, Kurse und Darstellung. Was genau, stellst du selbst ein.",
      "Sync-Code als QR: mit dem anderen Handy scannen, fertig.",
      "Blatt für die Klasse drucken: großer QR für die Pinnwand oder 8 Kärtchen zum Verteilen.",
      "„Kurz erklärt“ unter Mehr: drei Tipps für den Anfang.",
      "Mehr Bewegung: Häkchen springen, erledigte Aufgaben werden durchgestrichen und rutschen nach unten.",
    ],
  },
  {
    version: "0.9.0",
    date: "2026-11-12",
    neu: [
      "Lange auf eine Stunde drücken: Hausaufgabe oder Test direkt für diese Stunde eintragen.",
      "Zu Tests kannst du schreiben, was man lernen und mitbringen soll, und Links aus Materialien anhängen.",
      "Statt „Klausur“ gibt es jetzt Klassenarbeit, Leistungskontrolle, Test und Abgabe. In der Woche steht das Kürzel.",
      "Fällt eine Stunde aus, rutscht der Test von selbst auf die nächste Stunde des Fachs. Dort steht dann „verschoben“.",
    ],
    entfernt: ["Die Seite heißt jetzt „Tests“ statt „Klausuren“."],
  },
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
