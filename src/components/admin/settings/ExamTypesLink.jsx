import MenuRow from "../../more/MenuRow";
import { FlagIcon } from "../../ui/icons";
import SettingsCard from "./SettingsCard";
import { useT } from "../../../shared/hooks/useT";

// «Tests» в Einstellungen (часть 24): виды записей с Kürzel и авто-перенос — на отдельной странице
const ExamTypesLink = ({ className, count }) => {
  const t = useT();
  return (
  <SettingsCard title={t("Tests")} className={className}>
    <ul className="divide-y divide-hair">
      <MenuRow to="/admin/arten" icon={FlagIcon} label={t("Arten von Tests")} value={count ? t("{count} Arten", { count }) : "bearbeiten"} />
    </ul>
    <p className="mt-2 mb-2 hidden text-caption text-faint lg:block">{t("Klassenarbeit, Leistungskontrolle, Test … und was passiert, wenn eine Stunde ausfällt.")}</p>
  </SettingsCard>
);
};

export default ExamTypesLink;
