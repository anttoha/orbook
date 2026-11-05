import { useState } from "react";
import { usePastExams } from "../../shared/hooks/useExams";
import { useNow } from "../../shared/hooks/useNow";
import { useExamFilter } from "../../shared/store/examFilterStore";
import { usePlanStore } from "../../shared/store/planStore";
import { useUserStore } from "../../shared/store/userStore";
import { cn } from "../../shared/utils/cn";
import { EMPTY_FILTER, filterExams, filterSubjects, toggleSubject } from "../../shared/utils/exams";
import { subjectName } from "../../shared/utils/format";
import { fachBorderClass, fachClasses, fachDotClass } from "../../shared/utils/lessons";
import Button from "../ui/Button";
import Segmented from "../ui/Segmented";
import Sheet from "../ui/Sheet";
import Switch from "../ui/Switch";

const RANGES = [
  { value: "2w", label: "2 Wochen" },
  { value: "month", label: "Monat" },
  { value: "half", label: "Halbjahr" },
];

// Підпис і поле під ним
const Field = ({ label, children }) => (
  <div>
    <p className="mb-2.25 text-hint font-extrabold text-faint">{label}</p>
    {children}
  </div>
);

// Предмет у фільтрі: вибраний — у своєму кольорі з рамкою
const SubjectToggle = ({ subject, selected, overrides, onClick }) => (
  <button
    type="button"
    aria-pressed={selected}
    onClick={onClick}
    className={cn("flex h-9 items-center gap-1.75 rounded-full border px-3 text-label font-bold text-ink", selected ? cn(fachClasses(subject.code, overrides), fachBorderClass(subject.code, overrides), "text-ink") : "border-rule")}
  >
    <span className={cn("size-2 rounded-full", fachDotClass(subject.code, overrides))} />
    {subjectName(subject)}
  </button>
);

// ─────────────────────────────────────────────────────────────
// Вікно фільтра. Адреса: ?sheet=klausurfilter.
// Вибір лежить у чернетці й застосовується лише кнопкою «3 anzeigen»:
// закрили вікно — у списку нічого не змінилось.
// ─────────────────────────────────────────────────────────────
const ExamFilterSheet = ({ open, onClose }) => {
  const { today } = useNow();
  const applied = useExamFilter((s) => s.filter);
  const setFilter = useExamFilter((s) => s.setFilter);
  const exams = usePlanStore((s) => s.exams);
  const past = usePlanStore((s) => s.pastExams);
  const courses = usePlanStore((s) => s.courses);
  const types = usePlanStore((s) => s.meta?.examTypes) ?? [];
  const picked = useUserStore((s) => s.picked);
  const overrides = useUserStore((s) => s.colorOverrides);

  // SheetHost тримає закрите вікно на екрані до кінця анімації, тому стан не зникає сам:
  // при кожному відкритті починаємо з того, що застосовано зараз
  const [draft, setDraft] = useState(applied);
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setDraft(applied);
  }
  const change = (part) => setDraft({ ...draft, ...part });

  usePastExams(open && draft.past); // число на кнопці рахується і для минулих

  const count = filterExams(draft.past ? past.exams : exams, draft, today).length;
  const pastLoading = draft.past && past.status === "loading";
  const subjects = filterSubjects(courses, picked, [...exams, ...past.exams]);

  return (
    <Sheet
      open={open}
      onClose={onClose}
      desktop="dialog"
      title="Filter"
      footer={
        <>
          <Button onClick={() => setDraft(EMPTY_FILTER)}>Zurücksetzen</Button>
          <Button
            variant="primary"
            onClick={() => {
              setFilter(draft);
              onClose();
            }}
          >
            {pastLoading ? "Anzeigen" : `${count} anzeigen`}
          </Button>
        </>
      }
    >
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
                subject={subject}
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
    </Sheet>
  );
};

export default ExamFilterSheet;
