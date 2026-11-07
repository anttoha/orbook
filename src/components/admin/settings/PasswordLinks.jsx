import MenuRow from "../../more/MenuRow";
import { KeyIcon, ShieldIcon } from "../../ui/icons";
import SettingsCard from "./SettingsCard";

// «Zugang» у Einstellungen (макет 14c handy-12): Zugangscodes і пароль адміна — на окремих сторінках.
// Пароль класу тепер — рядок «Klassenpasswort» у Zugangscodes
const PasswordLinks = ({ className }) => (
  <SettingsCard title="Zugang" className={className}>
    <ul className="divide-y divide-hair">
      <MenuRow to="/admin/zugang" icon={KeyIcon} label="Zugangscodes" value="verwalten" />
      <MenuRow to="/admin/passwoerter" icon={ShieldIcon} label="Admin-Passwort" value="ändern" />
    </ul>
    <p className="mt-2 mb-2 hidden text-caption text-faint lg:block">Zugangscodes erstellen und sperren, Admin-Passwort ändern.</p>
  </SettingsCard>
);

export default PasswordLinks;
