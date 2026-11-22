import { useState } from "react";
import { useT } from "../../shared/hooks/useT";
import { translate } from "../../shared/i18n/translate";
import { useLerntimerStore } from "../../shared/store/lerntimerStore";
import { LIMITS, stepValue, timesOf } from "../../shared/utils/lerntimer";
import Button from "../ui/Button";
import { CheckIcon } from "../ui/icons";
import Liquid from "../ui/Liquid";
import RowSwitch from "../ui/RowSwitch";
import Sheet from "../ui/Sheet";
import Stepper from "../ui/Stepper";

const TIMES = [
  { key: "focus", get label() { return translate("Lernen"); }, unit: "min" },
  { key: "pause", get label() { return translate("Pause"); }, unit: "min" },
  { key: "long", get label() { return translate("Lange Pause"); }, unit: "min" },
  { key: "rounds", get label() { return translate("Runden"); }, unit: "" },
];
const SWITCHES = [
  { key: "sound", get label() { return translate("Ton"); } },
  { key: "vibrate", get label() { return translate("Vibration"); } },
  { key: "autoPause", get label() { return translate("Pause von selbst starten"); } },
];

const ROW = "flex h-14 w-full items-center justify-between gap-3 border-b border-hair px-4 text-left last:border-0";

// ─────────────────────────────────────────────────────────────
// Шторка «Einstellungen» (макет 44 handy-07): свои минуты и раунды, Ton, Vibration, «Pause von selbst starten».
// Меняем черновик, «Speichern» — в store. Минуты поменяли (или открыли через «Eigene») — режим становится «Eigene»
// ─────────────────────────────────────────────────────────────
const SettingsSheet = ({ open, onClose, custom }) => {
  const t = useT();
  const settings = useLerntimerStore((s) => s.settings);
  const [draft, setDraft] = useState(() => ({ ...settings, ...timesOf(settings) }));
  const times = timesOf(settings);
  const changedTimes = TIMES.some(({ key }) => draft[key] !== times[key]);

  const save = () => {
    useLerntimerStore.getState().setSettings({ ...draft, preset: custom || changedTimes ? "eigene" : settings.preset });
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} desktop="dialog" eyebrow={t("Lerntimer")} title={t("Einstellungen")} footer={<Button variant="primary" onClick={save}><CheckIcon className="size-4" /> {t("Speichern")}</Button>}>
      <div className="flex flex-col gap-5">
        <Liquid as="ul" refract press={false} className="overflow-hidden rounded-card bg-card">
          {TIMES.map(({ key, label, unit }) => {
            const [lo, hi] = LIMITS[key];
            return (
              <li key={key} className={ROW}>
                <span className="text-row font-bold text-ink">{label}</span>
                <Stepper value={unit ? `${draft[key]} ${unit}` : draft[key]} label={label} canDown={draft[key] > lo} canUp={draft[key] < hi} onStep={(dir) => setDraft({ ...draft, [key]: stepValue(key, draft[key], dir) })} />
              </li>
            );
          })}
        </Liquid>
        <section className="flex flex-col gap-3">
          <h2 className="text-hint font-extrabold text-faint">{t("Am Ende")}</h2>
          <Liquid as="ul" refract press={false} className="overflow-hidden rounded-card bg-card">
            {SWITCHES.map(({ key, label }) => (
              <li key={key} className="border-b border-hair last:border-0">
                <RowSwitch checked={Boolean(draft[key])} onToggle={() => setDraft({ ...draft, [key]: !draft[key] })} label={label} className={`${ROW} outline-none focus-visible:ring-2 focus-visible:ring-accent/50 active:bg-sand`}>
                  <span className="text-row font-bold text-ink">{label}</span>
                </RowSwitch>
              </li>
            ))}
          </Liquid>
        </section>
      </div>
    </Sheet>
  );
};

export default SettingsSheet;
