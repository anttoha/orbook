import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

// Усі параметри адреси, що стосуються шторок
const SHEET_KEYS = ["sheet", "datum", "stunde", "fach", "bereich", "kw", "id"];

// ─────────────────────────────────────────────────────────────
// Відкриття/закриття шторок через адресу сторінки:
//   ?sheet=stunde&datum=2026-10-07&stunde=2&fach=Ma
// Плюси: кнопка «Назад» закриває шторку, посилання можна надіслати.
// Шторки малює <SheetHost /> (він читає ці параметри).
// ─────────────────────────────────────────────────────────────
export const useSheet = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Відкрити шторку name з параметрами. replace: true — не додавати запис в історію
  const openSheet = useCallback(
    (name, params = {}, { replace = false } = {}) => {
      setSearchParams(
        (prev) => {
          SHEET_KEYS.forEach((key) => prev.delete(key)); // прибираємо параметри минулої шторки
          prev.set("sheet", name); // яка шторка
          Object.entries(params).forEach(([key, value]) => {
            if (value != null) prev.set(key, String(value)); // її параметри
          });
          return prev;
        },
        { replace },
      );
    },
    [setSearchParams],
  );

  // Закрити шторку (replace — щоб «Назад» не відкрив її знову)
  const closeSheet = useCallback(() => {
    setSearchParams(
      (prev) => {
        if (!prev.has("sheet")) return prev; // вже закрита
        SHEET_KEYS.forEach((key) => prev.delete(key)); // прибираємо всі параметри шторки
        return prev;
      },
      { replace: true },
    );
  }, [setSearchParams]);

  // Поточна шторка та її параметри
  const sheet = {
    name: searchParams.get("sheet"), // "stunde" | "info" | "notiz" | "farbe" | "teilen" | "kalender" | null
    datum: searchParams.get("datum"),
    stunde: searchParams.get("stunde"),
    fach: searchParams.get("fach"),
    bereich: searchParams.get("bereich"),
    kw: searchParams.get("kw"), // понеділок тижня для «kalender» і «teilen» (не плутати з ?woche= у сторінки тижня)
    id: searchParams.get("id"),
  };

  return { sheet, openSheet, closeSheet };
};
