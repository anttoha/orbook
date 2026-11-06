import { useNow } from "../../../shared/hooks/useNow";
import { classPasswordText } from "../../../shared/utils/admin";
import MenuRow from "../../more/MenuRow";
import { LockIcon, ShieldIcon } from "../../ui/icons";
import SettingsCard from "./SettingsCard";

// «Passwörter» у Einstellungen (макети 14b handy-07, pc-06): самі паролі змінюються на окремій сторінці
const PasswordLinks = ({ changedAt, className }) => {
  const { today } = useNow();
  const since = classPasswordText(changedAt, today)?.since; // null — дата невідома, без підпису
  return (
    <SettingsCard title="Passwörter" className={className}>
      <ul className="divide-y divide-hair">
        <MenuRow to="/admin/passwoerter" icon={LockIcon} label="Klassenpasswort" value={since?.replace("Seit", "seit")} />
        <MenuRow to="/admin/passwoerter" icon={ShieldIcon} label="Admin-Passwort" value="ändern" />
      </ul>
      <p className="mt-2 mb-2 hidden text-caption text-faint lg:block">Klassenpasswort ändern oder erzeugen, Admin-Passwort ändern.</p>
    </SettingsCard>
  );
};

export default PasswordLinks;
