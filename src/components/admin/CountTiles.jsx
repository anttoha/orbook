import Liquid from "../ui/Liquid";
import { useT } from "../../shared/hooks/useT";
// Три плитки з числами (макети 40 і 42): Klausuren kommend, Editor-Codes aktiv, Sync-Codes.
// «Sync-Codes» — кількість зашифрованих блоків нотаток: сервер їх не читає і показати нічого не може
const CountTiles = ({ counts }) => {
  const t = useT();
  return (
  <>
    {[
      [counts.examsUpcoming, t("Tests kommend")],
      [counts.editorCodesActive, t("Editor-Codes aktiv")],
      [counts.syncBlocks, t("Sync-Codes")],
    ].map(([value, label]) => (
      <Liquid as="div" refract press={false} key={label} className="rounded-card bg-card px-3.5 pt-2.5 pb-3.5">
        <p className="text-stat text-ink">{value}</p>
        <p className="mt-1 text-label leading-4.5 text-muted">{label}</p>
      </Liquid>
    ))}
  </>
);
};

export default CountTiles;
