import { devicesText, validTail } from "../../../shared/utils/accessCodes";
import { classPasswordText, lastUsedText } from "../../../shared/utils/admin";
import { shortDate } from "../../../shared/utils/format";
import Badge from "../../ui/Badge";
import AccessCard from "./AccessCard";
import { CodeChips } from "./AccessChips";

// Рядок «Klassenpasswort · ALT» — старий спільний пароль, завжди останній (макет handy-01)
export const PasswordCard = ({ password, today, onToggle, onMenu }) => {
  const since = classPasswordText(password.changedAt, today)?.since?.replace("Seit", "seit"); // дата невідома — без неї
  return (
    <AccessCard
      title="Klassenpasswort"
      chips={<Badge variant="soft">Alt</Badge>}
      mask="••••••"
      detail={since ? `gemeinsames Passwort · ${since}` : "gemeinsames Passwort"}
      footer={`${lastUsedText(password.lastUsedAt, today)} · ohne Ablauf`}
      active={password.enabled}
      switchLabel={password.enabled ? "Klassenpasswort ausschalten" : "Klassenpasswort einschalten"}
      onToggle={onToggle}
      onMenu={onMenu}
    />
  );
};

// Список на телефоні: картки кодів, а під ними — Klassenpasswort
const AccessList = ({ codes, password, today, onToggle, onMenu, onPasswordToggle, onPasswordMenu }) => (
  <ul className="flex flex-col gap-2.5">
    {codes.map((code) => (
      <AccessCard
        key={code.id}
        title={code.label}
        chips={<CodeChips code={code} />}
        mask={code.masked}
        detail={devicesText(code.devices, code.maxDevices)}
        footer={`${lastUsedText(code.lastUsedAt, today)} · ${validTail(code, shortDate)}`}
        active={code.active}
        switchLabel={code.active ? `${code.label} sperren` : `${code.label} entsperren`}
        onToggle={() => onToggle(code)}
        onMenu={() => onMenu(code)}
      />
    ))}
    {password && <PasswordCard password={password} today={today} onToggle={onPasswordToggle} onMenu={onPasswordMenu} />}
  </ul>
);

export default AccessList;
