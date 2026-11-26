import { ChevronRight, Shirt, Snowflake, Sun, Umbrella } from "lucide-react";
import { Link } from "react-router-dom";
import MitnehmenList from "../components/fuerdich/MitnehmenList";
import SettingRow from "../components/more/SettingRow";
import ListCard from "../components/ui/ListCard";
import PageHeader from "../components/ui/PageHeader";
import Stepper from "../components/ui/Stepper";
import Switch from "../components/ui/Switch";
import { useT } from "../shared/hooks/useT";
import { useFuerDichStore } from "../shared/store/fuerDichStore";
import { STEPS, canStep, stepValue, subjectsWithItems } from "../shared/utils/fuerDich";

// Что показывать (порядок как в макете handy-13)
const SHOW = [
  ["wetter", "Wetter"],
  ["mitnehmen", "Was mitnehmen"],
  ["hausaufgaben", "Hausaufgaben"],
  ["tests", "Tests"],
  ["aenderungen", "Änderungen"],
  ["termine", "Termine"],
];

// Советы по погоде: значок, подпись, как писать порог
const TIPS = [
  { key: "regenjacke", icon: Umbrella, label: "Regenjacke", text: (v, t) => t("ab {n} %", { n: v }) },
  { key: "jacke", icon: Shirt, label: "Jacke", text: (v, t) => t("unter {n}°", { n: v }) },
  { key: "muetze", icon: Snowflake, label: "Mütze & Schal", text: (v, t) => t("unter {n}°", { n: v }) },
  { key: "sonnencreme", icon: Sun, label: "Sonnencreme", text: (v, t) => t("UV ab {n}", { n: v }) },
];

// Степпер по списку шагов из fuerDich.js (там же границы и «Aus»)
const StepRow = ({ label, icon: Icon, steps, value, text, onChange }) => (
  <li className="flex h-16.75 items-center justify-between gap-3">
    <span className="flex min-w-0 items-center gap-3 text-row text-ink">
      {Icon && <Icon aria-hidden="true" className="size-5 shrink-0 text-muted" strokeWidth={1.9} />}
      <span className="truncate">{label}</span>
    </span>
    <Stepper value={text} label={label} canDown={canStep(steps, value, -1)} canUp={canStep(steps, value, 1)} onStep={(dir) => onChange(stepValue(steps, value, dir))} />
  </li>
);

// ─────────────────────────────────────────────────────────────
// «Für dich jetzt» — настройки (часть 50b, макеты handy-13 и pc-03): одни для блока на Start и виджета.
// Всё действует сразу. ПК — две колонки: справа «Mitnehmen pro Fach»
// ─────────────────────────────────────────────────────────────
const FuerDich = () => {
  const t = useT();
  const s = useFuerDichStore((state) => state.settings);
  const { update, setShow, setTip } = useFuerDichStore.getState();
  const fachCount = subjectsWithItems(s.items);

  return (
    <section className="flex flex-col gap-4.5 lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8">
      <div className="flex flex-col gap-4.5 lg:col-span-2">
        <PageHeader backTo="/start" eyebrow={t("Start · Widget")} title={t("Für dich jetzt")} />
      </div>

      <div className="flex flex-col gap-4.5">
        <ListCard title={t("Losgehen")}>
          <StepRow label={t("Vor der 1. Stunde")} steps={STEPS.leaveMinutes} value={s.leaveMinutes} text={`${s.leaveMinutes} min`} onChange={(v) => update({ leaveMinutes: v })} />
          <StepRow label={t("Abends schon morgen")} steps={STEPS.eveningFrom} value={s.eveningFrom} text={t("ab {time}", { time: s.eveningFrom })} onChange={(v) => update({ eveningFrom: v })} />
        </ListCard>

        <ListCard title={t("Zeigen")}>
          {SHOW.map(([key, label]) => (
            <SettingRow key={key} label={t(label)}>
              <Switch label={t(label)} checked={s.show[key]} onChange={(on) => setShow(key, on)} />
            </SettingRow>
          ))}
          <SettingRow label={t("Nur meine Kurse")}>
            <Switch label={t("Nur meine Kurse")} checked={s.onlyMine} onChange={(on) => update({ onlyMine: on })} />
          </SettingRow>
        </ListCard>

        <ListCard title={t("Wetter-Tipps")}>
          {TIPS.map((tip) => {
            const value = s.tips[tip.key];
            return <StepRow key={tip.key} label={t(tip.label)} icon={tip.icon} steps={STEPS[tip.key]} value={value} text={value == null ? t("Aus") : tip.text(value, t)} onChange={(v) => setTip(tip.key, v)} />;
          })}
        </ListCard>

        <ListCard title={t("Mitnehmen")}>
          {/* на ПК список предметов справа — строка-переход только на телефоне */}
          <li className="flex lg:hidden">
            <Link to="/fuer-dich/mitnehmen" className="-mx-2 flex h-16.75 min-w-0 flex-1 items-center gap-3 rounded-field px-2 hover:bg-paper">
              <span className="flex-1 text-row text-ink">{t("Pro Fach")}</span>
              <span className="text-label text-faint">{fachCount === 1 ? t("1 Fach") : t("{n} Fächer", { n: fachCount })}</span>
              <ChevronRight className="size-4 shrink-0 text-faint2" />
            </Link>
          </li>
          <SettingRow label={t("Am Testtag erinnern")}>
            <Switch label={t("Am Testtag erinnern")} checked={s.testReminder} onChange={(on) => update({ testReminder: on })} />
          </SettingRow>
        </ListCard>
      </div>

      <div className="hidden flex-col gap-2.5 lg:flex">
        <h2 className="text-hint font-extrabold text-faint">{t("Mitnehmen pro Fach")}</h2>
        <MitnehmenList />
      </div>
    </section>
  );
};

export default FuerDich;
