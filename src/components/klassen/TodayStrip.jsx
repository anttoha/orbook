import { useUserStore } from "../../shared/store/userStore";
import { cellCount, todayCells } from "../../shared/utils/classes";
import { badgeCode } from "../../shared/utils/format";
import { fachClasses } from "../../shared/utils/lessons";
import { cn } from "../../shared/utils/cn";

// «Сегодня одной строкой» (макет 29 handy-01): клетка на урок в цвете предмета.
// Отмена — пунктир и зачёркнуто, замена — точка в углу; пустые клетки дополняют ряд до 7
const TodayStrip = ({ lessons }) => {
  const overrides = useUserStore((s) => s.colorOverrides); // свои Fachfarben — общие для устройства
  const cells = todayCells(lessons);
  const empty = cellCount(cells) - cells.length;
  return (
    <div className="flex gap-1.5">
      {cells.map((cell) => (
        <span
          key={cell.key}
          className={cn(
            "relative grid h-9 min-w-0 flex-1 place-items-center rounded-tile text-label font-extrabold",
            cell.cancelled ? "border border-dashed border-danger bg-danger-tint text-danger line-through" : fachClasses(cell.code, overrides),
          )}
        >
          {cell.code ? badgeCode(cell.code) : "–"}
          {cell.changed && <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full border-2 border-card bg-accent" />}
        </span>
      ))}
      {Array.from({ length: empty }, (_, i) => (
        <span key={`empty-${i}`} className="h-9 min-w-0 flex-1 rounded-tile bg-paper" />
      ))}
    </div>
  );
};

export default TodayStrip;
