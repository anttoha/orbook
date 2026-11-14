import { useGlass } from "../../shared/hooks/useGlass";
import { cn } from "../../shared/utils/cn";
import Switch from "./Switch";

// ─────────────────────────────────────────────────────────────
// Строка-переключатель (Sync «Was wird synchronisiert», Mitteilungen): слева текст, справа тумблер.
// Soft и Klar — вся строка одна кнопка (попасть пальцем легче), тумблер в ней — картинка.
// «Glas» (часть 30a): строка обычная, а тумблер — настоящий тумблер библиотеки, его можно тянуть.
// Кнопку в кнопку класть нельзя — поэтому два вида.
// ─────────────────────────────────────────────────────────────
const RowSwitch = ({ checked, onToggle, disabled, label, className, children }) => {
  const glass = useGlass();
  if (glass) {
    return (
      <div className={cn(className, "cursor-default")}>
        {children}
        <Switch checked={checked} onChange={disabled ? undefined : () => onToggle()} label={label} />
      </div>
    );
  }
  return (
    <button type="button" role="switch" aria-checked={checked} disabled={disabled} onClick={onToggle} className={className}>
      {children}
      <Switch checked={checked} />
    </button>
  );
};

export default RowSwitch;
