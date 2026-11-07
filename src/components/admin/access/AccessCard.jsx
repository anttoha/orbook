import { cn } from "../../../shared/utils/cn";
import Switch from "../../ui/Switch";
import CodeMenu from "../CodeMenu";

// Картка на телефоні (макет 14c handy-01) — як картка Editor-Code (макет 41):
// назва + чипи + «⋮», хвіст коду і пристрої, «zuletzt … · bis …» і перемикач.
// Однакова для коду і для рядка «Klassenpasswort» — різні лише тексти
const AccessCard = ({ title, chips, mask, detail, footer, active, switchLabel, onToggle, onMenu }) => (
  <li className={cn("rounded-card bg-card px-3.5 pt-3 pb-3.5", !active && "opacity-60")}>
    <div className="flex items-center gap-2">
      <p className="min-w-0 truncate text-subhead font-extrabold text-ink">{title}</p>
      {chips}
      <span className="ml-auto">
        <CodeMenu code={{ label: title }} onOpenSheet={onMenu} />
      </span>
    </div>
    <p className="mt-1 flex items-baseline gap-2.5">
      <span className="shrink-0 text-cell font-black text-ink">{mask}</span>
      <span className="truncate text-body-sm text-muted">{detail}</span>
    </p>
    <div className="mt-1 flex items-center justify-between gap-3">
      <p className="truncate text-caption text-faint">{footer}</p>
      <Switch checked={active} onChange={onToggle} label={switchLabel} />
    </div>
  </li>
);

export default AccessCard;
