import { useT } from "../../shared/hooks/useT";
import { translate } from "../../shared/i18n/translate";
import { cn } from "../../shared/utils/cn";
import { noteNumber } from "../../shared/utils/noten";

// Цвета статуса цели — те же, что у плашек оценок: зелёный, песочный, красный
const TONES = { erreichbar: "bg-ok-tint text-ok", knapp: "bg-sand text-ink", schwer: "bg-danger-tint text-danger" };

// «knapp» — насколько реальна цель (часть 42). status = null — ничего
export const ZielStatus = ({ status, className }) => {
  const t = useT();
  if (!status) return null;
  return <span className={cn("shrink-0 rounded-full px-2.5 py-0.5 text-caption font-extrabold", TONES[status], className)}>{t(status)}</span>;
};

// «Ziel 2,0» цветом статуса — в строке предмета в «Noten»
export const ZielChip = ({ info }) => (
  <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-small font-extrabold", TONES[info.status] ?? "bg-sand text-muted")}>
    {translate("Ziel {note}", { note: noteNumber(info.ziel) })}
  </span>
);
