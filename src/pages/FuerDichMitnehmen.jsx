import { Navigate } from "react-router-dom";
import MitnehmenList from "../components/fuerdich/MitnehmenList";
import PageHeader from "../components/ui/PageHeader";
import { DESKTOP_QUERY, useMediaQuery } from "../shared/hooks/useMediaQuery";
import { useT } from "../shared/hooks/useT";

// ─────────────────────────────────────────────────────────────
// «Mitnehmen» на телефоне (макет 50 handy-14). На ПК список стоит справа на /fuer-dich — туда и ведём
// ─────────────────────────────────────────────────────────────
const FuerDichMitnehmen = () => {
  const t = useT();
  const desktop = useMediaQuery(DESKTOP_QUERY);
  if (desktop) return <Navigate to="/fuer-dich" replace />;
  return (
    <section className="flex flex-col gap-4.5">
      <PageHeader backTo="/fuer-dich" eyebrow={t("Für dich jetzt")} title={t("Mitnehmen")} />
      <MitnehmenList />
    </section>
  );
};

export default FuerDichMitnehmen;
