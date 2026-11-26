import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronUp } from "lucide-react";
import { GlassNav } from "@zakisheriff/liquid-glass";
import { useGlass } from "../../shared/hooks/useGlass";
import { useGroupPress } from "../../shared/hooks/useGroupPress";
import { useNavFlash } from "../../shared/store/navFlashStore";
import { useT } from "../../shared/hooks/useT";
import { cn } from "../../shared/utils/cn";
import { isTabActive } from "../../shared/utils/isTabActive";
import GroupMenu from "./GroupMenu";
import NavFlash from "./NavFlash";

// ─────────────────────────────────────────────────────────────
// Нижнє меню телефона (< 1024px): «пігулка» з іконками, у вибраного пункту ще й підпис.
// tabs — [{ to, label, short?, icon, exact?, active? }]; short — коротший підпис («Codes» замість «Editor-Codes»);
// active — уже пораховано (застосунок класу), інакше рахуємо за адресою (адмінка).
// Вкладка-група (частина 35): { id, label, icon, items: [{ to, label, icon, active, count }], active, current } —
// натиснув — над нею меню (GroupMenu), або затиснув і повів палець угору. look — вигляд меню: "kompakt" | "gross".
// Спільне для застосунку класу (BottomNav) і адмінки (AdminShell).
// device — "phone" у застосунку класу: тоді вкладка (за tab.key / tab.id) коротко світиться після правки «Untere Leiste» (частина 38).
// ─────────────────────────────────────────────────────────────
const tabKey = (tab) => tab.id ?? tab.to;

const TabBar = ({ tabs, look = "kompakt", device = null }) => {
  const { pathname } = useLocation();
  const glass = useGlass();
  const [openId, setOpenId] = useState(null); // відкрите меню групи
  const bar = useRef(null);
  const activeOf = (tab) => tab.active ?? isTabActive(tab, pathname);

  // Відкрите меню закривається натисканням поза панеллю і клавішею Esc
  useEffect(() => {
    if (!openId) return;
    const outside = (event) => !bar.current?.contains(event.target) && setOpenId(null);
    const esc = (event) => event.key === "Escape" && setOpenId(null);
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", esc);
    };
  }, [openId]);

  if (glass) return <GlassBar tabs={tabs} look={look} activeOf={activeOf} openId={openId} setOpenId={setOpenId} bar={bar} />;

  return (
    // Открытое меню группы — над подсказкой «прокрути вниз» (PageScrollHint, z-30)
    <div className={cn("pointer-events-none fixed inset-x-0 bottom-0 bg-linear-to-t from-paper to-transparent pt-10 pb-5.5 lg:hidden print:hidden", openId ? "z-40" : "z-10")}>
      <div className="px-4">
        <nav ref={bar} className="pointer-events-auto flex h-14.5 rounded-full border border-hair bg-card p-1.75">
          {tabs.map((tab, index) =>
            tab.items ? (
              <GroupTab key={tabKey(tab)} tab={tab} look={look} device={device} first={index === 0} open={openId === tab.id} setOpen={(on) => setOpenId(on ? tab.id : null)} />
            ) : (
              <LinkTab key={tabKey(tab)} tab={tab} device={device} active={activeOf(tab)} />
            ),
          )}
        </nav>
      </div>
    </div>
  );
};

// Клас «пігулки» вкладки: вибрана ширша, з акцентним фоном; у групи з відкритим меню — світлий фон
const pillClass = (active, pressed) =>
  cn(
    "relative flex h-full min-w-0 basis-0 items-center justify-center rounded-full",
    "transition-[flex-grow,background-color,color] duration-300 ease-out motion-reduce:transition-none",
    active ? "grow-[1.4] bg-accent text-on-accent" : pressed ? "grow bg-tint text-accent-ink" : "grow text-faint",
  );

// Підпис з'являється тільки у вибраної вкладки
const TabLabel = ({ active, children }) => (
  <span
    className={cn(
      "overflow-hidden whitespace-nowrap text-label font-extrabold leading-none [text-box:trim-both_cap_alphabetic]",
      "transition-all duration-300 ease-out motion-reduce:transition-none",
      active ? "ml-1.5 max-w-24 opacity-100" : "ml-0 max-w-0 opacity-0",
    )}
  >
    {children}
  </span>
);

const LinkTab = ({ tab, active, device }) => {
  const t = useT();
  const flash = useNavFlash(device, tab.key);
  const label = t(tab.short ?? tab.label);
  return (
    <Link to={tab.to} aria-label={label} aria-current={active ? "page" : undefined} data-tour={tab.key ? `nav-${tab.key}` : undefined} className={pillClass(active)}>
      <tab.icon className="size-5 shrink-0" />
      <TabLabel active={active}>{label}</TabLabel>
      <NavFlash stamp={flash} />
    </Link>
  );
};

// Вкладка-група: якщо ти в одному з її розділів — показує його іконку й назву і стрілку вгору
const GroupTab = ({ tab, look, device, first, open, setOpen }) => {
  const t = useT();
  const flash = useNavFlash(device, tab.id);
  const navigate = useNavigate();
  const pick = (to) => {
    setOpen(false);
    navigate(to);
  };
  const { hover, handlers } = useGroupPress({ open, setOpen, onPick: pick });
  // Меню остаётся на странице, пока доигрывает уход вниз. «Animationen: Aus» — анимаций нет, убираем сразу
  const [shown, setShown] = useState(open);
  if (open && !shown) setShown(true);
  const instant = document.documentElement.dataset.motion === "aus";
  const visible = open || (shown && !instant);
  const current = tab.current; // відкритий розділ групи або null
  const Icon = current?.icon ?? tab.icon;
  const menuId = `gruppe-${tab.id}`;

  return (
    <div data-tour={device ? `nav-${tab.id}` : undefined} className={pillClass(tab.active, open && !tab.active)}>
      <NavFlash stamp={flash} />
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={t(tab.label)}
        className="flex size-full touch-none items-center justify-center rounded-full select-none [-webkit-touch-callout:none]"
        {...handlers}
      >
        <Icon className="size-5 shrink-0" />
        <TabLabel active={tab.active}>{t(current?.label ?? tab.label)}</TabLabel>
        {tab.active && <ChevronUp className={cn("ml-0.5 size-3.5 shrink-0 transition-transform duration-300 ease-soft", open && "rotate-180")} strokeWidth={3} />}
      </button>
      {visible && (
        <GroupMenu id={menuId} group={tab} look={look} hover={hover} align={first ? "start" : "center"} closing={!open} onClosed={() => setShown(false)} onPick={() => setOpen(false)} />
      )}
    </div>
  );
};

// «Glas»: панель вкладок із бібліотеки — вибрана вкладка стає лінзою, її можна тягнути пальцем.
// Група тут відкривається натисканням (жест пальцем бібліотека забирає собі)
const GlassBar = ({ tabs, look, activeOf, openId, setOpenId, bar }) => {
  const navigate = useNavigate();
  const t = useT();
  const active = Math.max(0, tabs.findIndex(activeOf));
  const open = tabs.findIndex((tab) => tab.id && tab.id === openId);
  const choose = (index) => {
    const tab = tabs[index];
    if (tab.items) setOpenId(openId === tab.id ? null : tab.id);
    else navigate(tab.to);
  };
  return (
    <div className={cn("pointer-events-none fixed inset-x-0 bottom-0 pb-5.5 lg:hidden print:hidden", openId ? "z-40" : "z-10")}>
      <div ref={bar} className="relative flex justify-center px-4">
        <GlassNav
          className="pointer-events-auto"
          aria-label={t("Navigation")}
          activeIndex={active}
          onChange={choose}
          items={tabs.map((tab) => ({ label: t(tab.current?.label ?? tab.short ?? tab.label), icon: <GlassIcon tab={tab} /> }))}
        />
        {open >= 0 && (
          <div className="pointer-events-auto absolute bottom-full" style={{ left: `${((open + 0.5) / tabs.length) * 100}%` }}>
            <GroupMenu id={`gruppe-${openId}`} group={tabs[open]} look={look} onPick={() => setOpenId(null)} />
          </div>
        )}
      </div>
    </div>
  );
};

const GlassIcon = ({ tab }) => {
  const Icon = tab.current?.icon ?? tab.icon;
  return <Icon className="size-5" />;
};

export default TabBar;
