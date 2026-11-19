import { useT } from "../../shared/hooks/useT";
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

// Подпись сверху, переключатель под ней на всю ширину: на узком телефоне и с длинными переводами
// («Як у застосунку», «+ Lehrkraft») варианты справа от подписи наезжали друг на друга
export const ChoiceRow = ({ label, options, value, onChange }) => {
  const t = useT();
  return (
    <li className="flex flex-col gap-2.5 py-3.5">
      <p className="text-row text-ink">{t(label)}</p>
      <Segmented label={label} size="form" className="w-full" options={options} value={value} onChange={onChange} />
    </li>
  );
};
