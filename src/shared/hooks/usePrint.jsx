import { useEffect, useState } from "react";
import PrintArea from "../../components/print/PrintArea";
import { appPrintPage, hasAppPrint, onAndroidEvent } from "../api/android";

// ─────────────────────────────────────────────────────────────
// usePrint: print(лист) → лист рисуется в PrintArea, в следующем кадре открывается окно печати.
// Браузер: window.print() ждёт, пока окно открыто, потом лист убираем.
// Android-App (часть 37): печать через мост; Android рисует страницу позже, поэтому лист убираем,
// только когда приложение сообщит {type: "printed"}
// ─────────────────────────────────────────────────────────────
export function usePrint() {
  const [sheet, setSheet] = useState(null);
  useEffect(() => {
    if (!sheet) return undefined;
    if (hasAppPrint()) {
      const stop = onAndroidEvent((detail) => detail.type === "printed" && setSheet(null));
      const frame = requestAnimationFrame(() => appPrintPage(document.title));
      return () => {
        stop();
        cancelAnimationFrame(frame);
      };
    }
    const frame = requestAnimationFrame(() => {
      window.print();
      setSheet(null);
    });
    return () => cancelAnimationFrame(frame);
  }, [sheet]);
  return { print: setSheet, area: sheet ? <PrintArea>{sheet}</PrintArea> : null };
}
