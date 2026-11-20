import { UserRound } from "lucide-react";
import MenuRow from "../../more/MenuRow";
import { KeyIcon, ShieldIcon } from "../../ui/icons";
import SettingsCard from "./SettingsCard";
import { useT } from "../../../shared/hooks/useT";

// «Zugang» у Einstellungen (макет 14c handy-12): Zugangscodes і пароль адміна — на окремих сторінках.
// Пароль класу тепер — рядок «Klassenpasswort» у Zugangscodes
const PasswordLinks = ({ className }) => {
  const t = useT();
  return (
  <SettingsCard title={t("Zugang")} className={className}>
    <ul className="divide-y divide-hair">
      <MenuRow to="/admin/zugang" icon={KeyIcon} label={t("Zugangscodes")} value="verwalten" />
      <MenuRow to="/admin/lehrkraefte" icon={UserRound} label={t("Lehrkräfte")} />
      <MenuRow to="/admin/passwoerter" icon={ShieldIcon} label={t("Admin-Passwort")} value={t("ändern")} />
    </ul>
    <p className="mt-2 mb-2 hidden text-caption text-faint lg:block">{t("Zugangscodes erstellen und sperren, Admin-Passwort ändern.")}</p>
  </SettingsCard>
);
};

export default PasswordLinks;
