import { FileText, Share } from "lucide-react";
import { useDay } from "../../shared/hooks/usePlan";
import { useSheet } from "../../shared/hooks/useSheet";
import { useUserStore } from "../../shared/store/userStore";
import { cn } from "../../shared/utils/cn";
import { subjectName } from "../../shared/utils/format";
import { fachClasses, findLesson, lessonExam, lessonNote } from "../../shared/utils/lessons";
import { lessonText, shareText } from "../../shared/utils/share";
import Button from "../ui/Button";
import Sheet from "../ui/Sheet";
import StatusBadge from "../ui/StatusBadge";

// Рядок «Lehrer / Raum / Kurs / Info»
// (на ПК — більший і без білої підкладки, як на макеті «Stunde · Details (Panel rechts)»)
const Row = ({ label, children }) => (
  <div className="flex gap-4 py-3 lg:py-3.5">
    <dt className="w-16 shrink-0 text-body-sm font-bold text-faint lg:w-20 lg:text-body lg:font-medium lg:text-muted">{label}</dt>
    <dd className="min-w-0 flex-1 text-body-sm font-bold text-ink lg:text-body lg:font-semibold">{children}</dd>
  </div>
);

// Нове значення + закреслене старе: «T26 ~~T25~~» (старе — з lesson.changes, буває null)
const Changed = ({ value, old }) => (
  <>
    <span className={cn(old && "font-extrabold text-accent-ink")}>{value ?? "—"}</span>
    {old && <s className="ml-2 font-bold text-faint">{old}</s>}
  </>
);

// ─────────────────────────────────────────────────────────────
// Шторка уроку. Адреса: ?sheet=stunde&datum=2026-10-07&stunde=2&fach=Ma
// (fach потрібен, бо в одного уроку бувають паралельні курси).
// Своїх запитів немає — урок береться з уже завантаженого тижня.
// ─────────────────────────────────────────────────────────────
const LessonSheet = ({ open, onClose, sheet }) => {
  const { openSheet } = useSheet(); // щоб відкрити шторку нотатки
  const overrides = useUserStore((s) => s.colorOverrides); // свої кольори
  const note = useUserStore((s) => s.notes.find((n) => n.id === `${sheet.datum}#${sheet.stunde}`)); // нотатка до уроку
  const { day } = useDay(sheet.datum); // день із тижня

  const lesson = day ? findLesson(day.lessons, sheet.stunde, sheet.fach) : null; // сам урок
  if (!lesson) return null; // ще вантажиться або урок зник після оновлення плану

  const exam = lessonExam(day, lesson); // Klausur цього уроку
  const info = lessonNote(lesson, null); // пояснення школи / перенос

  return (
    <Sheet
      open={open}
      onClose={onClose}
      panelLabel="Stunde"
      eyebrow={`${lesson.period}. Stunde${lesson.start ? ` · ${lesson.start}–${lesson.end}` : ""}`}
      title={subjectName(lesson.subject)}
      titleAside={<StatusBadge lesson={lesson} exam={exam} />}
      // кружечок з кодом предмета в його кольорі
      icon={
        <span className={cn("grid size-11 shrink-0 place-items-center rounded-full text-body-sm font-black", fachClasses(lesson.subject.code, overrides))}>
          {lesson.subject.code}
        </span>
      }
      footer={
        <>
          {/* replace: true — «Назад» із нотатки не поверне в цю шторку */}
          <Button onClick={() => openSheet("notiz", { datum: sheet.datum, stunde: lesson.period }, { replace: true })}>
            <FileText className="size-4.5" /> Notiz
          </Button>
          <Button onClick={() => shareText(lessonText(lesson, sheet.datum))}>
            <Share className="size-4.5" /> Teilen
          </Button>
        </>
      }
    >
      {/* dl — список «назва: значення» */}
      <dl className="divide-y divide-hair rounded-2xl bg-card px-4 lg:rounded-none lg:bg-transparent lg:px-0">
        {lesson.status === "cancelled" ? (
          <Row label="Status">fällt aus</Row>
        ) : (
          <>
            <Row label="Lehrer">
              <Changed value={lesson.teacher} old={lesson.changes?.teacher?.old} />
            </Row>
            <Row label="Raum">
              <Changed value={lesson.room} old={lesson.changes?.room?.old} />
            </Row>
          </>
        )}
        {lesson.course && <Row label="Kurs">{lesson.course.label}</Row>}
        {exam && <Row label={exam.type}>{exam.topic || "—"}</Row>}
        {info && <Row label="Info">{info}</Row>}
      </dl>

      {/* своя нотатка до уроку, якщо є */}
      {note && (
        <div className="rounded-2xl bg-tint p-4 text-body-sm font-bold whitespace-pre-wrap text-ink">
          <p className="mb-1 text-small font-extrabold text-accent-ink uppercase">Meine Notiz</p>
          {note.text}
        </div>
      )}
    </Sheet>
  );
};

export default LessonSheet;
