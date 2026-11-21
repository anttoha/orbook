import { Ellipsis } from "lucide-react";
import { useT } from "../../shared/hooks/useT";
import { useNavFlash } from "../../shared/store/navFlashStore";
import { visibleNav } from "../../shared/utils/navLayout";
import { cn } from "../../shared/utils/cn";
import NavFlash from "../navbar/NavFlash";
import { groupIcon, SECTION_ICONS } from "../navbar/navIcons";

// ─────────────────────────────────────────────────────────────
// Телефон справа на ПК, когда выбран «Handy» (часть 38, макет pc-01): экран Start в общих чертах
// и нижняя панель — как она будет на телефоне. Остаётся на месте при прокрутке (sticky).
// На самом телефоне превью нет: превью — настоящая нижняя панель
// ─────────────────────────────────────────────────────────────
const LeistePreview = ({ list, features }) => {
  const t = useT();
  const tabs = [
    ...visibleNav(list, features).map((e) => (e.type === "link" ? { key: e.tab.key, Icon: SECTION_ICONS[e.tab.key], label: e.tab.label } : { key: e.id, Icon: groupIcon(e.icon), label: t(e.name) })),
    { key: "mehr", Icon: Ellipsis, label: t("Mehr") },
  ];
  return (
    <div aria-hidden="true" className="sticky top-4 w-75 shrink-0 rounded-panel bg-sand p-2 shadow-menu">
      <div className="flex aspect-[390/844] flex-col gap-2.5 overflow-hidden rounded-card border border-rule bg-paper p-3">
        <StartSketch />
        <div className="mt-auto flex h-11 rounded-full border border-hair bg-card p-1.25">
          {tabs.map((tab, i) => (
            <PreviewTab key={tab.key} tab={tab} active={i === 0} />
          ))}
        </div>
      </div>
    </div>
  );
};

// Вкладка превью: первая выбрана (с подписью), остальные — иконки; после правки коротко светится
const PreviewTab = ({ tab, active }) => {
  const flash = useNavFlash("phone", tab.key);
  return (
    <span className={cn("relative flex min-w-0 basis-0 items-center justify-center gap-1 rounded-full", active ? "grow-[1.4] bg-accent text-on-accent" : "grow text-faint")}>
      <tab.Icon className="size-4 shrink-0" />
      {active && <span className="truncate text-caption font-extrabold">{tab.label}</span>}
      <NavFlash stamp={flash} />
    </span>
  );
};

// Start «в общих чертах»: заголовок и карточки без данных — важна только панель
const StartSketch = () => (
  <>
    <div className="mt-2 h-2 w-20 rounded-tick bg-rule" />
    <div className="h-4 w-24 rounded-tag bg-faint/40" />
    <div className="h-24 rounded-block bg-card" />
    <div className="grid grid-cols-2 gap-2.5">
      <div className="h-20 rounded-block bg-card" />
      <div className="h-20 rounded-block bg-card" />
    </div>
    <div className="h-36 rounded-block bg-card" />
    <div className="grid grid-cols-2 gap-2.5">
      <div className="h-16 rounded-block bg-card" />
      <div className="h-16 rounded-block bg-card" />
    </div>
  </>
);

export default LeistePreview;
