import { toast } from "sonner";
import { pushErrorText, usePushStore } from "../../shared/store/pushStore";
import { PUSH_PREFS } from "../../shared/utils/push";
import { cn } from "../../shared/utils/cn";
import RowSwitch from "../ui/RowSwitch";
import Liquid from "../ui/Liquid";

// «Benachrichtige mich»: четыре строки, вся строка — переключатель (пальцем легче попасть, чем в тумблер).
// disabled — Mitteilungen на устройстве ещё не включены: видно, что будет, но серым
const PushPrefs = ({ reminderTime = "18:00", disabled = false }) => {
  const prefs = usePushStore((s) => s.prefs);
  const update = usePushStore((s) => s.update);

  const toggle = (key) =>
    update({ prefs: { ...prefs, [key]: !prefs[key] } }).catch((error) => toast.error(pushErrorText(error)));

  return (
    <section className={cn("flex flex-col gap-2.5", disabled && "opacity-55")}>
      <h2 className="text-hint font-extrabold text-faint">Benachrichtige mich</h2>
      <Liquid as="ul" refract press={false} className="overflow-hidden rounded-card bg-card">
        {PUSH_PREFS.map((pref) => {
          const on = Boolean(prefs[pref.key]) && !disabled;
          return (
            <li key={pref.key} className="border-b border-hair last:border-0">
              <RowSwitch
                checked={on}
                disabled={disabled}
                onToggle={() => toggle(pref.key)}
                label={pref.title}
                className="flex min-h-18 w-full items-center gap-3 px-3.5 py-3 text-left outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-accent/50 enabled:active:bg-sand"
              >
                <span className="min-w-0 flex-1">
                  <span className={cn("block text-row", disabled ? "text-faint" : "text-ink")}>{pref.title}</span>
                  <span className="block text-caption text-faint">{typeof pref.hint === "function" ? pref.hint(reminderTime) : pref.hint}</span>
                </span>
              </RowSwitch>
            </li>
          );
        })}
      </Liquid>
    </section>
  );
};

export default PushPrefs;
