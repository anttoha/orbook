import { ListChecks, Sun } from "lucide-react";
import { useNow } from "../../shared/hooks/useNow";
import { useT } from "../../shared/hooks/useT";
import { usePlanStore } from "../../shared/store/planStore";
import { longDate, numericDate, subjectName, weekdayShort } from "../../shared/utils/format";
import { dueText } from "../../shared/utils/tasks";
import { degrees } from "../../shared/utils/weather";
import BlockCard from "../start/BlockCard";
import { FlagIcon } from "../ui/icons";
import ProgressBar from "../ui/ProgressBar";
import WeatherIcon from "../weather/WeatherIcon";
import { InfoRow } from "./FocusParts";

// ─────────────────────────────────────────────────────────────
// Каникулы (макет 50 handy-02, «Herbstferien»): сколько дней ещё свободно, когда снова школа,
// полоска «сколько прошло», первый тест и первое задание после каникул
// ─────────────────────────────────────────────────────────────
const FocusFerien = ({ focus, size, editing }) => {
  const t = useT();
  const { today } = useNow();
  const names = usePlanStore((s) => s.meta?.subjects);
  const day = focus.weatherDay;
  const aside = day && (
    <span className="flex items-center gap-1.5">
      <WeatherIcon code={day.code} className="size-4 text-muted" strokeWidth={2} />
      {degrees(day.tMax)}
    </span>
  );
  const back = `${weekdayShort(focus.backOn)}, ${longDate(focus.backOn)}`;

  return (
    <BlockCard kind="fuerDich" icon={Sun} accent title={focus.item.title} aside={aside} to={`/tag/${focus.backOn}`} editing={editing}>
      <p className="flex items-baseline gap-1.5">
        <span className="text-stat text-ink">{focus.daysFree}</span>
        <span className="text-body-sm font-semibold text-muted">{t(focus.daysFree === 1 ? "Tag frei" : "Tage frei")}</span>
      </p>
      <p className="truncate text-body-sm text-muted">{t("Schule wieder {date}", { date: size === "klein" ? weekdayShort(focus.backOn) : back })}</p>
      {size !== "klein" && focus.progress != null && <ProgressBar done={Math.round(focus.progress * 100)} total={100} className="mt-2.5 h-1.5" />}
      {size === "gross" && (focus.exams.length > 0 || focus.homework.length > 0) && (
        <ul className="mt-3 border-t border-hair pt-1">
          {focus.exams.map((exam) => (
            <InfoRow key={exam.id} icon={FlagIcon} text={t("Test: {fach}", { fach: subjectName(exam.subject) })} aside={`${weekdayShort(exam.date)} ${numericDate(exam.date)}`} asideClass="text-faint" />
          ))}
          {focus.homework.map((row) => (
            <InfoRow key={row.key} icon={ListChecks} text={[row.subject && (names?.[row.subject] ?? row.subject), row.text].filter(Boolean).join(" · ")} aside={dueText(row.due, today)} />
          ))}
        </ul>
      )}
    </BlockCard>
  );
};

export default FocusFerien;
