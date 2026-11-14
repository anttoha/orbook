import { useState } from "react";
import { closestCenter, DndContext, DragOverlay, KeyboardSensor, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { rectSortingStrategy, SortableContext, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
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
// палец — после короткого удержания (иначе нельзя было бы прокрутить страницу); клавиатура — Пробел
// ─────────────────────────────────────────────────────────────
export const EditGrid = ({ blocks, onMove, onOpen, onRemove, onResize }) => {
  const [dragged, setDragged] = useState(null);
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates, keyboardCodes: { start: ["Space"], cancel: ["Escape"], end: ["Space"] } }),
  );
  const active = blocks.find((b) => b.id === dragged);

  const end = ({ active: from, over }) => {
    setDragged(null);
    if (over) onMove(from.id, over.id);
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={({ active: a }) => setDragged(a.id)} onDragEnd={end} onDragCancel={() => setDragged(null)}>
      <SortableContext items={blocks.map((b) => b.id)} strategy={rectSortingStrategy}>
        <div className={cn(GRID, "lg:grid-cols-3")}>
          {blocks.map((block) => (
            <EditableBlock key={block.id} block={block} onOpen={onOpen} onRemove={onRemove} onResize={onResize} />
          ))}
        </div>
      </SortableContext>
      {/* Блок под пальцем: чуть повёрнут, с тенью и рамкой цветом акцента (макет handy-02) */}
      <DragOverlay>
        {active && (
          <div className="h-full -rotate-3 rounded-card shadow-raise ring-2 ring-accent">
            <StartBlock block={active} editing />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
};
