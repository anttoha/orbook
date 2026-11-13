// Рядок налаштування: назва (і підказка під нею) ліворуч, перемикач праворуч
import { useT } from "../../shared/hooks/useT";

const SettingRow = ({ label, hint, children }) => {
  const t = useT();
  return (
  <li className="flex h-16.75 items-center justify-between gap-3">
    <div className="min-w-0">
      <p className="text-row text-ink">{t(label)}</p>
      {hint && <p className="mt-0.5 text-caption text-faint">{t(hint)}</p>}
    </div>
    {children}
  </li>
  );
};

export default SettingRow;
