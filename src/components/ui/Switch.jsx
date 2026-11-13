import { useT } from "../../shared/hooks/useT";
import { cn } from "../../shared/utils/cn";

// Перемикач з макета. role="switch": скрінрідер читає «увімкнено / вимкнено».
// Без onChange — лише картинка перемикача (aria-hidden): усередині пункту меню, який сам перемикає (WeekMenu)
const Switch = ({ checked, onChange, label, className }) => {
  const t = useT();
  const look = cn("flex h-6 w-10.5 shrink-0 items-center rounded-full p-0.5 transition-colors duration-200", checked ? "bg-accent" : "bg-switch-off", className);
  // кружечок їде вбік (translate), а не стрибає: 42px − 2×2px відступ − 20px кружечок = 18px
  const thumb = <span className={cn("size-5 rounded-full transition-[translate,background-color] duration-200 ease-out motion-reduce:transition-none", checked ? "translate-x-4.5 bg-switch-thumb" : "translate-x-0 bg-white")} />;

  if (!onChange) return <span aria-hidden="true" className={look}>{thumb}</span>;

  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label && t(label)} onClick={() => onChange(!checked)} className={look}>
      {thumb}
    </button>
  );
};

export default Switch;
