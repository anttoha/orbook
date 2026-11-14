import { minutesOptions, tomorrowHint } from "../../../shared/utils/channels";
import { cn } from "../../../shared/utils/cn";
import SelectPill from "../../ui/SelectPill";
import Switch from "../../ui/Switch";
import OptionRow from "../settings/OptionRow";
import Liquid from "../../ui/Liquid";

// Что слать в группу (макет 27 handy-01): три переключателя и «через сколько минут»
const ROWS = [
  { key: "plan", label: "Neuer Plan", hint: "Sofort, nur die Änderungen" },
  { key: "tomorrow", label: "Für morgen", hint: "Tests, Aufgaben, erste Stunde" },
  { key: "exam", label: "Neuer Test eingetragen", hint: "Sobald er eingetragen ist" },
];

// dim — группа ещё не подключена: видно, что будет приходить, но серым
const ChannelOptions = ({ values, tomorrowAt, onChange, dim = false }) => (
  <section className={cn("flex flex-col gap-2.5", dim && "pointer-events-none opacity-55")} aria-disabled={dim || undefined}>
    <h2 className="text-hint font-extrabold text-faint">Was wird gesendet</h2>
    <Liquid as="div" refract press={false} className="divide-y divide-hair rounded-card bg-card px-3.5">
      {ROWS.map((row) => (
        <OptionRow key={row.key} label={row.label} hint={row.hint}>
          <Switch checked={!dim && Boolean(values[row.key])} onChange={(on) => onChange(row.key, on)} label={row.label} />
        </OptionRow>
      ))}
      <OptionRow label="„Für morgen“ nach Schulschluss" hint={tomorrowHint(tomorrowAt)}>
        <SelectPill value={values.minutesAfter} options={minutesOptions} onChange={(m) => onChange("minutesAfter", m)} label="Minuten nach der letzten Stunde" />
      </OptionRow>
    </Liquid>
  </section>
);

export default ChannelOptions;
