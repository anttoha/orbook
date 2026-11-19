import { useT } from "../../shared/hooks/useT";
import SettingRow from "../more/SettingRow";
import ListCard from "../ui/ListCard";
import SelectPill from "../ui/SelectPill";
import { ChoiceRow } from "./WidgetRows";

const REFRESH = [{ value: 15, label: "15 min" }, { value: 30, label: "30 min" }, { value: 60, label: "1 h" }];
// «Passend» — куда ведёт вид сам: Jetzt/Heute/Änderungen — день, Woche — неделя, остальное — Tests или Start
const OPEN = [
  { value: "auto", label: "Passend" },
  { value: "tag", label: "Tag" },
  { value: "woche", label: "Woche" },
  { value: "tests", label: "Tests" },
  { value: "start", label: "Start" },
];

// «Verhalten»: как часто спрашивать сервер и что открыть по нажатию на виджет
const WidgetBehaviour = ({ draft, change }) => {
  const t = useT();
  return (
    <ListCard title="Verhalten">
      <ChoiceRow label="Aktualisieren" options={REFRESH} value={draft.refresh} onChange={(refresh) => change({ refresh })} />
      <SettingRow label="Beim Tippen öffnen">
        <SelectPill label={t("Beim Tippen öffnen")} value={draft.open} options={OPEN.map((o) => ({ value: o.value, label: t(o.label) }))} onChange={(open) => change({ open })} />
      </SettingRow>
    </ListCard>
  );
};

export default WidgetBehaviour;
