import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { DESKTOP_QUERY, useMediaQuery } from "../../shared/hooks/useMediaQuery";
import { useSwipe } from "../../shared/hooks/useSwipe";
import { cn } from "../../shared/utils/cn";
import { MenuPicture, ReminderPicture, TasksPicture, WeekPicture } from "../tips/TipPictures";
import { hasAppNotify } from "../../shared/api/android";
import Button from "../ui/Button";
import { CheckIcon } from "../ui/icons";
import Sheet from "../ui/Sheet";
import { useT } from "../../shared/hooks/useT";
import { translate } from "../../shared/i18n/translate";

// Три подсказки: коротко и по делу. На ПК вместо «lange drücken» — правый клик
const TIPS = [
  { picture: WeekPicture, get title() { return translate("Tippe auf einen Tag"); }, get text() { return translate("Oben die Woche, darunter der Tag. Ausfälle und Vertretungen sind farbig markiert."); } },
  { picture: MenuPicture, get title() { return translate("Stunde lange drücken"); }, get pcTitle() { return translate("Rechtsklick auf eine Stunde"); }, get text() { return translate("Notiz schreiben, Hausaufgabe oder Test eintragen, Fachfarbe ändern."); } },
  { picture: TasksPicture, title: "Aufgaben abhaken", get text() { return translate("Hausaufgaben und eigene Aufgaben in einer Liste. Mit Sync-Code auch auf dem PC."); } },
];

// Часть 31e: в Android-приложении — четвёртый шаг: напоминание перед уроком (по умолчанию выключено) и где его включить
const REMINDER_TIP = { picture: ReminderPicture, get title() { return translate("Erinnerung vor der Stunde"); }, get text() { return translate("Das Handy sagt dir kurz vorher, was kommt und wo – auch ohne Internet."); } };

// ─────────────────────────────────────────────────────────────
// «Kurz erklärt» (макеты 25 handy-13…15, pc-04): один раз после первого входа (useTipsOnStart),
// потом — из Mehr. Адрес: ?sheet=tipps
// ─────────────────────────────────────────────────────────────
const TipsSheet = ({ open, onClose }) => {
  const t = useT();
  const [{ step, back }, setNav] = useState({ step: 0, back: false }); // back — листаем назад: картинка въезжает слева
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const tips = hasAppNotify() ? [...TIPS, REMINDER_TIP] : TIPS;
  const tip = tips[step];
  const last = step === tips.length - 1;
  const goTo = (next) => next >= 0 && next < tips.length && next !== step && setNav({ step: next, back: next < step });
  const swipe = useSwipe({ onLeft: () => goTo(step + 1), onRight: () => goTo(step - 1) }); // на телефоне — листать пальцем
  const close = () => {
    onClose();
    setNav({ step: 0, back: false }); // следующее открытие — снова с первой
  };

  return (
    <Sheet
      open={open}
      onClose={close}
      desktop="dialog"
      eyebrow={t("Kurz erklärt · {1} von {length}", { "1": step + 1, length: tips.length })}
      title={isDesktop && tip.pcTitle ? tip.pcTitle : tip.title}
      footer={
        <>
          {!last && <Button onClick={close}>{t("Überspringen")}</Button>}
          <Button variant="primary" onClick={() => (last ? close() : goTo(step + 1))}>
            {last ? <CheckIcon className="size-4" /> : <ArrowRight className="size-4" />}
            {last ? t("Los geht’s") : t("Weiter")}
          </Button>
        </>
      }
    >
      <p key={`t${step}`} className="-mt-2 text-body-sm leading-5.5 text-muted motion-safe:animate-fade-in">
        {tip.text}
      </p>
      {/* key — новая картинка появляется заново: вперёд — справа, назад — слева */}
      <div key={step} {...swipe} className={cn("touch-pan-y", back ? "motion-safe:animate-page-back" : "motion-safe:animate-page-forward")}>
        <tip.picture />
      </div>
      <Dots count={tips.length} active={step} onPick={goTo} />
      <p className="-mt-2 text-center text-caption text-faint lg:hidden">{t("Wischen geht auch")}</p>
    </Sheet>
  );
};

// Точки шагов; можно нажать и перейти
const Dots = ({ count, active, onPick }) => {
  const t = useT();
  return (
  <div className="flex justify-center gap-1.5" role="tablist" aria-label={t("Tipps")}>
    {Array.from({ length: count }, (_, i) => (
      <button key={i} type="button" role="tab" aria-selected={i === active} aria-label={t("Tipp {1}", { "1": i + 1 })} onClick={() => onPick(i)} className={cn("h-2 rounded-full transition-[width,background-color] duration-300 ease-soft before:absolute before:-inset-3 before:content-[''] relative", i === active ? "w-5.5 bg-accent" : "w-2 bg-faint2")} />
    ))}
  </div>
);
};

export default TipsSheet;
