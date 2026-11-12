import SubjectBadge from "../ui/SubjectBadge";
import { useNavigate } from "react-router-dom";
import { File, Plus, Share } from "lucide-react";
import { useDay } from "../../shared/hooks/usePlan";
import { useSheet } from "../../shared/hooks/useSheet";
import { usePlanStore } from "../../shared/store/planStore";
import { useUserStore } from "../../shared/store/userStore";
import { lessonName } from "../../shared/utils/format";
import { fachTextClass, findLesson, lessonExam, lessonNote } from "../../shared/utils/lessons";
import { findNote } from "../../shared/utils/notes";
import { lessonText, shareText } from "../../shared/utils/share";
import ChangedValue from "../lesson/ChangedValue";
import LessonMaterials from "../materials/LessonMaterials";
import Button from "../ui/Button";
import Sheet from "../ui/Sheet";
import StatusBadge from "../ui/StatusBadge";
import MusterBadge from "../muster/MusterBadge";
import LessonEntries from "../entries/LessonEntries";
import { addExamTarget, addHomeworkTarget, canCreateExam, canCreateHomework } from "../../shared/utils/examRules";
import { lessonEntries } from "../../shared/utils/entries";

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
  const note = useUserStore((s) => findNote(s.notes, `${sheet.datum}#${sheet.stunde}`)); // нотатка до уроку
  const { day } = useDay(sheet.datum); // день із тижня
  const shareEnabled = usePlanStore((s) => s.me?.features?.share !== false); // адмін міг вимкнути «Teilen»
  const me = usePlanStore((s) => s.me); // права на записи (часть 24)
  const homework = usePlanStore((s) => s.homework); // Hausaufgaben «bis zu dieser Stunde»
  const navigate = useNavigate();

  const lesson = day ? findLesson(day.lessons, sheet.stunde, sheet.fach) : null; // сам урок
  if (!lesson) return null; // ще вантажиться або урок зник після оновлення плану

  const exam = lessonExam(day, lesson); // Klausur цього уроку
  const info = lessonNote(lesson, null); // пояснення школи / перенос
  // «Für diese Stunde»: Tests этой Stunde и все Hausaufgaben предмета на этот день (сдвоенный урок)
  const entries = lessonEntries(day.exams ?? [], homework, sheet.datum, lesson, { allHomework: true });
  // Куда ведут «+ Hausaufgabe» / «+ Test»: форма на этот урок; без кода — ввод Editor-Code; код без права — кнопки нет
  const query = `?datum=${sheet.datum}&stunde=${lesson.period}&fach=${encodeURIComponent(lesson.subject?.code ?? "")}${lesson.muster ? "&muster=1" : ""}`;
  const homeworkTarget = !lesson.subject ? null : canCreateHomework(me) ? `/testen/hausaufgaben/neu${query}` : addHomeworkTarget(me);
  const examTarget = !lesson.subject ? null : canCreateExam(me) ? `/testen/neu${query}` : addExamTarget(me);

  return (
    <Sheet
      open={open}
      onClose={onClose}
      panelLabel="Stunde"
      eyebrow={`${lesson.period}. Stunde${lesson.start ? ` · ${lesson.start}–${lesson.end}` : ""}`}
      title={lessonName(lesson)}
      titleAside={lesson.muster ? <MusterBadge /> : <StatusBadge lesson={lesson} exam={exam} />}
      titleClassName={fachTextClass(lesson.subject?.code, overrides)}
      hideClose
      // кружечок з кодом предмета в його кольорі
      icon={<SubjectBadge subject={lesson.subject} size="lg" />}
      footer={
        <>
          {/* записи на этот урок (часть 24; урок из Muster тоже можно) */}
          {homeworkTarget && (
            <Button variant="tint" className="grow basis-2/5" onClick={() => navigate(homeworkTarget)}>
              <Plus className="size-4.5" /> Hausaufgabe
            </Button>
          )}
          {examTarget && (
            <Button variant="tint" className="grow basis-2/5" onClick={() => navigate(examTarget)}>
              <Plus className="size-4.5" /> Test
            </Button>
          )}
          {/* replace: true — «Назад» із нотатки не поверне в цю шторку */}
          <Button className="grow basis-2/5" onClick={() => openSheet("notiz", { datum: sheet.datum, stunde: lesson.period }, { replace: true })}>
            <File className="size-4.5" /> Notiz
          </Button>
          {shareEnabled && (
            <Button className="grow basis-2/5" onClick={() => shareText(lessonText(lesson, sheet.datum))}>
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
        {info && <Row label="Info">{info}</Row>}
        {lesson.muster && <Row label="Info">aus dem Muster – kann sich noch ändern</Row>}
      </dl>

      {/* Tests и Hausaufgaben этого урока (часть 24) */}
      <LessonEntries exams={entries.exams} homework={entries.homework} lesson={lesson} />

      {/* посилання на Drive цього предмета (частина 15) */}
      <LessonMaterials subject={lesson.subject} overrides={overrides} />

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
