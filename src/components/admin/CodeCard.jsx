import { entriesCount, lastUsedText, rightsText } from "../../shared/utils/admin";
import { cn } from "../../shared/utils/cn";
import Switch from "../ui/Switch";
import CodeChip from "./CodeChip";
import CodeMenu from "./CodeMenu";
import ClassTag from "./schools/ClassTag";

// Картка коду на телефоні (макет 41): назва + чип + «⋮», хвіст коду і права, «zuletzt … · N Einträge» і перемикач.
// subjects — предмети вчителя «Mathe, Physik» поруч із чипом (Lehrer-Code, макет handy-10)
const CodeCard = ({ code, today, onToggle, onOpenSheet, subjects }) => (
  <li className={cn("rounded-card bg-card px-3.5 pt-3 pb-3.5", !code.active && "opacity-60")}>
    <div className="flex items-center gap-2">
      <p className="min-w-0 truncate text-subhead font-extrabold text-ink">{code.label}</p>
      <ClassTag code={code} />
      <CodeChip code={code} />
      {subjects && <span className="truncate text-body-sm text-faint">{subjects}</span>}
      <span className="ml-auto">
        <CodeMenu code={code} onOpenSheet={onOpenSheet} />
      </span>
    </div>
    <p className="mt-1 flex items-baseline gap-2">
      <span className="text-cell font-black text-ink">{code.masked}</span>
      <span className="truncate text-body-sm text-muted">{rightsText(code.rights, code.kind)}</span>
    </p>
    <div className="mt-1 flex items-center justify-between gap-3">
      <p className="text-caption text-faint">
        {lastUsedText(code.lastUsedAt, today)} · {entriesCount(code)} Einträge
      </p>
      <Switch checked={code.active} onChange={() => onToggle(code)} label={code.active ? `${code.label} sperren` : `${code.label} entsperren`} />
    </div>
  </li>
);

export default CodeCard;
