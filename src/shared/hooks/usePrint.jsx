import { useEffect, useState } from "react";
import PrintArea from "../../components/print/PrintArea";

// ─────────────────────────────────────────────────────────────
// usePrint: print(лист) → лист рисуется в PrintArea, в следующем кадре открывается окно печати браузера.
// Пока окно открыто, браузер ждёт; закрыли — лист убираем
// ─────────────────────────────────────────────────────────────
export function usePrint() {
  const [sheet, setSheet] = useState(null);
  useEffect(() => {
    if (!sheet) return undefined;
    const frame = requestAnimationFrame(() => {
      window.print();
      setSheet(null);
    });
    return () => cancelAnimationFrame(frame);
  }, [sheet]);
  return { print: setSheet, area: sheet ? <PrintArea>{sheet}</PrintArea> : null };
}
