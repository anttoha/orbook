import { useState } from "react";
import { useSheet } from "../../shared/hooks/useSheet";
import AppointmentSheet from "./AppointmentSheet";
import ColorSheet from "./ColorSheet";
import DayInfoSheet from "./DayInfoSheet";
import EditorCodeSheet from "./EditorCodeSheet";
import ExamFilterSheet from "./ExamFilterSheet";
import ExamSheet from "./ExamSheet";
import HomeworkSheet from "./HomeworkSheet";
import LessonSheet from "./LessonSheet";
import MaterialSheet from "./MaterialSheet";
import NoteSheet from "./NoteSheet";
import ShareSheet from "./ShareSheet";
import ShortcutsSheet from "./ShortcutsSheet";
import WeekPickerSheet from "./WeekPickerSheet";
import PlanCheckSheet from "../muster/PlanCheckSheet";

// Яке ім'я в адресі (?sheet=…) якій шторці відповідає
const SHEETS = {
  stunde: LessonSheet, // деталі уроку
  info: DayInfoSheet, // Info zum Tag
  notiz: NoteSheet, // нотатка
  farbe: ColorSheet, // Fachfarbe ändern
  teilen: ShareSheet, // Teilen
  kalender: WeekPickerSheet, // Woche wählen
  klausur: ExamSheet, // деталі Klausur
  klausurfilter: ExamFilterSheet, // Filter
  hausaufgabe: HomeworkSheet, // деталі Hausaufgabe (частина 14)
  material: MaterialSheet, // дії з посиланням Materialien (частина 15)
  termin: AppointmentSheet, // деталі Termin (частина 18)
  pruefen: PlanCheckSheet, // «Einträge prüfen» після справжнього плану (частина 19)
  editorcode: EditorCodeSheet, // код посеред запису: форма лишається під вікном
  tasten: ShortcutsSheet, // Tastenkürzel (клавіша «?»)
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
