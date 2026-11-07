import { useState } from "react";
import { toast } from "sonner";
import { saveMuster } from "../api/admin";
import { badSlot, changeCount, copyWeeks, setSlot } from "../utils/musterEditor";

// ─────────────────────────────────────────────────────────────
// Чернетка сітки Muster (частина 19b). Правки копляться тут, «Speichern» шле обидва тижні (PUT /admin/muster).
//   data   — відповідь GET /admin/muster; своєї сітки ще нема (weeks: null) → починаємо з копії автоматики
//   onSaved — після збереження (сторінка перевантажить дані → нова чернетка)
// Результат: weeks, count (скільки клітинок змінено), dirty, setCell, takeAuto, save, busy, bad (клітинка з помилкою)
// ─────────────────────────────────────────────────────────────
export function useMusterDraft(data, onSaved) {
  const base = data.weeks ?? data.auto; // з чим порівнюємо, щоб порахувати зміни
  const [weeks, setWeeks] = useState(() => copyWeeks(base));
  const [busy, setBusy] = useState(false);
  const [bad, setBad] = useState(null);

  const count = changeCount(base, weeks);
  const dirty = count > 0 || data.weeks === null; // своєї сітки на сервері ще нема — її треба зберегти

  // Замінити один урок тижня letter («A»/«B»)
  const setCell = (letter, { weekday, period }, entries) => {
    setWeeks((prev) => ({ ...prev, [letter]: setSlot(prev[letter], weekday, period, entries) }));
    setBad(null);
  };

  // «Aus dem Plan übernehmen»: тиждень letter знову такий, як в автоматиці
  const takeAuto = (letter) => setWeeks((prev) => ({ ...prev, [letter]: [...data.auto[letter]] }));

  const save = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await saveMuster(weeks);
      toast.success("Muster gespeichert · gilt sofort für alle");
      onSaved();
    } catch (error) {
      if (error.status === 422) {
        setBad(badSlot(error, weeks));
        toast.error(error.message);
      } else {
        // правки лишаються на екрані — можна спробувати ще раз
        toast.error(error.code === "offline" ? "Nicht gespeichert · offline" : error.message, { duration: Infinity, action: { label: "Nochmal", onClick: save } });
      }
    } finally {
      setBusy(false);
    }
  };

  return { weeks, count, dirty, setCell, takeAuto, save, busy, bad };
}
