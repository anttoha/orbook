import { Navigate, useSearchParams } from "react-router-dom";
import AbsenceList, { AbsenceTile } from "../components/noten/AbsenceList";
import NotenHeader from "../components/noten/NotenHeader";
import StandLine from "../components/noten/StandLine";
import Segmented from "../components/ui/Segmented";
import { useT } from "../shared/hooks/useT";
import { translate } from "../shared/i18n/translate";
import { useNotenStore } from "../shared/store/notenStore";
import { usePlanStore } from "../shared/store/planStore";
import { absenceEntries, absenceStats, defaultHalf } from "../shared/utils/noten";

const HALVES = [
  { value: "1", get label() { return translate("1. Halbjahr"); } },
  { value: "2", get label() { return translate("2. Halbjahr"); } },
];

// ─────────────────────────────────────────────────────────────
// Fehlzeiten (макет handy-09). /fehlzeiten?hj=1|2 — из того же ответа InfoPoint, что и Noten.
// Нет данных (не вошёл в InfoPoint) — на /noten: там вход
// ─────────────────────────────────────────────────────────────
const Fehlzeiten = () => {
  const t = useT();
  const [params, setParams] = useSearchParams();
  const enabled = usePlanStore((s) => s.me?.features?.noten !== false);
  const data = useNotenStore((s) => s.data);
  if (!enabled || !data) return <Navigate to={enabled ? "/noten" : "/"} replace />;

  const tab = ["1", "2"].includes(params.get("hj")) ? params.get("hj") : String(defaultHalf(data));
  const half = Number(tab);
  const stats = absenceStats(data.absences, half);
  return (
    <section className="flex flex-col gap-4 lg:max-w-exams">
      <NotenHeader backTo={`/noten?hj=${tab}`} eyebrow={t("Noten")} title={t("Fehlzeiten")} />
      <div className="mt-1.5 flex flex-col gap-3">
        <Segmented options={HALVES} value={tab} onChange={(value) => setParams({ hj: value }, { replace: true })} label={t("Halbjahr")} />
        <StandLine data={data} />
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        <AbsenceTile value={stats.days} label={t("Fehltage")} />
        <AbsenceTile value={stats.hours} label={t("Fehlstunden")} />
        <AbsenceTile value={stats.unexcused} label={t("unentschuldigt")} danger />
      </div>
      <div className="mt-2">
        <AbsenceList entries={absenceEntries(data.absences, half)} />
      </div>
    </section>
  );
};

export default Fehlzeiten;
