import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useDay } from "../../shared/hooks/usePlan";
import { useUserStore } from "../../shared/store/userStore";
import { isIsoDate, longDate, numericDate, subjectName, weekdayLong, weekdayShort } from "../../shared/utils/format";
import Button from "../ui/Button";
import Sheet from "../ui/Sheet";

// ─────────────────────────────────────────────────────────────
// Шторка нотатки (нотатки живуть тільки на пристрої — userStore).
//   ?sheet=notiz&datum=…&stunde=2  — нотатка до уроку
//   ?sheet=notiz&datum=…&id=…      — змінити нотатку на день
//   ?sheet=notiz&datum=…           — нова нотатка на день
// ─────────────────────────────────────────────────────────────
const NoteSheet = ({ open, onClose, sheet }) => {
  const valid = isIsoDate(sheet.datum); // чи правильна дата в адресі
  const { day } = useDay(valid ? sheet.datum : null); // день (для назви уроку)
  const period = sheet.stunde ? Number(sheet.stunde) : null; // номер уроку (якщо нотатка до уроку)
  const lesson = period ? day?.lessons.find((l) => l.period === period) : null; // сам урок

  // id нотатки: до уроку — «дата#урок», на день — з адреси (або нова)
  const noteId = period ? `${sheet.datum}#${period}` : sheet.id;
  const note = useUserStore((s) => s.notes.find((n) => n.id === noteId)); // уже збережена нотатка

  if (!valid) return null; // крива адреса

  // Підпис над заголовком: «2. Std · Mathe · Mi, 7.10.» або «Mittwoch, 7. Oktober»
  const eyebrow = period
    ? `${period}. Std${lesson ? ` · ${subjectName(lesson.subject)}` : ""} · ${weekdayShort(sheet.datum)}, ${numericDate(sheet.datum)}`
    : `${weekdayLong(sheet.datum)}, ${longDate(sheet.datum)}`;

  return (
    <Sheet open={open} onClose={onClose} panelLabel="Notiz" eyebrow={eyebrow} title={note ? "Notiz bearbeiten" : "Neue Notiz"}>
      {/* key — при зміні нотатки форма створюється заново з її текстом */}
      <NoteForm key={noteId ?? "neu"} note={note} noteId={noteId} date={sheet.datum} period={period} onDone={onClose} />
    </Sheet>
  );
};

// Форма з полем вводу і кнопками
const NoteForm = ({ note, noteId, date, period, onDone }) => {
  const [text, setText] = useState(note?.text ?? ""); // текст у полі
  const saveNote = useUserStore((s) => s.saveNote); // зберегти
  const deleteNote = useUserStore((s) => s.deleteNote); // видалити

  // Збереження
  const handleSubmit = (e) => {
    e.preventDefault(); // не перезавантажувати сторінку
    if (!text.trim()) return; // порожню не зберігаємо
    saveNote({ id: noteId, date, period, text: text.trim() });
    toast.success("Notiz gespeichert");
    onDone();
  };

  // Видалення
  const handleDelete = () => {
    deleteNote(noteId);
    toast("Notiz gelöscht");
    onDone();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="px-1 text-label font-bold text-muted">Nur für dich sichtbar</span>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="z. B. Sportsachen mitnehmen"
          rows={4}
          autoFocus // одразу можна друкувати
          className="w-full resize-none rounded-2xl bg-card p-3.5 text-body font-bold text-ink outline-none placeholder:text-faint focus:ring-2 focus:ring-accent/30"
        />
      </label>
      <div className="flex gap-2.5">
        {/* «Löschen» тільки для вже збереженої нотатки */}
        {note && (
          <Button onClick={handleDelete} className="text-danger">
            <Trash2 className="size-4.5" /> Löschen
          </Button>
        )}
        <Button type="submit" variant="primary" disabled={!text.trim()}>
          Speichern
        </Button>
      </div>
    </form>
  );
};

export default NoteSheet;
