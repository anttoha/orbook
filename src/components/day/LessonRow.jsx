import { Info, NotebookPen } from "lucide-react";
import { useNow } from "../../shared/hooks/useNow";
import { cn } from "../../shared/utils/cn";
import { subjectName } from "../../shared/utils/format";
import { lessonProgress } from "../../shared/utils/lessonClock";
import { fachClasses, lessonNote } from "../../shared/utils/lessons";
import Badge from "../ui/Badge";
import StatusBadge from "../ui/StatusBadge";
import ChangedValue from "../lesson/ChangedValue";
import LessonContextMenu from "../lesson/LessonContextMenu";
import LessonTooltip from "../lesson/LessonTooltip";

// Рядок «Kle ~~Mü~~ · Raum 204». Учитель і кабінет бувають null: тоді без зайвої крапки, а без обох рядка немає.
const PlaceLine = ({ lesson }) => {
  const { teacher, room, changes } = lesson;
  if (!teacher && !room) return null;

  return (
    <p className="mt-0.5 text-hint text-muted">
      {teacher && <ChangedValue value={teacher} change={changes?.teacher} oldClassName="ml-1" />}
      {teacher && room && " · "}
      {room && (
        <>
          {"Raum "}
          <ChangedValue value={room} change={changes?.room} oldClassName="ml-1" />
        </>
      )}
    </p>
  );
};

// ─────────────────────────────────────────────────────────────
// Один урок у списку «Liste». Однаковий на телефоні й на ПК (макет «Tag · Liste»).
// exam — Klausur цього уроку або null; live — { minutesLeft }, якщо урок іде зараз
// ─────────────────────────────────────────────────────────────
const LessonRow = ({ lesson, exam, date, isPast, live, note, overrides, onOpen }) => {
  const { now } = useNow(); // для смужки прогресу
  const isCancelled = lesson.status === "cancelled"; // fällt aus?
  const isChanged = !isCancelled && lesson.status !== "normal"; // зміна (рамка)
  const caption = lessonNote(lesson, exam); // рядок з (i)

  const row = (
    <button
      type="button"
      onClick={onOpen}
      disabled={!onOpen}
      className={cn(
        "relative flex min-h-16 w-full rounded-box px-3.5 py-3 text-left transition-shadow outline-none select-none [-webkit-touch-callout:none] hover:shadow-raise focus-visible:ring-2 focus-visible:ring-accent/60",
        lesson.notMine ? "border border-dashed border-faint2 text-faint" : isCancelled ? "bg-sand text-faint" : fachClasses(lesson.subject?.code, overrides),
        lesson.muster && "hatch-muster", // урок із Muster (частина 19)
        (isChanged || live) && "ring-2 ring-accent", // рамка в зміни й в уроку, що йде
        live && "pb-5", // місце під смужку прогресу
        isPast && "opacity-50", // минулі блідіші
      )}
    >
      {/* час: «07:30 / 08:15» (в уроку 10 часу немає) */}
      <div className="w-13.5 shrink-0">
        <p className={cn("text-label font-bold", live ? "text-accent-ink" : "text-ink")}>{lesson.start ?? `${lesson.period}.`}</p>
        <p className="mt-0.5 text-small text-faint">{lesson.end ?? "Std"}</p>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className={cn("truncate text-body font-extrabold", isCancelled && "line-through")}>{subjectName(lesson.subject)}</span>
          {/* чужий курс у режимі «Alle Kurse» (частина 22) */}
          {lesson.notMine ? <Badge variant="cancelled">Nicht dein Kurs</Badge> : live ? <Badge variant="live">Läuft · {live.minutesLeft} min</Badge> : <StatusBadge lesson={lesson} exam={exam} />}
        </div>

        {!isCancelled && <PlaceLine lesson={lesson} />}

        {caption && (
          <p className={cn("mt-1 flex items-center gap-1.5 text-caption", isChanged ? "text-accent-ink" : "text-muted")}>
            <Info className="size-3.25 shrink-0" strokeWidth={2.2} /> {caption}
          </p>
        )}

        {/* своя нотатка до уроку */}
        {note && (
          <p className="mt-1 flex items-center gap-1.5 text-caption text-accent-ink">
            <NotebookPen className="size-3.25 shrink-0" strokeWidth={2.2} /> <span className="truncate">{note.text}</span>
          </p>
        )}
      </div>

      {/* смужка прогресу в уроку, що йде */}
      {live && (
        <div className="absolute inset-x-3.5 bottom-1.75 h-1 overflow-hidden rounded-full bg-card/80">
          <div className="h-full rounded-full bg-accent" style={{ width: `${lessonProgress(lesson, now) * 100}%` }} />
        </div>
      )}
    </button>
  );

  // «Очікувані» уроки (onOpen немає) — без меню і підказки
  if (!onOpen) return row;

  return (
    // довге натискання / ПКМ → контекстне меню; наведення мишкою → підказка
    <LessonContextMenu lesson={lesson} date={date}>
      <LessonTooltip lesson={lesson}>{row}</LessonTooltip>
    </LessonContextMenu>
  );
};

export default LessonRow;
