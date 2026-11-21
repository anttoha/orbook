import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useNow } from "../../shared/hooks/useNow";
import { useT } from "../../shared/hooks/useT";
import { translate } from "../../shared/i18n/translate";
import { useClasses } from "../../shared/store/classesStore";
import { useTasksStore } from "../../shared/store/tasksStore";
import { subjectName } from "../../shared/utils/format";
import { buildPlanTasks, defaultDays, formTopics, maxDays, planSettings, planTasksOf, preview, shortDay } from "../../shared/utils/lernplan";
import Button from "../ui/Button";
import ConfirmDialog from "../ui/ConfirmDialog";
import Field from "../ui/Field";
import { CheckIcon, TrashIcon } from "../ui/icons";
import RowSwitch from "../ui/RowSwitch";
import DayChips from "./DayChips";
import PlanPreview from "./PlanPreview";
import TopicList from "./TopicList";

// Начальные значения: из уже сохранённого плана или по умолчанию
function initialForm(exam, planTasks, today) {
  if (planTasks.length > 0) {
    const saved = planSettings(planTasks);
    return { n: saved.n, weekend: saved.weekend, topics: formTopics(exam.details, saved.topics) };
  }
  return { n: defaultDays(maxDays(today, exam.date, false)), weekend: false, topics: formTopics(exam.details) };
}

// Кнопки внизу: новый план — «Lernplan starten»; правка — «Speichern» и «Lernplan löschen»
const FormButtons = ({ editing, onDelete }) => {
  const t = useT();
  return (
    <div className="mt-auto flex flex-col gap-2.5 pt-6 lg:col-span-2 lg:flex-row lg:justify-end">
      <Button variant="primary" type="submit" className="flex-none lg:min-w-52">
        <CheckIcon className="size-4" /> {editing ? t("Speichern") : t("Lernplan starten")}
      </Button>
      {editing && (
        <Button variant="danger" className="flex-none" onClick={onDelete}>
          <TrashIcon className="size-4" /> {t("Lernplan löschen")}
        </Button>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Форма «Lernplan» (макеты 41 handy-02, pc-02): дни, выходные, темы и «So lernst du».
// Сохранить = задачи плана в «Aufgaben» (tasksStore.savePlan). На ПК — две колонки.
// ─────────────────────────────────────────────────────────────
const LernplanForm = ({ exam }) => {
  const t = useT();
  const navigate = useNavigate();
  const { today } = useNow();
  const cls = useClasses((s) => s.activeId);
  const tasks = useTasksStore((s) => s.tasks);
  const savePlan = useTasksStore((s) => s.savePlan);
  const deletePlan = useTasksStore((s) => s.deletePlan);
  const planTasks = planTasksOf(tasks, exam.id);
  const [form, setForm] = useState(() => initialForm(exam, planTasks, today));
  const [asking, setAsking] = useState(false);

  const subjectLabel = subjectName(exam.subject);
  const max = maxDays(today, exam.date, form.weekend);
  const n = Math.min(form.n, max); // выходные выключили — дней могло стать меньше
  const topics = form.topics.filter((topic) => topic.on).map((topic) => topic.text);
  const rows = preview({ today, examDate: exam.date, weekend: form.weekend, n, topics, subjectLabel });
  const back = `/testen?sheet=klausur&id=${exam.id}`;

  const change = (patch) => setForm((prev) => ({ ...prev, ...patch }));
  const toggleTopic = (text) => change({ topics: form.topics.map((topic) => (topic.text === text ? { ...topic, on: !topic.on } : topic)) });
  const addTopic = (text) => {
    if (!form.topics.some((topic) => topic.text.toLowerCase() === text.toLowerCase())) change({ topics: [...form.topics, { text, on: true, own: true }] });
  };
  const removeTopic = (text) => change({ topics: form.topics.filter((topic) => topic.text !== text) });

  const submit = (event) => {
    event.preventDefault();
    savePlan(exam.id, buildPlanTasks({ exam, cls, today, weekend: form.weekend, n, topics, subjectLabel, old: planTasks }));
    toast(planTasks.length ? translate("Lernplan gespeichert") : translate("Lernplan gestartet"));
    navigate(back);
  };
  const remove = () => {
    deletePlan(exam.id);
    toast(translate("Lernplan gelöscht"));
    navigate(back);
  };

  if (max === 0) return <p className="mt-5 text-body-sm text-muted">{t("Bis zum Test bleibt kein Tag zum Lernen.")}</p>;

  return (
    <form onSubmit={submit} noValidate className="mt-5 flex flex-1 flex-col gap-7 lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-7">
      <div className="flex flex-col gap-7">
        <Field label={t("Wie viele Tage lernen?")}>
          <DayChips value={n} max={max} onChange={(value) => change({ n: value })} />
          {rows.length > 0 && <p className="mt-3 text-caption font-bold text-muted">{`${shortDay(rows[0].date)} – ${shortDay(rows.at(-1).date)}`}</p>}
        </Field>
        <RowSwitch checked={form.weekend} onToggle={() => change({ weekend: !form.weekend })} label={t("Auch am Wochenende")} className="-mt-3 flex h-13.5 items-center justify-between gap-3 rounded-card bg-card px-4 text-left">
          <span className="text-row font-bold text-ink">{t("Auch am Wochenende")}</span>
        </RowSwitch>
        <Field label={t("Themen")}>
          <TopicList topics={form.topics} onToggle={toggleTopic} onAdd={addTopic} onRemove={removeTopic} />
        </Field>
      </div>
      <Field label={t("So lernst du")}>
        <PlanPreview rows={rows} />
      </Field>
      <FormButtons editing={planTasks.length > 0} onDelete={() => setAsking(true)} />

      <ConfirmDialog open={asking} onClose={() => setAsking(false)} icon={<TrashIcon className="size-6.5 text-danger" />} title={t("Lernplan löschen?")} text={t("Die Lernaufgaben verschwinden aus «Aufgaben», auch erledigte.")}>
        <Button onClick={() => setAsking(false)}>{t("Abbrechen")}</Button>
        <Button variant="danger" onClick={remove}>
          <TrashIcon className="size-4" /> {t("Löschen")}
        </Button>
      </ConfirmDialog>
    </form>
  );
};

export default LernplanForm;
