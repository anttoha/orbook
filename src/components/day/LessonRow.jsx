import { Info, NotebookPen } from "lucide-react";
import { cn } from "../../shared/utils/cn";
import { subjectName } from "../../shared/utils/format";
import { lessonProgress } from "../../shared/utils/lessonClock";
import { useNow } from "../../shared/hooks/useNow";
import { fachClasses, lessonNote } from "../../shared/utils/lessons";
import Badge from "../ui/Badge";
import StatusBadge from "../ui/StatusBadge";
import LessonContextMenu from "../lesson/LessonContextMenu";
import LessonTooltip from "../lesson/LessonTooltip";

// Нове значення + закреслене старе («T26 ~~T25~~»). old — з lesson.changes (буває null)
const WithOld = ({ value, old }) => (
  <>
    <span className={cn(old && "font-extrabold text-accent-ink")}>{value}</span>
    {old && <s className="ml-1 opacity-60">{old}</s>}
  </>
);

// ─────────────────────────────────────────────────────────────
// Один урок у списку «Liste».
//   variant="outside" — час зліва зовні картки (телефон)
//   variant="inline"  — час усередині картки (ПК, макет «Tag · Liste»)
// exam — Klausur цього уроку або null; live — { minutesLeft }, якщо урок іде зараз
// ─────────────────────────────────────────────────────────────
const LessonRow = ({ lesson, exam, date, isPast, live, note, overrides, onOpen, variant = "outside" }) => {
  const { now } = useNow(); // для смужки прогресу
  const isCancelled = lesson.status === "cancelled"; // fällt aus?
  const isChanged = !isCancelled && lesson.status !== "normal"; // зміна (рамка)
  const inline = variant === "inline"; // варіант для ПК?
  const caption = lessonNote(lesson, exam); // рядок з (i)

  // Час: «07:30 / 08:15» (в уроку 10 часу немає)
  const time = (
    <div className={cn("shrink-0", inline ? "w-10" : "w-11 pt-3 text-right", !inline && isPast && "opacity-50")}>
      <p className={cn("text-body-sm leading-4 font-black", live && inline ? "text-accent-ink" : !inline && "text-ink")}>{lesson.start ?? `${lesson.period}.`}</p>
      <p className={cn("text-small font-bold", inline ? "opacity-60" : "text-faint")}>{lesson.end ?? "Std"}</p>
    </div>
  );

  // Вміст картки: назва, бейдж, вчитель · кабінет, пояснення, нотатка
  const content = (
    <div className="min-w-0 flex-1">
      <div className="flex items-center justify-between gap-2">
        <span className={cn("truncate text-body font-extrabold", isCancelled && "line-through")}>{subjectName(lesson.subject)}</span>
        {live ? <Badge variant="live">Läuft · {live.minutesLeft} min</Badge> : <StatusBadge lesson={lesson} exam={exam} />}
      </div>

      {/* вчитель · кабінет; при заміні старий вчитель закреслений (старого кабінету школа не повідомляє) */}
      {!isCancelled && (
        <p className="mt-0.5 text-caption font-bold opacity-80">
          <WithOld value={lesson.teacher} old={lesson.changes?.teacher?.old} />
          {lesson.room && (
            <>
              {" · Raum "}
              <WithOld value={lesson.room} old={lesson.changes?.room?.old} />
            </>
          )}
        </p>
      )}

      {caption && (
        <p className={cn("mt-1.5 flex items-center gap-1.5 text-caption font-bold", isChanged && "text-accent-ink")}>
          <Info className="size-3.5 shrink-0" /> {caption}
        </p>
      )}

      {/* своя нотатка до уроку */}
      {note && (
        <p className="mt-1.5 flex items-center gap-1.5 text-caption font-bold text-accent-ink">
          <NotebookPen className="size-3.5 shrink-0" /> <span className="truncate">{note.text}</span>
        </p>
      )}
    </div>
  );

  // Класи кольору картки
  const colors = isCancelled ? cn("border-[1.5px] border-dashed text-faint", inline ? "border-rule bg-sand/40" : "border-faint2") : fachClasses(lesson.subject.code, overrides);

  // Смужка прогресу в уроку, що йде
  const progress = live && (
    <div className={cn("absolute overflow-hidden", inline ? "inset-x-3.5 bottom-2 h-1 rounded-full bg-card/70" : "inset-x-0 bottom-0 h-1 bg-accent/20")}>
      <div className="h-full rounded-full bg-accent" style={{ width: `${lessonProgress(lesson, now) * 100}%` }} />
    </div>
  );

  const row = inline ? (
    // ── ПК: час усередині картки ──
    <button
      type="button"
      onClick={onOpen}
      disabled={!onOpen}
      className={cn(
        "relative flex w-full gap-4 overflow-hidden rounded-[18px] px-3.5 py-3 text-left transition-shadow outline-none select-none hover:shadow-md focus-visible:ring-2 focus-visible:ring-accent/60",
        colors,
        live && "pb-4.5", // місце під смужку прогресу
        isPast && "opacity-50",
      )}
    >
      {time}
      {content}
      {progress}
    </button>
  ) : (
    // ── телефон: час зовні зліва ──
    <button
      type="button"
      onClick={onOpen}
      disabled={!onOpen}
      className="flex w-full gap-3 rounded-2xl text-left outline-none select-none [-webkit-touch-callout:none] focus-visible:ring-2 focus-visible:ring-accent/60"
    >
      {time}
      <div
        className={cn(
          "relative flex min-w-0 flex-1 overflow-hidden rounded-2xl px-3.5 py-3",
          colors,
          isChanged && "ring-2 ring-accent ring-inset", // рамка у зміни
          live && "ring-2 ring-accent", // урок, що йде, теж виділяємо
          isPast && "opacity-50", // минулі — блідіші
        )}
      >
        {content}
        {progress}
      </div>
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
