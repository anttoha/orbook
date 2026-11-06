import { KeyIcon, FlagIcon, LockIcon, RenewIcon, ShieldIcon, WarningIcon } from "../ui/icons";
import { Settings } from "lucide-react";
import { cn } from "../../shared/utils/cn";

// Іконка запису за видом (kind); помилка — червоний трикутник
const ICONS = { exam: FlagIcon, plan: RenewIcon, code: KeyIcon, security: LockIcon, settings: Settings, system: ShieldIcon };

const EventIcon = ({ event, className }) => {
  if (event.level === "err" || event.kind === "error") return <WarningIcon className={cn("text-danger", className)} />;
  const Icon = ICONS[event.kind] ?? ShieldIcon;
  return <Icon className={cn("text-muted", className)} />;
};

export default EventIcon;
