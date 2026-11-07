import { useState } from "react";
import { Plus } from "lucide-react";
import { autoText, courseChipLabel, lessonFromCourse } from "../../../shared/utils/musterEditor";
import SubjectToggle from "../../exams/SubjectToggle";
import Button from "../../ui/Button";
import { CheckIcon, TrashIcon } from "../../ui/icons";
import TextField from "../../ui/TextField";

const NEW_ENTRY = { subject: "", course: null, teacher: null, room: null };

// Один курс уроку: чипи курсів, «Lehrer», «Raum». index — щоб id полів не повторювались
const EntryFields = ({ entry, index, courses, onChange, onRemove }) => (
  <div className="flex flex-col gap-3.5">
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-hint font-extrabold text-faint">{index === 0 ? "Kurs" : `Parallelkurs ${index}`}</span>
        {onRemove && (
          <button type="button" onClick={onRemove} className="text-label font-bold text-danger">
            Entfernen
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-1.75">
        {courses.map((course) => (
          <SubjectToggle
            key={course.nr}
            large
            code={course.subject.code}
            label={courseChipLabel(course)}
            selected={entry.course?.nr === course.nr}
            onClick={() => onChange(lessonFromCourse(course, entry.room))} // вчитель — з курсу, кабінет лишається
          />
        ))}
      </div>
    </div>
    <div className="grid grid-cols-2 gap-2">
      <TextField id={`muster-teacher-${index}`} inputClassName="lg:bg-paper" label="Lehrer" maxLength={20} value={entry.teacher ?? ""} onChange={(event) => onChange({ ...entry, teacher: event.target.value })} />
      <TextField id={`muster-room-${index}`} inputClassName="lg:bg-paper" label="Raum" maxLength={20} value={entry.room ?? ""} onChange={(event) => onChange({ ...entry, room: event.target.value })} />
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────
// «Stunde bearbeiten» (макет 19b handy-04, pc-03 праворуч): курси одного уроку.
// Чернетка живе тут, у сітку йде лише після «Übernehmen». «Leeren» — урок стає порожнім.
//   entries   — що зараз у клітинці, autoEntries — що там будує автоматика
//   courses   — курси класу (/api/admin/courses), names — назви предметів за кодом
// ─────────────────────────────────────────────────────────────
const LessonEditor = ({ entries, autoEntries, courses, names, onApply }) => {
  const [draft, setDraft] = useState(() => (entries.length ? entries : [NEW_ENTRY]));
  const ready = draft.every((entry) => entry.subject); // у кожного курсу вибраний предмет

  const change = (index, entry) => setDraft(draft.map((old, i) => (i === index ? entry : old)));
  const clean = (entry) => ({ ...entry, teacher: entry.teacher?.trim() || null, room: entry.room?.trim() || null });

  return (
    <div className="flex flex-col gap-4">
      {courses.length === 0 && <p className="text-label text-faint">Noch keine Kurse — sie kommen mit dem ersten Plan.</p>}
      {draft.map((entry, index) => (
        <EntryFields key={index} entry={entry} index={index} courses={courses} onChange={(next) => change(index, next)} onRemove={index > 0 ? () => setDraft(draft.filter((_, i) => i !== index)) : null} />
      ))}
      <button type="button" onClick={() => setDraft([...draft, NEW_ENTRY])} className="flex items-center gap-2 self-start text-body-sm font-bold text-accent-ink">
        <Plus className="size-4" /> Parallelkurs in dieser Stunde
      </button>
      <p className="text-caption text-faint">Automatisch war: {autoText(autoEntries, names)}</p>
      <div className="flex gap-2 border-t border-hair pt-4">
        <Button variant="danger" className="flex-none px-5" onClick={() => onApply([])}>
          <TrashIcon className="size-4" /> Leeren
        </Button>
        <Button variant="primary" className="flex-1" disabled={!ready} onClick={() => onApply(draft.map(clean))}>
          <CheckIcon className="size-4" /> Übernehmen
        </Button>
      </div>
    </div>
  );
};

export default LessonEditor;
