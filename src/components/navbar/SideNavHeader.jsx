import { PanelLeft } from "lucide-react";
import { usePlanStore } from "../../shared/store/planStore";
import { cn } from "../../shared/utils/cn";
import Logo from "../ui/Logo";

// Шапка сайдбара: логотип, клас («8A», з сервера), «Demo» і кнопка згорнути/розгорнути
const SideNavHeader = ({ isHidden, onChangeIsHidden }) => {
  const className = usePlanStore((s) => s.me?.className); // клас із GET /api/auth/me
  const demo = usePlanStore((s) => s.meta?.demo); // демо-сервер з вигаданими даними

  return (
    <header className="flex h-[43px] w-full shrink-0 items-center">
      {/* логотип + клас; при згортанні плавно від'їжджають (max-width → 0) */}
      <div
        className={cn(
          "flex min-w-0 items-center gap-2.25 overflow-hidden whitespace-nowrap",
          "transition-[max-width,opacity] duration-300 ease-out",
          isHidden ? "max-w-0 opacity-0" : "max-w-[180px] opacity-100",
        )}
        aria-hidden={isHidden}
      >
        <Logo className="items-center gap-2" titleClassName="text-logo" withIcon />
        {className && <span className="rounded-full bg-sand px-2 py-0.75 text-micro leading-none font-extrabold text-ink uppercase">{className}</span>}
        {demo && <span className="rounded-full bg-tint px-2 py-0.75 text-micro leading-none font-extrabold text-accent-ink uppercase">Demo</span>}
      </div>

      {/* згорнути / розгорнути */}
      <button
        type="button"
        onClick={() => onChangeIsHidden((prev) => !prev)}
        aria-label={isHidden ? "Seitenleiste ausklappen" : "Seitenleiste einklappen"}
        className="ml-auto grid size-[43px] shrink-0 cursor-pointer place-items-center rounded-full text-faint transition-colors hover:bg-sand"
      >
        <PanelLeft className="size-4.5" />
      </button>
    </header>
  );
};

export default SideNavHeader;
