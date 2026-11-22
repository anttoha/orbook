import { useT } from "../../shared/hooks/useT";
import { useLerntimerStore } from "../../shared/store/lerntimerStore";
import { durationShort, durationText, lernzeit, liveSessions, localDay, weekDays } from "../../shared/utils/lerntimer";
import StatCard from "../stats/StatCard";
import { useSubjectName } from "../../shared/hooks/useKarten";
import { SubjectMinutes, WeekChart } from "./LernCharts";

// «+50 min ggü. letzter Woche» — больше учили — зелёный, меньше — серый (меньше учить — не «плохо» красным)
function diffNote(diff, range, t) {
  if (diff === 0) return null;
  const amount = `${diff > 0 ? "+" : "−"}${durationText(Math.abs(diff))}`;
  const label = { week: t("ggü. letzter Woche"), month: t("ggü. letztem Monat"), halfyear: t("ggü. letztem Halbjahr") }[range];
  return { text: `${amount} ${label}`, tone: diff > 0 ? "down" : "same" };
}

// ─────────────────────────────────────────────────────────────
// «Lernzeit» сверху в «Statistik» (часть 44, макет handy-09): сколько выучено за период, раунды,
// по дням этой недели и по предметам. Таймером ни разу не пользовались — раздела нет.
// Данные — только с устройства (и Sync), сервер их не видит
// ─────────────────────────────────────────────────────────────
const LernzeitSection = ({ range }) => {
  const t = useT();
  const nameOf = useSubjectName();
  const sessions = useLerntimerStore((s) => s.sessions);
  if (liveSessions(sessions).length === 0) return null;
  const today = localDay(new Date());
  const data = lernzeit(sessions, range, today);
  const diff = diffNote(data.diff, range, t);
  const top = data.bySubject[0];

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-hint font-extrabold text-faint">{t("Lernzeit")}</h2>
      <div className="grid grid-cols-2 gap-2 lg:gap-3">
        <StatCard value={durationShort(data.minutes)} label={t("gelernt")} note={diff?.text} tone={diff?.tone} />
        <StatCard value={data.rounds} label={data.rounds === 1 ? t("Runde") : t("Runden")} note={top ? t("{fach} am meisten", { fach: nameOf(top.code) }) : null} />
      </div>
      <WeekChart days={weekDays(sessions, today)} today={today} />
      {data.bySubject.length > 0 && (
        <section className="mt-2 flex flex-col gap-3.5">
          <h2 className="text-hint font-extrabold text-faint">{t("Nach Fach")}</h2>
          <SubjectMinutes items={data.bySubject} />
        </section>
      )}
    </section>
  );
};

export default LernzeitSection;
