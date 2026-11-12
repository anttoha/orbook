import { toast } from "sonner";
import { useSheet } from "../../shared/hooks/useSheet";
import { pushErrorText, usePushStore } from "../../shared/store/pushStore";
import { cn } from "../../shared/utils/cn";
import Switch from "../ui/Switch";

// «Ruhe»: переключатель Ruhezeit; нажатие на текст открывает шторку со временем (?sheet=ruhezeit)
const QuietCard = ({ disabled = false }) => {
  const quiet = usePushStore((s) => s.quiet);
  const update = usePushStore((s) => s.update);
  const { openSheet } = useSheet();

  const toggle = () => update({ quiet: { ...quiet, on: !quiet.on } }).catch((error) => toast.error(pushErrorText(error)));

  return (
    <section className={cn("flex flex-col gap-2.5", disabled && "pointer-events-none opacity-55")} aria-disabled={disabled || undefined}>
      <h2 className="text-hint font-extrabold text-faint">Ruhe</h2>
      <div className="flex items-center gap-3 rounded-card bg-card px-3.5 py-3">
        <button type="button" onClick={() => openSheet("ruhezeit")} className="min-h-12 min-w-0 flex-1 text-left">
          <span className="block text-row text-ink">Ruhezeit</span>
          <span className="block text-caption text-faint">
            {quiet.on ? (
              <>
                Zwischen <b className="font-bold text-accent-ink">{quiet.start}</b> und <b className="font-bold text-accent-ink">{quiet.end}</b> still
              </>
            ) : (
              "Aus – Mitteilungen kommen immer"
            )}
          </span>
        </button>
        <Switch checked={quiet.on && !disabled} onChange={toggle} label="Ruhezeit" />
      </div>
    </section>
  );
};

export default QuietCard;
