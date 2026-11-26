import { Backpack } from "lucide-react";
import { useT } from "../../shared/hooks/useT";
import { useUserStore } from "../../shared/store/userStore";
import { cn } from "../../shared/utils/cn";
import { subjectName } from "../../shared/utils/format";
import { fachDotClass } from "../../shared/utils/lessons";
import { lessonAside } from "../../shared/utils/nowFocus";
import { FlagIcon } from "../ui/icons";
import TipChips from "../weather/TipChips";

// ─────────────────────────────────────────────────────────────
// Кирпичики блока «Für dich jetzt» (часть 50b, макет 50 handy-02): строка урока,
// строка «значок · текст · справа», плашки «что взять», подпись раздела.
// ─────────────────────────────────────────────────────────────

// «07:30 ● Deutsch     Web · 102». aside — своё справа (например «Sportsachen!»)
export const LessonRow = ({ lesson, aside, changes = true }) => {
  const t = useT();
  const overrides = useUserStore((s) => s.colorOverrides);
  const cancelled = changes && lesson.status === "cancelled";
  const right = aside ?? lessonAside(lesson, t, changes);
  return (
    <li className="flex items-center gap-2.5 py-1">
      <span className="w-10 shrink-0 text-caption text-faint tabular-nums">{lesson.start}</span>
      <span className={cn("size-2 shrink-0 rounded-full", cancelled ? "bg-danger" : fachDotClass(lesson.subject?.code, overrides))} />
      <span className={cn("min-w-0 flex-1 truncate text-body-sm font-bold", cancelled ? "text-danger line-through" : "text-ink")}>{subjectName(lesson.subject)}</span>
      {right.text && <span className={cn("max-w-[55%] shrink-0 truncate text-caption", right.className)}>{right.text}</span>}
    </li>
  );
};

export const LessonList = ({ lessons, changes = true, asideOf }) => (
  <ul className="flex flex-col">
    {lessons.map((lesson) => (
      <LessonRow key={`${lesson.period}-${lesson.subject?.code}-${lesson.start}`} lesson={lesson} changes={changes} aside={asideOf?.(lesson)} />
    ))}
  </ul>
);

// «☰ Physik · Protokoll Versuch 4        bis Mo»
export const InfoRow = ({ icon: Icon, text, aside, danger = false, asideClass = "text-accent-ink font-bold" }) => (
  <li className="flex items-center gap-2.5 py-1">
    <Icon aria-hidden="true" className={cn("size-4 shrink-0", danger ? "text-danger" : "text-muted")} strokeWidth={2} />
    <span className={cn("min-w-0 flex-1 truncate text-body-sm font-semibold", danger ? "text-danger line-through" : "text-ink")}>{text}</span>
    {aside && <span className={cn("shrink-0 text-caption", danger ? "font-bold text-danger" : asideClass)}>{aside}</span>}
  </li>
);

// Подпись раздела внутри блока: «Danach», «Hausaufgaben · 2 offen»
export const PartTitle = ({ children, aside }) => (
  <p className="flex items-baseline justify-between gap-2 pt-1 text-label font-bold text-faint">
    <span className="truncate">{children}</span>
    {aside && <span className="shrink-0 text-caption font-extrabold text-accent-ink">{aside}</span>}
  </p>
);

// Плашки «что взять»: погода — фиолетовые (как в шторке Wetter), тест — с флажком, вещи — песочные с рюкзаком.
// max — сколько влезает (Klein — одна, Groß — три); остальное — плашкой «+2»
export const PackChips = ({ pack, max = 3, className }) => {
  const t = useT();
  const shown = pack.slice(0, max);
  const more = pack.length - shown.length;
  const weather = shown.filter((p) => p.kind === "wetter");
  const rest = shown.filter((p) => p.kind !== "wetter");
  if (!shown.length) return null;
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {weather.length > 0 && <TipChips tips={weather} className="contents" />}
      {rest.map((item) => {
        const Icon = item.kind === "test" ? FlagIcon : Backpack;
        return (
          <span key={item.key} className={cn("inline-flex h-7 max-w-full items-center gap-1.5 rounded-full px-2.5 text-hint font-extrabold whitespace-nowrap", item.kind === "test" ? "bg-tint text-accent-ink" : "bg-sand text-ink")}>
            <Icon aria-hidden="true" className="size-3.75 shrink-0" strokeWidth={2.2} />
            <span className="truncate">{item.kind === "fach" ? t(item.label) : item.label}</span>
          </span>
        );
      })}
      {more > 0 && <span className="inline-flex h-7 items-center rounded-full bg-sand px-2.5 text-hint font-extrabold text-muted">{`+${more}`}</span>}
    </div>
  );
};
