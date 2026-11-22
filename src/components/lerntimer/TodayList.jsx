import { useSubjectName } from "../../shared/hooks/useKarten";
import { useT } from "../../shared/hooks/useT";
import { useUserStore } from "../../shared/store/userStore";
import { durationText } from "../../shared/utils/lerntimer";
import { fachDotClass } from "../../shared/utils/lessons";
import Liquid from "../ui/Liquid";

// «Heute» под таймером (макет 44): что уже выучено сегодня — предмет, когда начал, сколько минут.
// Пусто — блока нет совсем. Новая строка «выплывает» (animate-float-up)
const TodayList = ({ sessions, total }) => {
  const t = useT();
  const nameOf = useSubjectName();
  const overrides = useUserStore((s) => s.colorOverrides);
  if (sessions.length === 0) return null;
  return (
    <section className="flex flex-col gap-3">
      <h2 className="flex justify-between text-hint font-extrabold">
        <span className="text-faint">{t("Heute")}</span>
        <span className="text-accent-ink">{durationText(total)}</span>
      </h2>
      <Liquid as="ul" refract press={false} className="overflow-hidden rounded-card bg-card">
        {sessions.map((s) => (
          <li key={s.id} className="flex h-14 items-center gap-3 border-b border-hair px-4 last:border-0 motion-safe:animate-float-up">
            <span className={`size-2.5 shrink-0 rounded-full ${fachDotClass(s.code, overrides)}`} />
            <span className="min-w-0 flex-1 truncate text-row font-bold text-ink">{nameOf(s.code)}</span>
            <span className="text-label text-faint tabular-nums">{s.at}</span>
            <span className="w-16 text-right text-body-sm font-extrabold text-ink tabular-nums">{t("{min} min", { min: s.min })}</span>
          </li>
        ))}
      </Liquid>
    </section>
  );
};

export default TodayList;
