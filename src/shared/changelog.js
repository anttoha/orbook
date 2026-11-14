// Что нового в приложении. Дописывай запись СВЕРХУ при каждом релизе — вместе с docs/releases/vX.Y.Z.md.
// Тексты — по-немецки, коротко и по-человечески: так, как сказал бы одноклассник, а не пресс-служба.
// Только то, что видят ВСЕ (ученики, родители). Изменения админки сюда не пишем — они в docs/releases/
// (решение владельца 2026-11-13). Релиз только для админки — без записи здесь.
// picture — необязательная картинка (ключ из components/changelog/NewsPicture.jsx).
export const changelog = [
  {
    version: "0.17.1",
    date: "2026-11-14",
    neu: ["Auf Start steht jetzt „Muster“, wenn Woche, Jetzt oder Heute nur nach dem normalen Stundenplan gebaut sind und der echte Plan noch fehlt. Die Stunden sind dann gestreift – so verwechselst du sie nicht mit dem echten Plan."],
  },
  {
    version: "0.17.0",
    date: "2026-11-14",
    picture: "start",
    action: { label: "Mit Start öffnen", startView: "start" },
    neu: [
      "Neue Seite „Start“: Du baust sie dir aus Blöcken selbst zusammen – Jetzt, Woche, Tests, Aufgaben, Notizen und mehr. Mit „Anpassen“ ziehst du sie hin und her, änderst die Größe oder nimmst sie raus. Jede Klasse hat ihren eigenen Start.",
      "Drei Designs: Soft wie bisher, Glas mit echtem Glas-Effekt und Klar, schlicht. Dazu sechs Akzentfarben, vier Glas-Hintergründe und „Animationen“ zum Runterdrehen. Alles unter Mehr → Darstellung.",
      "Unter Mehr → Darstellung → Stundenplan bestimmst du, was in der Stunde steht: Kürzel oder Name, Raum, Lehrkraft, Fachfarbe, Ausfälle und Pausen.",
      "Sync nimmt Design, Farben, Stundenplan-Ansicht und deinen Start mit auf dein anderes Gerät.",
    ],
  },
  {
    version: "0.16.1",
    date: "2026-11-14",
    behoben: ["Neue Seite fängt jetzt oben an – vorher warst du manchmal schon so weit unten wie auf der Seite davor. „Zurück“ bringt dich wieder an die alte Stelle."],
  },
  {
    version: "0.16.0",
    date: "2026-11-14",
    neu: ["Geht’s unten noch weiter? Dann zeigt ein kleiner Pfeil-Knopf unten nach unten – antippen, und es scrollt weiter."],
    behoben: [
      "Die Scrollleiste ist jetzt schmal und rund und ragt nicht mehr aus den Fenstern raus.",
      "Filter bei Tests: Die Arten (Klassenarbeit, Leistungskontrolle …) überlappen sich am Handy nicht mehr.",
    ],
  },
  {
    version: "0.15.2",
    date: "2026-11-14",
    entfernt: ["Weniger Text: Die ganzen kleinen Hinweise wie „ohne Namen“, „nur für dich“ oder „… antippen“ sind weg. Was zählt, steht noch da."],
  },
  {
    version: "0.15.0",
    date: "2026-11-13",
    neu: [
      "„Meine Klassen“ ist jetzt nach Schulen sortiert: erst die Schule, darunter ihre Klassen. Tipp auf die Schule zeigt nur ihre Klassen – dort kannst du auch eine Klasse hinzufügen.",
      "Den Zugangscode kannst du eingeben, wo du willst: Die Klasse landet automatisch bei ihrer Schule.",
      "Sync nimmt jetzt alle deine Klassen mit: Notizen und Kurse je Klasse, dazu Name, Farbe und Reihenfolge. Zugangscodes nicht – die gibst du auf dem neuen Gerät selbst ein.",
      "Telegram-Bot für mehrere Klassen: Schick ihm einfach noch einen Code. Jede Nachricht sagt dann, zu welcher Klasse sie gehört, und /heute kommt für jede Klasse.",
    ],
    behoben: ["„Meine Klassen“ konnte bei manchen Geräten mit mehreren Klassen abstürzen („Etwas ist schiefgelaufen“)."],
  },
  {
    version: "0.14.6",
    date: "2026-11-13",
    behoben: ["Mehrere Klassen: Nach dem Wechseln zeigten Materialien und Termine manchmal noch die der anderen Klasse. Jetzt siehst du immer nur die der Klasse, die offen ist."],
  },
  {
    version: "0.14.5",
    date: "2026-11-13",
    neu: ["Warst du länger nicht da? „Was ist neu“ zeigt jetzt alles, was du verpasst hast – nicht nur das letzte Update."],
  },
  {
    version: "0.14.4",
    date: "2026-11-13",
    behoben: ["Einladungslink, wenn du schon eine Klasse hast: Jetzt kommt die Klasse einfach dazu („Klasse hinzufügen“), statt dass nichts passiert. Hast du sie schon, öffnet der Link sie."],
  },
  {
    version: "0.14.0",
    date: "2026-11-13",
    neu: [
      "Mehrere Klassen auf einem Gerät: deine, die vom kleinen Bruder, eine aus einer anderen Schule. Unter „Meine Klassen“ siehst du alle auf einen Blick – was heute ausfällt und wann der nächste Test ist.",
      "Klasse wechseln geht mit einem Tipp oben auf „8a ⌄“. Neue Klasse? Einfach den Zugangscode eingeben oder den Einladungslink öffnen.",
      "„Nebeneinander“: ein Tag, deine Klassen als Spalten – Stunde für Stunde.",
      "Jede Klasse hat ihre eigenen Kurse, Notizen und Mitteilungen. Name und Farbe der Klasse stellst du selbst ein.",
      "ORBook gibt’s jetzt auch auf Englisch und Ukrainisch: Mehr → Darstellung → Sprache. Noch nicht alles ist übersetzt, der Rest kommt.",
    ],
  },
  {
    version: "0.13.0",
    date: "2026-11-13",
    neu: [
      "Telegram-Bot: Planänderungen, Ausfälle und „Für morgen“ kommen als Nachricht. Verbinden unter Mehr → Mitteilungen oder einfach deinen Zugangscode an den Bot schicken.",
      "Im Bot: /heute, /morgen, /woche und /einstellungen – was kommt, welche Kurse, wann Ruhe ist. Keine Lust mehr? /stop.",
      "„Teilen“ kann jetzt auch die Aufgaben für morgen mitschicken.",
    ],
  },
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
    version: "0.8.1",
    date: "2026-11-07",
    neu: ["Neue Mitschüler kommen per Link oder QR-Code in die Klasse."],
    behoben: ["Ein paar Fehler bei der Kurswahl."],
  },
];
