import { Bell, BookOpen, ChevronRight, Clock, FileText, Monitor, Palette, Pointer, Smartphone, UserRound } from "lucide-react";
import { useUserStore } from "../../shared/store/userStore";
import { cn } from "../../shared/utils/cn";
import { fachClasses } from "../../shared/utils/lessons";
import { CheckIcon, FlagIcon, SyncIcon } from "../ui/icons";
import Liquid from "../ui/Liquid";
import OrbitMark from "../ui/OrbitMark";
import Switch from "../ui/Switch";
import { useT } from "../../shared/hooks/useT";
import { translate } from "../../shared/i18n/translate";

// Картинки к «Kurz erklärt» (макеты 25 handy-13…15): не скриншоты, а простые схемы из тех же токенов

const frame = "relative flex h-60 flex-col justify-center overflow-hidden rounded-card bg-sand px-5";
const Tap = ({ className }) => (
  <span className={cn("absolute grid size-11 place-items-center rounded-full bg-accent/20 text-ink motion-safe:animate-pulse", className)}>
    <Pointer className="size-6 fill-card" />
  </span>
);

const WEEK = [["De", "Ma", "En", "Ph"], ["Ma", "Ge", "De", "Sp"], ["En", "Ma", "Ph", "Ku"], ["De", "Bio", "Ma", "En"], ["Ge", "De", "Sp", "Ma"]];
const DAYS = ["Mo", "Di", "Mi", "Do", "Fr"];

// 1 — неделя, выбранный день в рамке, один урок выпал
export const WeekPicture = () => {
  const overrides = useUserStore((s) => s.colorOverrides);
  return (
    <div className={frame}>
      <div className="grid grid-cols-5 gap-1.5">
        {WEEK.map((codes, col) => (
          <div key={DAYS[col]} className={cn("flex flex-col gap-1.5 rounded-tile p-0.5", col === 2 && "ring-2 ring-accent")}>
            <span className={cn("text-center text-micro font-extrabold uppercase", col === 2 ? "text-accent-ink" : "text-faint")}>{DAYS[col]}</span>
            {codes.map((code, row) => {
              const gone = col === 1 && row === 2;
              return (
                <span key={row} className={cn("h-8 rounded-tile px-1.5 pt-1.5 text-note font-extrabold", gone ? "bg-card text-faint line-through" : fachClasses(code, overrides))}>
                  {code}
                </span>
              );
            })}
          </div>
        ))}
      </div>
      <Tap className="top-28 left-1/2" />
    </div>
  );
};

const MENU = [
  { icon: FileText, get text() { return translate("Notiz zur Stunde"); } },
  { icon: BookOpen, get text() { return translate("Hausaufgabe geben"); }, accent: true },
  { icon: FlagIcon, get text() { return translate("Test eintragen"); }, accent: true },
  { icon: Palette, get text() { return translate("Fachfarbe ändern"); } },
];

// 2 — урок и его меню
export const MenuPicture = () => {
  const t = useT();
  const overrides = useUserStore((s) => s.colorOverrides);
  return (
    <div className={cn(frame, "justify-start pt-5")}>
      <div className={cn("rounded-field px-3.5 py-2.5", fachClasses("Ma", overrides))}>
        <p className="text-caption font-bold opacity-80">{t("2. Stunde")}</p>
        <p className="text-row font-extrabold">{t("Mathe")}</p>
      </div>
      <Liquid as="ul" refract press={false} className="mt-2.5 ml-10 rounded-field bg-card p-1.5 shadow-menu">
        {MENU.map((item) => (
          <li key={item.text} className={cn("flex items-center gap-2.5 px-2.5 py-1.75 text-label", item.accent ? "font-bold text-accent-ink" : "text-ink")}>
            <item.icon className={cn("size-4 shrink-0", item.accent ? "text-accent-ink" : "text-muted")} /> {item.text}
          </li>
        ))}
      </Liquid>
      <Tap className="top-6 right-8" />
    </div>
  );
};

const TASKS = [
  { code: "Ma", text: "Buch S. 54, Nr. 3", done: true },
  { code: "En", text: "Workbook p. 23" },
  { code: null, text: "Sportsachen" },
];

// 3 — задачи с кружками и «per Sync-Code»
export const TasksPicture = () => {
  const t = useT();
  const overrides = useUserStore((s) => s.colorOverrides);
  return (
    <div className={cn(frame, "gap-2")}>
      {TASKS.map((task) => (
        <Liquid as="div" refract press={false} key={task.text} className="flex items-center gap-3 rounded-field bg-card px-2.5 py-2">
          <span className={cn("grid size-8 shrink-0 place-items-center rounded-tile text-note font-black", task.code ? fachClasses(task.code, overrides) : "bg-sand text-muted")}>
            {task.code ?? <UserRound className="size-4" />}
          </span>
          <span className={cn("flex-1 text-row font-extrabold", task.done ? "text-faint line-through" : "text-ink")}>{task.text}</span>
          <span className={cn("grid size-6.5 place-items-center rounded-full", task.done ? "bg-accent text-on-accent" : "border-2 border-faint2")}>{task.done && <CheckIcon className="size-3.5" />}</span>
        </Liquid>
      ))}
      <p className="mt-1 flex items-center justify-center gap-1.5 text-label font-bold text-accent-ink">
        <Smartphone className="size-4" /> <SyncIcon className="size-4" /> <Monitor className="size-4" /> {t("per Sync-Code")}
      </p>
    </div>
  );
};


// 4 (часть 31e, только в Android-приложении) — напоминание перед уроком и где его включить (макет 31e handy-05)
export const ReminderPicture = () => {
  const t = useT();
  const chip = "flex items-center gap-1.5 rounded-full bg-card px-3 py-2 text-label font-extrabold text-ink";
  return (
    <div className={cn(frame, "gap-4")}>
      <Liquid as="div" refract press={false} className="flex items-center gap-3 rounded-field bg-card px-3 py-3 shadow-menu">
        <OrbitMark className="size-9 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="flex justify-between text-label font-extrabold text-ink">
            ORBook <span className="font-normal text-faint">08:20</span>
          </p>
          <p className="truncate text-body-sm text-ink">{t("In 10 min: Physik · Raum 301")}</p>
        </div>
      </Liquid>
      <div className="flex flex-col items-center gap-2">
        <p className="text-label font-bold text-muted">{t("Einschalten unter")}</p>
        <p className="flex flex-wrap items-center justify-center gap-1 text-faint">
          <span className={chip}>{t("Mehr")}</span>
          <ChevronRight className="size-4" />
          <span className={chip}>
            <Bell className="size-3.5 text-accent-ink" /> {t("Mitteilungen")}
          </span>
          <ChevronRight className="size-4" />
          <span className={cn(chip, "bg-tint text-accent-ink")}>
            <Clock className="size-3.5" /> {t("Vor der Stunde")}
          </span>
        </p>
      </div>
      <Liquid as="div" refract press={false} className="flex items-center justify-between gap-3 rounded-field bg-card px-3.5 py-3">
        <span className="text-body-sm text-ink">{t("Erinnerung vor jeder Stunde")}</span>
        <Switch checked />
      </Liquid>
    </div>
  );
};
