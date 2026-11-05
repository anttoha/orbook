import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { retryText } from "../api/api";
import { deleteExam, saveExam, undoDelete } from "../api/exams";
import { usePlanStore } from "../store/planStore";
import { examToForm } from "../utils/examRules";
import { useSheet } from "./useSheet";

// Одне сповіщення запису на екрані: «Nochmal» висить без кінця, і наступне має замінити його, а не сховатись під ним.
// Спільне id тут не годиться: кнопка в сповіщенні закриває його, і оновлення з тим самим id вже не з'явиться
let lastToast = null;
const dismissLast = () => {
  if (lastToast !== null) toast.dismiss(lastToast);
  lastToast = null;
};
const notify = (show, text, options) => {
  dismissLast();
  lastToast = show(text, options);
};
// Поля форми, під якими можна показати помилку сервера
const FORM_FIELDS = ["type", "subject", "date", "lesson", "topic"];

// ─────────────────────────────────────────────────────────────
// Що робити з кожною відповіддю сервера на запис Klausur
// (таблиця в docs/frontend/04-klausuren.md). Форма лише малює.
//   dialog: null | { kind: "duplicate", exam } | { kind: "conflict", exam } | { kind: "delete" }
//   fieldErrors: помилки сервера за полями
// ─────────────────────────────────────────────────────────────
export const useExamSave = (original) => {
  const navigate = useNavigate();
  const { openSheet } = useSheet();
  const examsChanged = usePlanStore((s) => s.examsChanged);
  const dropEditor = usePlanStore((s) => s.dropEditor);
  const [base, setBase] = useState(original); // версія, яку змінюємо; конфлікт замінює її на свіжу
  const [dialog, setDialog] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const leave = () => navigate("/testen", { replace: true });

  // Помилки спільні для збереження і видалення. retry — що повторює «Nochmal»
  const showError = (error, retry) => {
    if (error.code === "offline" || error.code === "timeout") {
      // без мережі форму не закриваємо і нічого не ставимо в чергу
      notify(toast.error, "Konnte nicht speichern — keine Verbindung", { duration: Infinity, action: { label: "Nochmal", onClick: retry } });
    } else if (error.code === "editor_required" || error.code === "code_expired") {
      dismissLast(); // старе сповіщення закрило б підказку у вікні
      dropEditor();
      openSheet("editorcode"); // форма лишається під вікном
    } else if (error.code === "rate_limited") {
      notify(toast.error, retryText(error));
    } else if (error.status === 422 && FORM_FIELDS.includes(error.details?.fields?.[0]?.field)) {
      dismissLast();
      setFieldErrors({ [error.details.fields[0].field]: error.message });
    } else {
      notify(toast.error, error.message);
    }
  };

  // «Rückgängig»: нову запис видаляємо, правку повертаємо до старих полів
  const undoSave = async (saved) => {
    try {
      if (base) await saveExam(examToForm(base), saved);
      else await deleteExam(saved);
      examsChanged();
    } catch (error) {
      notify(toast.error, error.message);
    }
  };

  const finishSave = (saved) => {
    examsChanged();
    notify(toast.success, "Klausur gespeichert", { duration: 6000, action: { label: "Rückgängig", onClick: () => undoSave(saved) } });
    leave();
  };

  const save = async (form, { force = false, against = base } = {}) => {
    if (busy) return;
    setBusy(true);
    setDialog(null);
    setFieldErrors({});
    try {
      const result = await saveExam(form, against, { force });
      if (result.status === "saved") finishSave(result.exam);
      else if (result.status === "duplicate") setDialog({ kind: "duplicate", exam: result.existing });
      else setDialog({ kind: "conflict", exam: result.current });
    } catch (error) {
      showError(error, () => save(form, { force, against }));
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (busy) return;
    setBusy(true);
    setDialog(null);
    try {
      await deleteExam(base);
      examsChanged();
      notify(toast, "Klausur gelöscht", {
        duration: 8000,
        action: { label: "Rückgängig", onClick: () => undoDelete(base).then(examsChanged, (error) => notify(toast.error, error.message)) },
      });
      leave();
    } catch (error) {
      if (error.code === "conflict" && error.details?.current) {
        setBase(error.details.current); // запис уже змінили: показуємо, що саме, і не видаляємо
        setDialog({ kind: "conflict", exam: error.details.current });
      } else {
        showError(error, remove);
      }
    } finally {
      setBusy(false);
    }
  };

  // «Meine Änderung trotzdem speichern»: повтор поверх свіжої версії
  const overwrite = (form) => {
    const current = dialog.exam;
    setBase(current);
    save(form, { against: current });
  };

  // «Verwerfen»: моя зміна не потрібна
  const discard = () => {
    examsChanged();
    leave();
  };

  return { dialog, setDialog, fieldErrors, clearFieldErrors: () => setFieldErrors({}), busy, save, remove, overwrite, discard };
};
