import SubjectBadge from "../ui/SubjectBadge";
import { File, Share } from "lucide-react";
import { useDay } from "../../shared/hooks/usePlan";
import { useSheet } from "../../shared/hooks/useSheet";
import { usePlanStore } from "../../shared/store/planStore";
import { useUserStore } from "../../shared/store/userStore";
import { subjectName } from "../../shared/utils/format";
import { fachTextClass, findLesson, lessonExam, lessonNote } from "../../shared/utils/lessons";
import { lessonText, shareText } from "../../shared/utils/share";
import ChangedValue from "../lesson/ChangedValue";
import Button from "../ui/Button";
import Sheet from "../ui/Sheet";
import StatusBadge from "../ui/StatusBadge";

// Рядок «Lehrer / Raum / Kurs / Info»: однаковий на телефоні й на ПК
const Row = ({ label, children }) => (
  <div className="flex py-3">
    <dt className="w-20.5 shrink-0 text-row text-faint">{label}</dt>
    <dd className="min-w-0 flex-1 text-row text-ink">{children}</dd>
  </div>
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
  const shareEnabled = usePlanStore((s) => s.me?.features?.share !== false); // адмін міг вимкнути «Teilen»

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
      titleClassName={fachTextClass(lesson.subject?.code, overrides)}
      hideClose
      // кружечок з кодом предмета в його кольорі
      icon={<SubjectBadge subject={lesson.subject} size="lg" />}
      footer={
        <>
          {/* replace: true — «Назад» із нотатки не поверне в цю шторку */}
          <Button onClick={() => openSheet("notiz", { datum: sheet.datum, stunde: lesson.period }, { replace: true })}>
            <File className="size-4.5" /> Notiz
          </Button>
          {shareEnabled && (
            <Button onClick={() => shareText(lessonText(lesson, sheet.datum))}>
              <Share className="size-4.5" /> Teilen
            </Button>
          )}
        </>
      }
    >
      {/* dl — список «назва: значення» */}
      <dl className="divide-y divide-hair">
        {lesson.status === "cancelled" ? (
          <Row label="Status">fällt aus</Row>
        ) : (
          <>
            <Row label="Lehrer">
              <ChangedValue value={lesson.teacher} change={lesson.changes?.teacher} oldClassName="ml-2" />
            </Row>
            <Row label="Raum">
              <ChangedValue value={lesson.room} change={lesson.changes?.room} oldClassName="ml-2" />
            </Row>
          </>
        )}
        {lesson.course && <Row label="Kurs">{lesson.course.label}</Row>}
        {exam && <Row label={exam.type}>{exam.topic || "—"}</Row>}
        {info && <Row label="Info">{info}</Row>}
      </dl>

      {/* своя нотатка до уроку, якщо є */}
      {note && (
        <div className="rounded-field bg-tint p-4 text-body-sm font-bold whitespace-pre-wrap text-ink">
          <p className="mb-1 text-small font-extrabold text-accent-ink uppercase">Meine Notiz</p>
          {note.text}
        </div>
      )}
    </Sheet>
  );
};

export default LessonSheet;
