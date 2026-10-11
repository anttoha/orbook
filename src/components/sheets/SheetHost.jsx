import { useState } from "react";
import { useSheet } from "../../shared/hooks/useSheet";
import ColorSheet from "./ColorSheet";
import DayInfoSheet from "./DayInfoSheet";
import LessonSheet from "./LessonSheet";
import NoteSheet from "./NoteSheet";
import ShareSheet from "./ShareSheet";
import WeekPickerSheet from "./WeekPickerSheet";

// Яке ім'я в адресі (?sheet=…) якій шторці відповідає
const SHEETS = {
  stunde: LessonSheet, // деталі уроку
  info: DayInfoSheet, // Info zum Tag
  notiz: NoteSheet, // нотатка
  farbe: ColorSheet, // Fachfarbe ändern
  teilen: ShareSheet, // Teilen
  kalender: WeekPickerSheet, // Woche wählen
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
