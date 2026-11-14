import { useRef, useState } from "react";
import { closestCenter, DndContext, defaultDropAnimationSideEffects, DragOverlay, KeyboardSensor, MeasuringStrategy, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useFlip } from "../../shared/hooks/useFlip";
import { cn } from "../../shared/utils/cn";
import { SPAN } from "../../shared/utils/startBlocks";
import EditableBlock from "./EditableBlock";
import StartBlock from "./StartBlock";

// Сетка блоков: телефон — 2 колонки, ПК — 4 (в «Anpassen» — 3: справа список блоков).
// dense — маленький блок занимает дырку, которую оставил широкий
const GRID = "grid grid-flow-row-dense grid-cols-2 auto-rows-block gap-2.5 lg:auto-rows-block-pc lg:gap-4";

// Обычный вид: блоки появляются по очереди (анимация rise-in, «Animationen» её укорачивают или выключают)
export const StartGrid = ({ blocks }) => (
  <div className={cn(GRID, "lg:grid-cols-4")}>
    {blocks.map((block, i) => (
      <div key={block.id} className={cn("motion-safe:animate-rise-in", SPAN[block.size])} style={{ animationDelay: `${i * 40}ms` }}>
        <StartBlock block={block} />
      </div>
    ))}
  </div>
);

// ─────────────────────────────────────────────────────────────
// «Anpassen»: те же блоки, но их можно таскать. Мышь — сразу после сдвига на 5px;
// палец — после короткого удержания (иначе нельзя было бы прокрутить страницу); клавиатура — Пробел.
// Порядок меняется сразу, пока тащишь (onDragOver): пунктир едет туда, где блок встанет,
// соседи плавно разъезжаются (useFlip). Блоки разного размера, поэтому сдвиги dnd-kit не нужны (strategy → null).
// Esc — вернуть, как было до перетаскивания
// ─────────────────────────────────────────────────────────────
const NO_SHIFT = () => null;
const MEASURE = { droppable: { strategy: MeasuringStrategy.WhileDragging } };
const DROP = { duration: 220, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)", sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: "0" } } }) };

export const EditGrid = ({ blocks, onMove, onRestore, onOpen, onRemove, onResize }) => {
  const [dragged, setDragged] = useState(null);
  const before = useRef(null); // раскладка до перетаскивания — для Esc
  const lastMove = useRef({ over: null, at: 0 });
  const grid = useRef(null);
  useFlip(grid, blocks.map((b) => `${b.id}:${b.size}`).join(","));
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates, keyboardCodes: { start: ["Space"], cancel: ["Escape"], end: ["Space"] } }),
  );
  const active = blocks.find((b) => b.id === dragged);

  const start = ({ active: a }) => {
    before.current = blocks;
    setDragged(a.id);
  };
  // Над другим блоком — встать на его место. Не чаще раза в 200 мс и в следующем кадре, а не сразу:
  // иначе большой блок, отъехав, снова оказывался под пальцем, порядок менялся туда-обратно
  // прямо во время перерисовки, и React останавливался с ошибкой «слишком много обновлений»
  const over = ({ active: a, over: o }) => {
    if (!o || o.id === a.id) return;
    const now = performance.now();
    if (now - lastMove.current.at < 200) return;
    lastMove.current = { over: o.id, at: now };
    requestAnimationFrame(() => onMove(a.id, o.id));
  };
  const cancel = () => {
    setDragged(null);
    if (before.current) onRestore(before.current);
  };

  return (
    <DndContext sensors={sensors} measuring={MEASURE} collisionDetection={closestCenter} onDragStart={start} onDragOver={over} onDragEnd={() => setDragged(null)} onDragCancel={cancel}>
      <SortableContext items={blocks.map((b) => b.id)} strategy={NO_SHIFT}>
        <div ref={grid} className={cn(GRID, "gap-y-5 lg:grid-cols-3 lg:gap-y-6")}>
          {blocks.map((block) => (
            <EditableBlock key={block.id} block={block} onOpen={onOpen} onRemove={onRemove} onResize={onResize} />
          ))}
        </div>
      </SortableContext>
      {/* Блок под пальцем: чуть крупнее, с тенью и рамкой цветом акцента */}
      <DragOverlay dropAnimation={DROP}>
        {active && (
          <div className="h-full scale-[1.03] cursor-grabbing rounded-card shadow-raise ring-2 ring-accent">
            <StartBlock block={active} editing />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
};
