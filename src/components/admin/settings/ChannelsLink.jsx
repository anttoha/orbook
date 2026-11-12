import { Megaphone } from "lucide-react";
import MenuRow from "../../more/MenuRow";
import SettingsCard from "./SettingsCard";

// «Kanäle» в Einstellungen (часть 27): Telegram-группа класса — на отдельной странице
const ChannelsLink = ({ className }) => (
  <SettingsCard title="Kanäle" className={className}>
    <ul className="divide-y divide-hair">
      <MenuRow to="/admin/kanaele" icon={Megaphone} label="Kanäle" value="Telegram" />
    </ul>
    <p className="mt-2 mb-2 hidden text-caption text-faint lg:block">Neuer Plan und „Für morgen“ in die Gruppe der Klasse.</p>
  </SettingsCard>
);

export default ChannelsLink;
