import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, LayoutGrid, Pointer } from "lucide-react";
import { androidWidgets } from "../../shared/api/android";
import { useT } from "../../shared/hooks/useT";
import { useClasses } from "../../shared/store/classesStore";
import { blockInfo } from "../../shared/utils/startBlocks";
import { cellsLabel, parseWidgets } from "../../shared/utils/widgetSnapshot";
import { BLOCK_ICONS } from "../start/blockIcons";
import ListCard from "../ui/ListCard";

// Один виджет: значок вида, название, «9b · 4 × 2» → «Widget einstellen»
const WidgetRow = ({ widget, className }) => {
  const t = useT();
  const Icon = BLOCK_ICONS[widget.kind];
  return (
    <li className="flex">
      <Link to={`/mehr/android/widget/${widget.id}`} className="-mx-2 flex h-14.5 min-w-0 flex-1 items-center gap-3 rounded-field px-2 hover:bg-paper">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-tint text-accent-ink">
          <Icon className="size-4.5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-row font-bold text-ink">{t(blockInfo(widget.kind)?.label)}</span>
          <span className="block truncate text-caption text-faint">{[className, cellsLabel(widget)].filter(Boolean).join(" · ")}</span>
        </span>
        <ChevronRight className="size-4 shrink-0 text-faint2" />
      </Link>
    </li>
  );
};

// Шаг «как добавить»: номер, текст (жирная часть — что нажать) и значок справа
const Step = ({ number, text, strong, icon: Icon }) => (
  <li className="flex h-14.5 items-center gap-3">
    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-tint text-label font-black text-accent-ink">{number}</span>
    <span className="min-w-0 flex-1 truncate text-row text-ink">
      {text && `${text} `}
      <b className="font-extrabold">{strong}</b>
    </span>
    <span className="grid size-8 shrink-0 place-items-center rounded-tile bg-sand text-accent-ink">
      <Icon className="size-4.5" />
    </span>
  </li>
);

// «Widgets auf diesem Handy» и «Widget hinzufügen» на странице Android-App (макет 31 handy-10)
const WidgetList = () => {
  const t = useT();
  const [widgets] = useState(() => parseWidgets(androidWidgets())); // список меняется только на рабочем столе
  const classes = useClasses((s) => s.list);
  const nameOf = (id) => classes.find((item) => item.id === id)?.name ?? "";
  return (
    <>
      {widgets.length > 0 && (
        <ListCard title={t("Widgets auf diesem Handy")}>
          {widgets.map((widget) => (
            <WidgetRow key={widget.id} widget={widget} className={nameOf(widget.classId)} />
          ))}
        </ListCard>
      )}
      <ListCard title={t("Widget hinzufügen")}>
        <Step number={1} text={t("Startbildschirm")} strong={t("lange drücken")} icon={Pointer} />
        <Step number={2} strong={t("Widgets → ORBook")} icon={LayoutGrid} />
      </ListCard>
    </>
  );
};

export default WidgetList;
