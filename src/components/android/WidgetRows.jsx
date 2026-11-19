import { useT } from "../../shared/hooks/useT";
import SettingRow from "../more/SettingRow";
import RowSwitch from "../ui/RowSwitch";
import Segmented from "../ui/Segmented";

// Строки настроек виджета: тумблер и «таблетки». Одна строка = одно поле настройки (widgetConfig.js)

export const SwitchRow = ({ label, checked, onToggle }) => {
  const t = useT();
  return (
    <li className="flex">
      <RowSwitch checked={checked} onToggle={onToggle} label={t(label)} className="flex h-14.5 flex-1 items-center justify-between gap-3 text-left">
        <span className="text-row text-ink">{t(label)}</span>
      </RowSwitch>
    </li>
  );
};

// width — ширина переключателя по числу вариантов: на телефоне строка 354px, подпись слева должна остаться
const WIDTH = { 2: "w-44", 3: "w-48", 4: "w-56" };

export const ChoiceRow = ({ label, options, value, onChange }) => (
  <SettingRow label={label}>
    <Segmented label={label} size="form" className={WIDTH[options.length] ?? "w-48"} options={options} value={value} onChange={onChange} />
  </SettingRow>
);
