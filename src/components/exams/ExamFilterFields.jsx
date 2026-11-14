import { usePlanStore } from "../../shared/store/planStore";
import { useUserStore } from "../../shared/store/userStore";
import { cn } from "../../shared/utils/cn";
import { filterSubjects } from "../../shared/utils/exams";
import Field from "../ui/Field";
import ChoiceChips from "../ui/ChoiceChips";
import Segmented from "../ui/Segmented";
import Switch from "../ui/Switch";
import ListPicker from "../ui/ListPicker";
import { subjectItems } from "../../shared/utils/picker";

const RANGES = [
  { value: "2w", label: "2 Wochen" },
  { value: "month", label: "Monat" },
  { value: "half", label: "Halbjahr" },
];

// ─────────────────────────────────────────────────────────────
// Поля фільтра: Art · Fächer · Zeitraum · «Vergangene anzeigen».
// draft — чернетка, change({ … }) — поміняти частину (useExamFilterDraft)
// ─────────────────────────────────────────────────────────────
const ExamFilterFields = ({ draft, change }) => {
  const exams = usePlanStore((s) => s.exams);
  const pastExams = usePlanStore((s) => s.pastExams.exams);
  const courses = usePlanStore((s) => s.courses);
  const types = usePlanStore((s) => s.meta?.examTypes) ?? [];
  const picked = useUserStore((s) => s.picked);
  const subjects = filterSubjects(courses, picked, [...exams, ...pastExams]);

  return (
    <>
      <Field label="Art">
        {/* видов может быть много и с длинными словами — таблетки с переносом, а не одна полоса */}
        <ChoiceChips
          label="Art"
          value={draft.type ?? "alle"}
          options={[{ value: "alle", label: "Alle" }, ...types.map((type) => ({ value: type, label: type }))]}
          onChange={(value) => change({ type: value === "alle" ? null : value })}
        />
      </Field>

      {subjects.length > 0 && (
        <Field label="Fächer">
          {/* кілька предметів: список із пошуком, розгортається на місці (фільтр уже у вікні) */}
          <ListPicker id="filter-subjects" label="Fächer" multiple inline placeholder="Alle Fächer" items={subjectItems(subjects)} value={draft.subjects} onChange={(subjects) => change({ subjects })} />
        </Field>
      )}

      {/* у минулих періоду немає: неактивний, але на місці, щоб вікно не стрибало */}
      <div inert={draft.past} className={cn(draft.past && "opacity-40")}>
        <Field label="Zeitraum">
          {/* повторне натискання знімає період: за замовчуванням видно весь список */}
          <Segmented label="Zeitraum" size="form" value={draft.range} options={RANGES} onChange={(value) => change({ range: value === draft.range ? null : value })} />
        </Field>
      </div>

      <label className="mt-2.5 mb-3 flex items-center justify-between gap-3">
        <span className="text-row text-ink">Vergangene anzeigen</span>
        <Switch label="Vergangene anzeigen" checked={draft.past} onChange={(value) => change({ past: value })} />
      </label>
    </>
  );
};

export default ExamFilterFields;
