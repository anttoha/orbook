import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, LayoutGrid, Pointer } from "lucide-react";
import { androidWidgets } from "../../shared/api/android";
import { useT } from "../../shared/hooks/useT";
import { useClasses } from "../../shared/store/classesStore";
import { cellsLabel, isNotenKind, parseWidgets } from "../../shared/utils/widgetConfig";
import ListCard from "../ui/ListCard";
import Step from "./Step";
import { widgetKindInfo } from "./widgetKindInfo";

// Один виджет: значок вида, название, «9b · 4 × 2» → «Widget einstellen»
const WidgetRow = ({ widget, className }) => {
  const t = useT();
  const { label, Icon } = widgetKindInfo(widget.kind);
  return (
    <li className="flex">
      <Link to={`/mehr/android/widget/${widget.id}`} className="-mx-2 flex h-14.5 min-w-0 flex-1 items-center gap-3 rounded-field px-2 hover:bg-paper">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-tint text-accent-ink">
          <Icon className="size-4.5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-row font-bold text-ink">{t(label)}</span>
          <span className="block truncate text-caption text-faint">{[className, cellsLabel(widget)].filter(Boolean).join(" · ")}</span>
        </span>
        <ChevronRight className="size-4 shrink-0 text-faint2" />
      </Link>
    </li>
  );
};

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
            <WidgetRow key={widget.id} widget={widget} className={isNotenKind(widget.kind) ? "" : nameOf(widget.classId)} />
          ))}
        </ListCard>
      )}
      <ListCard title={t("Widget hinzufügen")}>
        <Step number={1} label={t("Startbildschirm *lange drücken*")} icon={Pointer} />
        <Step number={2} label={t("*Widgets → ORBook*")} icon={LayoutGrid} />
      </ListCard>
    </>
  );
};

export default WidgetList;
