import MenuRow from "../../more/MenuRow";
import { FlagIcon } from "../../ui/icons";
import SettingsCard from "./SettingsCard";

// «Tests» в Einstellungen (часть 24): виды записей с Kürzel и авто-перенос — на отдельной странице
const ExamTypesLink = ({ className, count }) => (
  <SettingsCard title="Tests" className={className}>
    <ul className="divide-y divide-hair">
      <MenuRow to="/admin/arten" icon={FlagIcon} label="Arten von Tests" value={count ? `${count} Arten` : "bearbeiten"} />
    </ul>
    <p className="mt-2 mb-2 hidden text-caption text-faint lg:block">Klassenarbeit, Leistungskontrolle, Test … und was passiert, wenn eine Stunde ausfällt.</p>
  </SettingsCard>
);

export default ExamTypesLink;
