import { Clock, CloudRain, DoorOpen } from "lucide-react";
import { useT } from "../../shared/hooks/useT";
import { useUserStore } from "../../shared/store/userStore";
import { subjectName } from "../../shared/utils/format";
import { fachDotClass } from "../../shared/utils/lessons";
import { itemFor } from "../../shared/utils/nowFocus";
import { degrees, rainFrom } from "../../shared/utils/weather";
import BlockCard from "../start/BlockCard";
import { LessonList, PartTitle } from "./FocusParts";

// «Danach»: два следующих урока; справа — вещь предмета («Sportsachen!»), если она есть
const After = ({ lessons, settings, changes }) => {
  const t = useT();
  if (!lessons.length) return null;
  const asideOf = (lesson) => {
    const item = itemFor(lesson, settings);
    return item ? { text: `${t(item)}!`, className: "font-extrabold text-accent-ink" } : undefined;
  };
  return (
    <div className="mt-3 border-t border-hair pt-2">
      <PartTitle>{t("Danach")}</PartTitle>
      <LessonList lessons={lessons} changes={changes} asideOf={asideOf} />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Идёт урок (kind «stunde») или перемена (kind «pause») — макет 50 handy-02.
// Урок: предмет, учитель и кабинет, «noch 27 min», полоска, «Danach», дождь позже.
// Перемена: «Gleich · 11:35», предмет и кабинет крупно (изменён — «Raum 108 statt 110»)
// ─────────────────────────────────────────────────────────────
const FocusStunde = ({ focus, size, editing, settings, changes }) => {
  const t = useT();
  const overrides = useUserStore((s) => s.colorOverrides);
  const { lesson } = focus;
  const pause = focus.kind === "pause";
  const minutes = pause ? focus.inMinutes : focus.minutesLeft;
  const title = pause ? t("Pause") : size === "klein" ? t("Jetzt") : `${t("Jetzt")} · ${lesson.period}. ${t("Stunde")}`;
  const aside = size === "klein" ? `${minutes} min` : t("noch {n} min", { n: minutes });
  const room = lesson.room && (pause && focus.oldRoom && changes ? t("Raum {a} statt {b}", { a: lesson.room, b: focus.oldRoom }) : `${t("Raum")} ${lesson.room}`);

  return (
    <BlockCard kind="fuerDich" icon={Clock} accent title={title} aside={aside} to="/heute" editing={editing}>
      {pause && size !== "klein" && <p className="text-label font-bold text-faint">{`${t("Gleich")} · ${lesson.start}`}</p>}
      <div className="flex items-baseline justify-between gap-2">
        <p className="truncate text-number text-ink lg:text-cell">{subjectName(lesson.subject)}</p>
        {!pause && size !== "klein" && <p className="shrink-0 text-caption text-faint">{`${lesson.start}–${lesson.end}`}</p>}
      </div>

      {pause ? (
        <p className="mt-1.5 flex min-w-0 items-center gap-2">
          {room && (
            <span className="inline-flex h-8 min-w-0 items-center gap-1.5 rounded-full bg-tint px-3 text-body-sm font-extrabold text-accent-ink">
              <DoorOpen aria-hidden="true" className="size-4 shrink-0" strokeWidth={2.2} />
              <span className="truncate">{room}</span>
            </span>
          )}
          {lesson.teacher && size !== "klein" && <span className="truncate text-body-sm text-muted">{t("bei {short}", { short: lesson.teacher })}</span>}
        </p>
      ) : (
        <p className="truncate text-body-sm text-muted">{[lesson.teacher, room].filter(Boolean).join(" · ")}</p>
      )}

      {!pause && size !== "klein" && (
        <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-sand">
          <div className={`h-full rounded-full ${fachDotClass(lesson.subject?.code, overrides)}`} style={{ width: `${focus.progress * 100}%` }} />
        </div>
      )}

      {size === "gross" && <After lessons={focus.after} settings={settings} changes={changes} />}
      {size === "gross" && focus.rain && (
        <p className="mt-auto flex items-center gap-1.5 pt-2 text-caption font-bold text-muted">
          <CloudRain aria-hidden="true" className="size-4" strokeWidth={2} />
          {`${t("Regen {from}", { from: rainFrom(focus.rain) })} · ${degrees(focus.rain.hours?.find((h) => h.hour === focus.rain.rainFrom)?.temp ?? focus.rain.tMax)}`}
        </p>
      )}
    </BlockCard>
  );
};

export default FocusStunde;
