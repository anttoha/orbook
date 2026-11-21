import { FEED_ITEMS } from "../../shared/utils/calendarFeed";
import { cn } from "../../shared/utils/cn";
import Liquid from "../ui/Liquid";
import RowSwitch from "../ui/RowSwitch";
import { useT } from "../../shared/hooks/useT";

// «Im Kalender»: три строки-переключателя, как «Benachrichtige mich» в Mitteilungen.
// disabled — идёт сохранение: нажатия не принимаем, но и не бледнеем (иначе мигает на каждый клик)
const FeedItems = ({ items, onToggle, disabled = false }) => {
  const t = useT();
  return (
    <section className={cn("flex flex-col gap-2.5", disabled && "pointer-events-none")}>
      <h2 className="text-hint font-extrabold text-faint">{t("Im Kalender")}</h2>
      <Liquid as="ul" refract press={false} className="overflow-hidden rounded-card bg-card">
        {FEED_ITEMS.map((item) => (
          <li key={item.key} className="border-b border-hair last:border-0">
            <RowSwitch
              checked={Boolean(items[item.key])}
              disabled={disabled}
              onToggle={() => onToggle(item.key)}
              label={t(item.title)}
              className="flex min-h-18 w-full items-center gap-3 px-3.5 py-3 text-left outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-accent/50 enabled:active:bg-sand"
            >
              <span className="min-w-0 flex-1">
                <span className="block text-row text-ink">{t(item.title)}</span>
                <span className="block text-caption text-faint">{t(item.hint)}</span>
              </span>
            </RowSwitch>
          </li>
        ))}
      </Liquid>
    </section>
  );
};

export default FeedItems;
