import { useState } from "react";
import { useSheet } from "../../shared/hooks/useSheet";
import AppointmentSheet from "./AppointmentSheet";
import ClassInviteSheet from "./ClassInviteSheet";
import ColorSheet from "./ColorSheet";
import DayInfoSheet from "./DayInfoSheet";
import DayHistorySheet from "./DayHistorySheet";
import PlanStatusSheet from "./PlanStatusSheet";
import EditorCodeSheet from "./EditorCodeSheet";
import ExamFilterSheet from "./ExamFilterSheet";
import ExamSheet from "./ExamSheet";
import HomeworkSheet from "./HomeworkSheet";
import TaskSheet from "../tasks/TaskSheet";
import SyncQrSheet from "./SyncQrSheet";
import TipsSheet from "./TipsSheet";
import LessonSheet from "./LessonSheet";
import MaterialSheet from "./MaterialSheet";
import NewsSheet from "./NewsSheet";
import NoteSheet from "./NoteSheet";
import ShareSheet from "./ShareSheet";
import ShortcutsSheet from "./ShortcutsSheet";
import WeekPickerSheet from "./WeekPickerSheet";
import QuietSheet from "../push/QuietSheet";
import IosInstallSheet from "../push/IosInstallSheet";
import TelegramSheet from "../push/TelegramSheet";
import PlanCheckSheet from "../muster/PlanCheckSheet";
import AddClassSheet from "./AddClassSheet";
import ClassSettingsSheet from "./ClassSettingsSheet";

// Яке ім'я в адресі (?sheet=…) якій шторці відповідає
const SHEETS = {
  stunde: LessonSheet, // деталі уроку
  info: DayInfoSheet, // Info zum Tag
  verlauf: DayHistorySheet, // «Verlauf des Tages» и старые Fassungen (часть 26)
  status: PlanStatusSheet, // «Plan-Status»: Live и проверка по дням (часть 26)
  notiz: NoteSheet, // нотатка
  farbe: ColorSheet, // Fachfarbe ändern
  teilen: ShareSheet, // Teilen
  kalender: WeekPickerSheet, // Woche wählen
  klausur: ExamSheet, // деталі Klausur
  klausurfilter: ExamFilterSheet, // Filter
  hausaufgabe: HomeworkSheet, // деталі Hausaufgabe (частина 14)
  aufgabe: TaskSheet, // «Eigene Aufgabe» (частина 25)
  syncqr: SyncQrSheet, // Sync-Code als QR (частина 25)
  tipps: TipsSheet, // «Kurz erklärt» (частина 25)
  material: MaterialSheet, // дії з посиланням Materialien (частина 15)
  termin: AppointmentSheet, // деталі Termin (частина 18)
  pruefen: PlanCheckSheet, // «Einträge prüfen» після справжнього плану (частина 19)
  editorcode: EditorCodeSheet, // код посеред запису: форма лишається під вікном
  tasten: ShortcutsSheet, // Tastenkürzel (клавіша «?»)
  news: NewsSheet, // «Was ist neu» после новой версии (часть 22b)
  einladen: ClassInviteSheet, // «Klasse einladen»: посилання і QR (частина 16)
  ruhezeit: QuietSheet, // Mitteilungen → Ruhezeit (частина 17)
  installieren: IosInstallSheet, // «ORBook installieren» на iPhone (частина 17)
  telegram: TelegramSheet, // «Mit Telegram verbinden» (часть 27b)
  klasseneu: AddClassSheet, // «Klasse hinzufügen» (часть 29)
  klasse: ClassSettingsSheet, // «Klasse einstellen» (часть 29), ?id=2
};

// ─────────────────────────────────────────────────────────────
// Малює шторку, вказану в адресі. Лежить один раз у HomePage,
// тому шторки працюють на будь-якій сторінці.
// ─────────────────────────────────────────────────────────────
const SheetHost = () => {
  const { sheet, closeSheet } = useSheet(); // поточна шторка з адреси

  // Поки шторка закривається (анімація), параметрів в адресі вже немає.
  // Тому запам'ятовуємо останні параметри і показуємо їх до кінця анімації.
  const [last, setLast] = useState(sheet);
  if (sheet.name && JSON.stringify(sheet) !== JSON.stringify(last)) {
    setLast(sheet); // React дозволяє так оновлювати стан із нових даних під час рендера
  }

  const shown = sheet.name ? sheet : last; // що малюємо
  const Component = SHEETS[shown.name]; // компонент шторки
  if (!Component) return null; // шторок ще не відкривали / невідоме ім'я

  return (
    <Component
      key={shown.name} // інша шторка — новий компонент
      open={sheet.name === shown.name} // відкрита, поки ім'я є в адресі
      onClose={closeSheet}
      sheet={shown}
    />
  );
};

export default SheetHost;
