import { useState } from "react";
import { updateAdminExam } from "../../shared/api/admin";
import { examLabel, TOPIC_MAX, validateTopic } from "../../shared/utils/examRules";
import Button from "../ui/Button";
import Select from "../ui/Select";
import Field from "../ui/Field";
import { CheckIcon } from "../ui/icons";
import ChoiceChips from "../ui/ChoiceChips";
import Sheet from "../ui/Sheet";
import TextField from "../ui/TextField";
import { useT } from "../../shared/hooks/useT";

const LESSONS = [null, 1, 2, 3, 4, 5, 6, 7, 8]; // null — «—» (без уроку)

// Форма правки: Art, Datum, Stunde, Thema. Предмет не міняємо: у адмінки немає списку предметів класу
const ExamEditForm = ({ exam, types, onSaved }) => {
  const t = useT();
  const [form, setForm] = useState({ type: exam.type, date: exam.date, lesson: exam.lesson ?? null, topic: exam.topic ?? "" });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const change = (part) => setForm({ ...form, ...part });
  const allTypes = [...new Set([...types, exam.type])]; // тип, якого вже немає в налаштуваннях, лишається видно

  const save = async (event) => {
    event.preventDefault();
    const topicError = validateTopic(form.topic);
    if (topicError) return setError(topicError.message);
    if (!form.date) return setError("Bitte ein Datum wählen.");
    setBusy(true);
    setError(null);
    try {
      await updateAdminExam(exam, { ...form, topic: form.topic.trim() });
      onSaved("Test gespeichert");
    } catch (err) {
      // 409: хтось змінив запис, поки вікно було відкрите — показуємо і перезавантажуємо список
      if (err.code === "conflict") onSaved(null, "Der Test wurde inzwischen geändert. Die Liste ist jetzt aktuell.");
      else setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={save} noValidate className="flex flex-col gap-4">
      <Field label={t("Art")}>
        <ChoiceChips label={t("Art")} value={form.type} options={allTypes.map((type) => ({ value: type, label: type }))} onChange={(type) => change({ type })} />
      </Field>
      <TextField id="admin-exam-date" label={t("Datum")} type="date" value={form.date} onChange={(event) => change({ date: event.target.value })} />
      <Field label={t("Stunde")}>
        <Select variant="field" label={t("Stunde")} value={form.lesson ?? ""} options={LESSONS.map((lesson) => ({ value: lesson ?? "", label: lesson ? t("{lesson}. Stunde", { lesson }) : "—" }))} onChange={(value) => change({ lesson: value === "" ? null : value })} />
      </Field>
      <TextField id="admin-exam-topic" label={t("Thema")} value={form.topic} maxLength={TOPIC_MAX} error={error} hint={t("{length} von {TOPIC_MAX} Zeichen", { length: form.topic.length, TOPIC_MAX })} onChange={(event) => change({ topic: event.target.value })} autoComplete="off" />
      <Button type="submit" variant="primary" disabled={busy} className="flex-none">
        <CheckIcon className="size-4" /> {t("Speichern")}
      </Button>
    </form>
  );
};

// Вікно «Klausur ändern» в адмінці. onSaved(повідомлення, помилка?) — закрити і оновити список
const AdminExamSheet = ({ exam, types, onClose, onSaved }) => {
  const t = useT();
  return (
  <Sheet open={Boolean(exam)} onClose={onClose} desktop="dialog" eyebrow={exam ? examLabel(exam) : ""} title={t("Test ändern")}>
    {exam && <ExamEditForm exam={exam} types={types} onSaved={onSaved} />}
  </Sheet>
);
};

export default AdminExamSheet;
