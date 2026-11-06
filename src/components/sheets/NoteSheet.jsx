import { useRef, useState } from "react";
import { toast } from "sonner";
import { useSyncOn } from "../../shared/hooks/useNotesSync";
import { useDay } from "../../shared/hooks/usePlan";
import { useUserStore } from "../../shared/store/userStore";
import { isIsoDate, longDate, weekdayLong } from "../../shared/utils/format";
import { findNote, noteSubjects } from "../../shared/utils/notes";
import SubjectToggle from "../exams/SubjectToggle";
import Button from "../ui/Button";
import Field from "../ui/Field";
import { CalendarIcon, CheckIcon, LockIcon, TrashIcon } from "../ui/icons";
import Sheet from "../ui/Sheet";

// ─────────────────────────────────────────────────────────────
// Шторка «Notiz» (макет 20 — телефон, 21 — вікно на ПК). Нотатки живуть на пристрої (userStore),
// з Sync-Code їх підхоплює синхронізація (useNotesSync).
//   ?sheet=notiz&datum=…&stunde=2  — нотатка до уроку
//   ?sheet=notiz&datum=…&id=…      — змінити нотатку на день
//   ?sheet=notiz&datum=…           — нова нотатка на день
// ─────────────────────────────────────────────────────────────
const NoteSheet = ({ open, onClose, sheet }) => {
  const valid = isIsoDate(sheet.datum); // чи правильна дата в адресі
  const period = sheet.stunde ? Number(sheet.stunde) : null; // номер уроку (якщо нотатка до уроку)
  const noteId = period ? `${sheet.datum}#${period}` : sheet.id; // до уроку — «дата#урок», на день — з адреси
  const note = useUserStore((s) => (noteId ? findNote(s.notes, noteId) : null)); // уже збережена нотатка

  if (!valid) return null; // крива адреса

  return (
    <Sheet open={open} onClose={onClose} desktop="dialog" eyebrow="Nur für dich" title="Notiz">
      {/* key — при зміні нотатки форма створюється заново з її текстом */}
      <NoteForm key={noteId ?? "neu"} note={note} noteId={noteId} date={sheet.datum} period={period} onDone={onClose} />
    </Sheet>
  );
};

// Форма: текст, предмет, дата, кнопки
const NoteForm = ({ note, noteId, date: openedOn, period, onDone }) => {
  const { day } = useDay(openedOn); // уроки дня — для чіпів предметів
  const lesson = period ? day?.lessons.find((l) => l.period === period) : null; // урок нотатки
  const [text, setText] = useState(note?.text ?? "");
  const [subject, setSubject] = useState(note ? note.subject : (lesson?.subject?.code ?? null)); // до уроку — предмет уроку
  const [date, setDate] = useState(note?.date ?? openedOn);
  const saveNote = useUserStore((s) => s.saveNote);
  const deleteNote = useUserStore((s) => s.deleteNote);
  const restoreNote = useUserStore((s) => s.restoreNote);

  const subjects = noteSubjects(day?.lessons, subject);

  const handleSubmit = (e) => {
    e.preventDefault(); // не перезавантажувати сторінку
    if (!text.trim()) return; // порожню не зберігаємо
    try {
      saveNote({ id: noteId, date, period, subject, text: text.trim() });
    } catch {
      toast.error("Notiz konnte nicht gespeichert werden"); // localStorage переповнений або заборонений
      return;
    }
    toast.success("Notiz gespeichert");
    onDone();
  };

  // Видалення без питання: у сповіщенні є «Rückgängig» (docs/frontend/06-notizen.md)
  const handleDelete = () => {
    deleteNote(noteId);
    toast("Notiz gelöscht", { duration: 6000, action: { label: "Rückgängig", onClick: () => restoreNote(note) } });
    onDone();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Field label="Notiz">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          aria-label="Notiz"
          placeholder="z. B. Sportsachen mitnehmen"
          rows={4}
          autoFocus // одразу можна друкувати
          className="h-31 w-full resize-none rounded-field bg-card px-4.25 py-3.5 text-input text-ink outline-none placeholder:text-faint focus:ring-2 focus:ring-accent/30"
        />
      </Field>

      {subjects.length > 0 && (
        <Field label="Zu Fach · optional">
          <div className="flex flex-wrap gap-2">
            {subjects.map((code) => (
              // повторне натискання знімає предмет: він необов'язковий
              <SubjectToggle key={code} code={code} label={code} selected={subject === code} onClick={() => setSubject(subject === code ? null : code)} />
            ))}
          </div>
        </Field>
      )}

      <DateRow date={date} period={period} onChange={setDate} />

      <div className="flex flex-col gap-3.5">
        <StorageHint />
        <div className="flex gap-2">
          {/* «Löschen» тільки для вже збереженої нотатки */}
          {note && (
            <Button variant="danger" onClick={handleDelete} className="flex-none px-4.5">
              <TrashIcon className="size-4" /> Löschen
            </Button>
          )}
          <Button type="submit" variant="primary" disabled={!text.trim()}>
            <CheckIcon className="size-4" /> Speichern
          </Button>
        </div>
      </div>
    </form>
  );
};

// «Mittwoch, 17. September · Ändern». У нотатки до уроку дату не міняємо: вона прив'язана до уроку
const DateRow = ({ date, period, onChange }) => {
  const picker = useRef(null); // приховане поле дати: «Ändern» відкриває його календар
  const label = `${weekdayLong(date)}, ${longDate(date)}${period ? ` · ${period}. Std` : ""}`;

  const openPicker = () => {
    try {
      picker.current.showPicker(); // календар браузера
    } catch {
      picker.current.focus(); // старі браузери: хоча б фокус на полі
    }
  };

  return (
    <div className="flex items-center gap-3">
      <CalendarIcon className="size-4.5 shrink-0 text-muted" />
      <span className="min-w-0 flex-1 text-row text-ink">{label}</span>
      {!period && (
        <>
          <button type="button" onClick={openPicker} className="text-label font-bold text-accent-ink">
            Ändern
          </button>
          <input ref={picker} type="date" value={date} onChange={(e) => isIsoDate(e.target.value) && onChange(e.target.value)} aria-label="Datum" tabIndex={-1} className="sr-only" />
        </>
      )}
    </div>
  );
};

// Де живе нотатка: з Sync-Code — ще й на сервері (зашифровано), без — тільки тут
const StorageHint = () => {
  const syncOn = useSyncOn();

  return (
    <p className="flex items-center gap-1.5 text-caption text-faint">
      <LockIcon className="size-3.25 shrink-0" />
      {syncOn ? "Nur für dich. Wird mit deinem Sync-Code gespeichert." : "Nur für dich. Bleibt auf diesem Gerät."}
    </p>
  );
};

export default NoteSheet;
