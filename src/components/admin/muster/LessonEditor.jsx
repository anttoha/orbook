import { useState } from "react";
import { Plus } from "lucide-react";
import { autoText, lessonFromCourse } from "../../../shared/utils/musterEditor";
import { courseItems } from "../../../shared/utils/picker";
import ListPicker from "../../ui/ListPicker";
import Button from "../../ui/Button";
import { CheckIcon, TrashIcon } from "../../ui/icons";
import TextField from "../../ui/TextField";

const NEW_ENTRY = { subject: "", course: null, teacher: null, room: null };

// Пункти списку курсів. Курсу уроку може не бути серед курсів класу (старий номер, урок без курсу) —
// тоді додаємо його окремим пунктом, щоб поле показувало, що зараз вибрано
function entryItems(courses, suggested, entry) {
  const items = courseItems(courses, suggested);
  const value = entryValue(entry);
  if (!value || items.some((item) => item.value === value)) return items;
  return [{ value, code: entry.subject, title: entry.subject, subtitle: entry.course?.nr ? `Kurs ${entry.course.nr}` : "ohne Kurs", group: "Jetzt" }, ...items];
}
// Що вибрано в полі: номер курсу, а урок без курсу — «fach:Ma»
const entryValue = (entry) => entry.course?.nr ?? (entry.subject ? `fach:${entry.subject}` : null);

// Один курс уроку: поле «Kurs» зі списком і пошуком (design/neu/19c), «Lehrer», «Raum». index — щоб id не повторювались
const EntryFields = ({ entry, index, courses, suggested, onChange, onRemove }) => (
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
      <ListPicker
        id={`muster-course-${index}`}
        label="Kurs"
        inline // на телефоні поле вже у шторці
        title="Kurs wählen"
        placeholder="Kurs wählen"
        items={entryItems(courses, suggested, entry)}
        value={entryValue(entry)}
        onChange={(nr) => {
          const course = courses.find((c) => c.nr === nr);
          if (course) onChange(lessonFromCourse(course, entry.room)); // вчитель — з курсу, кабінет лишається
        }}
      />
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
  const suggested = autoEntries.map((entry) => entry.course?.nr).filter(Boolean); // «Vorschlag»: що тут у плані

  const change = (index, entry) => setDraft(draft.map((old, i) => (i === index ? entry : old)));
  const clean = (entry) => ({ ...entry, teacher: entry.teacher?.trim() || null, room: entry.room?.trim() || null });

  return (
    <div className="flex flex-col gap-4">
      {courses.length === 0 && <p className="text-label text-faint">Noch keine Kurse — sie kommen mit dem ersten Plan.</p>}
      {draft.map((entry, index) => (
        <EntryFields key={index} entry={entry} index={index} courses={courses} suggested={suggested} onChange={(next) => change(index, next)} onRemove={index > 0 ? () => setDraft(draft.filter((_, i) => i !== index)) : null} />
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
