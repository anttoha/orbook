import { usePlanStore } from "../../shared/store/planStore";
import { useUserStore } from "../../shared/store/userStore";
import { cn } from "../../shared/utils/cn";
import { filterSubjects, toggleSubject } from "../../shared/utils/exams";
import { subjectName } from "../../shared/utils/format";
import Field from "../ui/Field";
import Segmented from "../ui/Segmented";
import Switch from "../ui/Switch";
import SubjectToggle from "./SubjectToggle";

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
  const overrides = useUserStore((s) => s.colorOverrides);
  const subjects = filterSubjects(courses, picked, [...exams, ...pastExams]);

  return (
    <>
      <Field label="Art">
        <Segmented
          label="Art"
          size="form"
          value={draft.type ?? "alle"}
          options={[{ value: "alle", label: "Alle" }, ...types.map((type) => ({ value: type, label: type }))]}
          onChange={(value) => change({ type: value === "alle" ? null : value })}
        />
      </Field>

      {subjects.length > 0 && (
        <Field label="Fächer">
          <div className="flex flex-wrap gap-1.75">
            {subjects.map((subject) => (
              <SubjectToggle
                key={subject.code}
                code={subject.code}
                label={subjectName(subject)}
                overrides={overrides}
                selected={draft.subjects.includes(subject.code)}
                onClick={() => change({ subjects: toggleSubject(draft.subjects, subject.code) })}
              />
            ))}
          </div>
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
