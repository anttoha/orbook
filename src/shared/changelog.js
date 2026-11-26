// Что нового в приложении. Дописывай запись СВЕРХУ при каждом релизе — вместе с docs/releases/vX.Y.Z.md.
// Тексты — по-немецки, коротко и по-человечески: так, как сказал бы одноклассник, а не пресс-служба.
// Каждую строку сразу переводим в i18n/en.js и uk.js — «Was ist neu» показывается на языке приложения (тест следит).
// Только то, что видят ВСЕ (ученики, родители). Изменения админки сюда не пишем — они в docs/releases/
// (решение владельца 2026-11-13). Релиз только для админки — без записи здесь.
// picture — необязательная картинка (ключ из components/changelog/NewsPicture.jsx).
export const changelog = [
  {
    version: "0.32.0",
    date: "2026-11-26",
    neu: [
      "Neu auf Start: „Für dich jetzt“. Morgens siehst du, wann du los musst, wie das Wetter ist und was in die Tasche gehört – im Unterricht die Stunde, nach der Schule schon alles für morgen.",
      "Wetter für deine Schule: Symbol und Grad in der Woche, eine Karte im Tag und beim Antippen der Verlauf bis mittags – sobald deine Schule das Wetter eingeschaltet hat.",
      "Was du in welchem Fach brauchst, legst du selbst fest – Sportsachen, Zeichenblock, Flöte, was du willst. Alles unter Mehr → „Für dich jetzt“.",
      "Android: zwei neue Widgets – „Für dich jetzt“ und „Wetter“.",
      "Der Block „Heute“ auf Start kann abends schon morgen zeigen – einfach im Block einschalten.",
    ],
    behoben: [
      "Ohne Internet zeigt die App nicht mehr den Tag von gestern, und nach dem ersten Besuch geht sie auch offline auf.",
      "Wer schnell hin und her tippt (Klasse wechseln, Noten), macht nichts mehr aus Versehen rückgängig.",
      "Große Widgets zeigen wieder alle Stunden und Aufgaben, und in schmalen Widgets werden keine Zahlen mehr abgeschnitten.",
    ],
  },
  {
    version: "0.31.0",
    date: "2026-11-22",
    neu: [
      "Neu: Lerntimer. Fach wählen, „Start“ drücken – 25 Minuten lernen, 5 Minuten Pause, nach vier Runden eine lange. Oder 50 / 10, oder ganz eigene Zeiten.",
      "Der Timer läuft weiter, auch wenn du die Seite schließt. Ist die Runde um, klingelt es – in der Android-App kommt eine Meldung, selbst wenn die App zu ist.",
      "Wie viel du gelernt hast, siehst du jetzt in der Statistik – pro Tag und pro Fach. Und auf Start gibt’s einen Block dafür.",
    ],
  },
  {
    version: "0.30.0",
    date: "2026-11-22",
    neu: [
      "Neu: Karteikarten. Leg Stapel für Vokabeln, Begriffe oder Jahreszahlen an – einzeln oder als Liste reinkopiert („the journey – die Reise“).",
      "Beim Lernen drehst du die Karte um und sagst „Weiß ich“ oder „Weiß ich nicht“ – am Handy auch per Wischen. Was du kannst, kommt seltener dran, was nicht, gleich morgen wieder.",
      "Hängt ein Stapel an einem Test, siehst du ihn direkt im Test. Was heute dran ist, steht in den Aufgaben und als Block auf Start. Und mit „Teilen“ schickst du einen Stapel per Link oder QR an Freunde.",
    ],
  },
  {
    version: "0.29.1",
    date: "2026-11-22",
    behoben: [
      "Noten am PC: Wenn du ein Fach oder „Schnitt“ öffnest, blendet nur die rechte Spalte um – die Seite lädt nicht mehr sichtbar neu.",
      "Menü am PC: Gruppen wie „Leistung“ klappen weich auf und zu. Passt das Menü nicht auf den Bildschirm, wird der Rand blass – so siehst du, dass du scrollen kannst.",
    ],
  },
  {
    version: "0.29.0",
    date: "2026-11-22",
    neu: [
      "Neu: Ziele für deine Noten. Im Fach tippst du „Ziel setzen“ – und siehst sofort, welche Note du in der nächsten Arbeit brauchst und ob das „erreichbar“, „knapp“ oder „schwer“ ist.",
      "Dazu ein Verlauf: Wie sich dein Schnitt übers Halbjahr entwickelt hat, im Fach und insgesamt – einfach auf „Schnitt“ tippen.",
    ],
  },
  {
    version: "0.28.1",
    date: "2026-11-21",
    behoben: [
      "Kalender-Abo: Der Beispiel-Tag oben ist jetzt als „Beispiel“ markiert – vorher stand dort „9b“, und das sah aus wie ein Fehler.",
    ],
  },
  {
    version: "0.28.0",
    date: "2026-11-21",
    neu: [
      "Neu: Lernplan zum Test. Im Test tippst du „Lernplan erstellen“, wählst, wie viele Tage du lernen willst – und die Themen landen Tag für Tag in deinen Aufgaben.",
      "Abhaken geht im Test und in den Aufgaben, auf Start siehst du, wie weit du bist. Wird der Test verschoben, rutscht dein Plan einfach mit.",
    ],
  },
  {
    version: "0.27.0",
    date: "2026-11-21",
    neu: [
      "Neu: Kalender-Abo. Unter Mehr → „Kalender-Abo“ bekommst du einen Link, mit dem deine Stunden, Tests und Termine in Google, Apple oder Outlook Kalender landen – und sich von selbst aktualisieren.",
      "Ausfall und Vertretung stehen direkt im Eintrag („Englisch fällt aus“, „Mathe → Raum B12“). Am PC scannst du einfach den QR mit dem Handy.",
    ],
  },
  {
    version: "0.26.1",
    date: "2026-11-21",
    behoben: [
      "Noten als PDF: Das Original aus dem InfoPoint sieht jetzt aus wie gedruckt – ohne Menüleiste oben und Fußzeile unten.",
    ],
  },
  {
    version: "0.26.0",
    date: "2026-11-21",
    neu: [
      "Neu in der Android-App: Widgets für Noten, neue Noten und Fehlzeiten. Leg sie wie die anderen ORBook-Widgets auf den Startbildschirm.",
      "Auf dem Widget sind deine Noten erst mal verdeckt („•••“), damit nicht jeder sie sieht, der auf dein Handy schaut. Bei jedem Widget kannst du sie mit „Noten anzeigen“ einblenden.",
    ],
  },
  {
    version: "0.25.0",
    date: "2026-11-21",
    neu: [
      "Untere Leiste bearbeiten: Die Vorschau oben ist weg – die echte Leiste unten ändert sich sofort, und was du geändert hast, leuchtet kurz auf.",
      "Am PC steht beim „Handy“-Einstellen ein Handy daneben, das zeigt, wie deine Leiste aussieht. Beim Seitenmenü leuchtet der geänderte Punkt direkt im Menü.",
    ],
  },
  {
    version: "0.24.0",
    date: "2026-11-21",
    neu: [
      "Neu: Noten als PDF. In Noten und Fehlzeiten tippst du auf „Als PDF“, siehst eine Vorschau und kannst drucken oder die Datei direkt herunterladen.",
      "Du hast die Wahl: dein ORBook-Blatt fürs 1. oder 2. Halbjahr, das ganze Schuljahr, Zeugnis oder nur Fehlzeiten – oder das Original aus dem InfoPoint, genau wie die Schule es druckt.",
    ],
    behoben: [
      "Am PC scrollt das Seitenmenü jetzt, wenn der Bildschirm zu niedrig ist – unten verschwindet nichts mehr.",
      "Untere Leiste bearbeiten: Ziehen zwischen „Unten“ und „Mehr“ führt nicht mehr zu „Etwas ist schiefgelaufen“.",
    ],
  },
  {
    version: "0.23.0",
    date: "2026-11-21",
    neu: [
      "Neu: Noten! Melde dich unter Leistung → Noten mit deinem InfoPoint-Login an und sieh alle Noten, deinen Schnitt pro Fach und die Zeugnisnoten. Neue Noten sind mit „neu“ markiert.",
      "Notenrechner: Im Fach siehst du, welche Note du in der nächsten Arbeit brauchst, damit dein Schnitt passt.",
      "Fehlzeiten auf einen Blick: Fehltage und Fehlstunden, entschuldigt oder nicht. Bei vergangenen Tests steht jetzt auch deine Note dabei.",
      "In der Android-App holt dein Handy die Noten direkt vom InfoPoint – dein Passwort geht nicht über den ORBook-Server. Auf Wunsch meldet die App neue Noten: Mehr → Mitteilungen → Neue Note.",
    ],
  },
  {
    version: "0.22.0",
    date: "2026-11-20",
    neu: [
      "Unten in der Leiste gibt es jetzt Gruppen: „Leistung“ hat Tests und Aufgaben (bald auch Noten). Antippen – oder draufdrücken und den Finger nach oben ziehen, dann bist du sofort da.",
      "Du bestimmst selbst, was unten steht: Darstellung → Untere Leiste. Reihenfolge ziehen, eigene Gruppen bauen, Rest landet in „Mehr“. Am PC gilt das fürs Seitenmenü.",
    ],
  },
  {
    version: "0.20.1",
    date: "2026-11-20",
    behoben: ["Das Symbol der Mitteilungen ist jetzt das echte ORBook-Zeichen und steht nicht mehr schief."],
  },
  {
    version: "0.20.0",
    date: "2026-11-20",
    neu: [
      "ORBook geht jetzt auch ohne Internet auf: Du siehst den zuletzt geladenen Plan, auch in der Android-App.",
      "Mitteilungen in der Android-App: Die App sagt dir Bescheid, wenn morgen was anders ist, heute eine Stunde ausfällt oder abends, was morgen ansteht. Einschalten unter Mehr → Mitteilungen.",
      "Neu: „Vor der Stunde“ – auf Wunsch erinnert dich dein Handy 5, 10 oder 15 Minuten vorher an Fach und Raum. Klappt auch ohne Internet, ist aber erst aus: Mehr → Mitteilungen → Vor der Stunde.",
    ],
    behoben: ["Widgets laufen auch ohne Internet weiter: „Jetzt“ springt zur nächsten Stunde, und ein neues Widget ohne Netz zeigt „Keine Verbindung“ statt ewig zu laden."],
  },
  {
    version: "0.19.0",
    date: "2026-11-19",
    neu: [
      "Widgets passen sich jetzt an: Ist wenig Platz, werden die Zeilen dichter, und was nicht mehr reinpasst, steht unten als „+ 3 weitere“. Nichts wird mehr einfach abgeschnitten.",
      "Widgets sehen aus wie deine App: Soft, Glas oder Klar, dazu deine Akzentfarbe, hell oder dunkel. Änderst du das in der App, ziehen die Widgets mit.",
      "„Widget einstellen“ kann viel mehr: Schriftgröße, wie durchsichtig der Hintergrund ist, nur Änderungen zeigen, wie oft es sich aktualisiert und was sich beim Antippen öffnet. Jedes Widget hat dazu eigene Einstellungen.",
    ],
    behoben: ["Widget „Woche“: In jeder Stunde steht wieder das Fach. Ist das Widget breit und niedrig, liegt die Woche quer – Tage als Zeilen."],
  },
  {
    version: "0.18.1",
    date: "2026-11-19",
    neu: ["Android: Ein Einladungslink oder QR-Code öffnet jetzt direkt die ORBook-App, du musst den Code nicht mehr abtippen."],
    behoben: [
      "Widget „Woche“ zeigt jetzt die ganze Woche mit allen Stunden – nichts wird mehr abgeschnitten.",
      "Beim Einstellen eines Widgets ragt die Vorschau mit langen Zeilen nicht mehr über den Rand.",
    ],
  },
  {
    version: "0.18.0",
    date: "2026-11-19",
    neu: [
      "ORBook gibt es jetzt als Android-App: Du lädst sie unter Mehr → Android-App herunter. Neue Versionen meldet sie dir selbst.",
      "Dazu Widgets für den Startbildschirm – Plan, Tests, Aufgaben und mehr. Die stellst du in der App unter „Widget einstellen“ ein.",
      "Jetzt wirklich alles auf English und Українська: Auch Meldungen, Fehlertexte, Wochentage und der Datenschutz sind übersetzt.",
    ],
  },
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
