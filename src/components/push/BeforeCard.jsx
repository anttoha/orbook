import { usePushStore } from "../../shared/store/pushStore";
import { BEFORE_MINUTES } from "../../shared/utils/appNotify";
import { cn } from "../../shared/utils/cn";
import { useT } from "../../shared/hooks/useT";
import Liquid from "../ui/Liquid";
import RowSwitch from "../ui/RowSwitch";
import Segmented from "../ui/Segmented";

const MINUTES = BEFORE_MINUTES.map((m) => ({ value: m, label: `${m} min` }));

// «Vor der Stunde» (часть 31e, только в Android-приложении): напоминание о следующем уроке с кабинетом.
// Будильник ставит само приложение по сохранённому плану — поэтому работает и без интернета. По умолчанию выключено
const BeforeCard = ({ disabled = false }) => {
  const t = useT();
  const before = usePushStore((s) => s.before);
  const update = usePushStore((s) => s.update);
  const on = before.on && !disabled;
  const change = (patch) => update({ before: { ...before, ...patch } });

  return (
    <section className={cn("flex flex-col gap-2.5", disabled && "opacity-55")}>
      <h2 className="text-hint font-extrabold text-faint">{t("Vor der Stunde")}</h2>
      <Liquid as="ul" refract press={false} className="overflow-hidden rounded-card bg-card">
        <li className="border-b border-hair last:border-0">
          <RowSwitch
            checked={on}
            disabled={disabled}
            onToggle={() => change({ on: !before.on })}
            label={t("Erinnerung vor jeder Stunde")}
            className="flex min-h-18 w-full items-center gap-3 px-3.5 py-3 text-left outline-none enabled:active:bg-sand"
          >
            <span className="min-w-0 flex-1">
              <span className={cn("block text-row", disabled ? "text-faint" : "text-ink")}>{t("Erinnerung vor jeder Stunde")}</span>
              <span className="block text-caption text-faint">{t("Fach und Raum · geht auch offline")}</span>
            </span>
          </RowSwitch>
        </li>
        {on && (
          <li className="flex items-center justify-between gap-3 px-3.5 py-3">
            <span className="text-row text-ink">{t("Wie früh")}</span>
            <Segmented label="Wie früh" size="form" className="w-48" options={MINUTES} value={before.minutes} onChange={(minutes) => change({ minutes })} />
          </li>
        )}
      </Liquid>
    </section>
  );
};

export default BeforeCard;
