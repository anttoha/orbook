import { PanelLeft } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useClasses } from "../../shared/store/classesStore";
import { usePlanStore } from "../../shared/store/planStore";
import { cn } from "../../shared/utils/cn";
import ClassSwitcher from "../klassen/ClassSwitcher";
import Logo from "../ui/Logo";
import RoundButton from "../ui/RoundButton";

// Шапка сайдбара: логотип, клас («8A», з сервера), «Demo» і кнопка згорнути/розгорнути
const SideNavHeader = ({ isHidden, onChangeIsHidden }) => {
  const className = usePlanStore((s) => s.me?.className); // клас із GET /api/auth/me
  const demo = usePlanStore((s) => s.meta?.demo); // демо-сервер з вигаданими даними
  const hasClasses = useClasses((s) => s.list.length > 0); // частина 29: значок класу — це перемикач
  const onKlassen = useLocation().pathname === "/klassen";

  return (
    <header className="flex h-10.75 w-full shrink-0 items-center">
      {/* логотип + клас; при згортанні плавно від'їжджають (max-width → 0) */}
      <div
        className={cn(
          "flex min-w-0 items-center gap-1.5 overflow-hidden whitespace-nowrap",
          "transition-[max-width,opacity] duration-300 ease-out",
          isHidden ? "max-w-0 opacity-0" : "max-w-45 opacity-100",
        )}
        aria-hidden={isHidden}
      >
        <Logo className="items-center gap-2" titleClassName="text-logo" withIcon />
        {hasClasses ? <ClassSwitcher variant="side" all={onKlassen} /> : className && <span className="rounded-full bg-sand px-2 py-0.75 text-micro leading-none font-extrabold text-ink uppercase">{className}</span>}
        {/* «Demo» поруч не вміщається разом із перемикачем класу (частина 29) — тоді воно в меню класів */}
        {demo && !hasClasses && <span className="rounded-full bg-tint px-2 py-0.75 text-micro leading-none font-extrabold text-accent-ink uppercase">Demo</span>}
      </div>

      {/* згорнути / розгорнути */}
      <RoundButton
        onClick={() => onChangeIsHidden((prev) => !prev)}
        aria-label={isHidden ? "Seitenleiste ausklappen" : "Seitenleiste einklappen"} look="ml-auto grid size-9.5 shrink-0 cursor-pointer place-items-center rounded-full text-faint transition-colors hover:bg-sand">
        <PanelLeft className="size-4.5" />
      </RoundButton>
    </header>
  );
};

export default SideNavHeader;
