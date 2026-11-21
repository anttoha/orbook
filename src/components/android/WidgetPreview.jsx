import { blockInfo } from "../../shared/utils/startBlocks";
import { previewSize } from "../../shared/utils/widgetSnapshot";
import { cn } from "../../shared/utils/cn";
import { isNotenKind } from "../../shared/utils/widgetConfig";
import StartBlock from "../start/StartBlock";
import NotenWidgetCard from "./NotenWidgetCard";

// Превью в «Widget einstellen»: кусочек «обоев» и на нём тот же блок, что на Start (виджет рисуется так же).
// Колонка сетки — minmax(0,1fr) (grid-cols-1) и min-w-0: длинная строка урока не растягивает карточку за края подложки
// Пятна обоев — фон «Aurora» из оформления Glas (index.css, .glass-backdrop)
// Часть 31d: свой Design, акцент и «Dunkel» виджета — атрибуты на обёртке включают те же наборы токенов, что на <html>
const WidgetPreview = ({ widget }) => {
  const info = blockInfo(widget.kind);
  const wanted = previewSize(widget);
  const size = info?.sizes.includes(wanted) ? wanted : info?.sizes[0];
  const block = { id: "vorschau", kind: widget.kind, size, opts: info?.opts ?? {} };
  return (
    <div data-glass-bg="aurora" className="glass-backdrop widget-wall grid min-h-48 grid-cols-1 place-items-center rounded-card p-4" aria-hidden="true">
      {/* inert: превью только смотреть — ссылки и кнопки блока не нажимаются */}
      <div
        inert
        data-design={widget.design !== "app" ? widget.design : undefined}
        data-accent={widget.accent !== "app" ? widget.accent : undefined}
        className={cn(size === "klein" ? "w-1/2 min-w-0" : "w-full min-w-0", widget.look === "dunkel" && "dark")}
      >
        {isNotenKind(widget.kind) ? <NotenWidgetCard kind={widget.kind} show={widget.showGrades} /> : <StartBlock block={block} editing />}
      </div>
    </div>
  );
};

export default WidgetPreview;
