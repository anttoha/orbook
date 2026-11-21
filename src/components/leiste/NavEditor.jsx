import { useState } from "react";
import { closestCenter, DndContext, DragOverlay, KeyboardSensor, MouseSensor, TouchSensor, useDroppable, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useT } from "../../shared/hooks/useT";
import { fromContainers, groupKey, isGroup, moveItem, SECTIONS, sectionAvailable, toContainers } from "../../shared/utils/navLayout";
import { cn } from "../../shared/utils/cn";
import { groupIcon, SECTION_ICONS } from "../navbar/navIcons";
import LeisteRow from "./LeisteRow";

// ─────────────────────────────────────────────────────────────
// Списки «Unten» и «In „Mehr“» со перетаскиванием (часть 35, макеты handy-03, handy-04).
// Раскладка на время перетаскивания разложена по «контейнерам» (navLayout.toContainers):
// top — верхний уровень, у каждой группы своя колонка, rest — «Mehr». Пункт переезжает только при
// отпускании (onDragEnd). Раньше он переезжал уже на лету (onDragOver) — и над границей двух списков
// прыгал туда-сюда без конца: React останавливал страницу («Etwas ist schiefgelaufen»).
// middle — то, что стоит между списками («Gruppe hinzufügen», «Gruppenmenü»).
// Мышь — после сдвига на 5px, палец — после короткого удержания (иначе страница не прокручивалась бы).
// ─────────────────────────────────────────────────────────────
const NavEditor = ({ list, features, device, onChange, onError, onRemove, onAdd, onEditGroup, full, middle }) => {
  const t = useT();
  const [dragged, setDragged] = useState(null);
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const c = toContainers(list, features);
  const shown = (key) => key.startsWith("g:") || sectionAvailable(key, features); // раздел, который школа выключила (Noten без InfoPoint), не предлагаем
  const groups = Object.fromEntries(list.filter(isGroup).map((g) => [groupKey(g.id), g]));

  const end = ({ active, over: o }) => {
    setDragged(null);
    if (!o || o.id === active.id) return;
    const r = moveItem(c, active.id, o.id, device);
    if (r.error) onError(r.error);
    else onChange(fromContainers(r.c, list));
  };
  const cancel = () => setDragged(null);

  const rowOf = (key, props = {}) => {
    if (key.startsWith("g:")) {
      const g = groups[key];
      const names = c[key].filter(shown).map((k) => SECTIONS[k].label);
      return <LeisteRow icon={groupIcon(g.icon)} label={t(g.name)} sub={[t("Gruppe"), names.join(", ")].filter(Boolean).join(" · ")} action="edit" onAction={() => onEditGroup(g.id)} {...props} />;
    }
    return <LeisteRow icon={SECTION_ICONS[key]} label={SECTIONS[key].label} {...props} />;
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={({ active }) => setDragged(active.id)} onDragEnd={end} onDragCancel={cancel}>
      <Zone id="top" title={t("Unten")} aside={full.label}>
        <SortableContext items={c.top} strategy={verticalListSortingStrategy}>
          {c.top.map((key) => (
            <Sortable key={key} id={key}>
              {(handle) =>
                key.startsWith("g:") ? (
                  <>
                    {rowOf(key, { handle })}
                    <GroupItems id={key} items={c[key].filter(shown)} rowOf={rowOf} onRemove={onRemove} />
                  </>
                ) : (
                  rowOf(key, { handle, action: "minus", onAction: () => onRemove(key) })
                )
              }
            </Sortable>
          ))}
        </SortableContext>
        {device === "phone" && <LeisteRow icon={SECTION_ICONS.mehr} label={t("Mehr")} locked />}
      </Zone>

      {middle}

      <Zone id="rest" title={t("In „Mehr“")} empty={c.rest.filter(shown).length === 0}>
        <SortableContext items={c.rest.filter(shown)} strategy={verticalListSortingStrategy}>
          {c.rest.filter(shown).map((key) => (
            <Sortable key={key} id={key}>
              {(handle) => rowOf(key, { handle, action: full.on ? "off" : "plus", onAction: () => onAdd(key) })}
            </Sortable>
          ))}
        </SortableContext>
      </Zone>

      <DragOverlay>{dragged && rowOf(dragged, { dragging: true })}</DragOverlay>
    </DndContext>
  );
};

// Список на белой карточке; сам список — место, куда можно бросить (если он пустой)
const Zone = ({ id, title, aside, empty, children: rows }) => {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <section>
      <h2 className="mb-2.5 flex items-baseline justify-between text-hint font-extrabold text-faint">
        {title}
        {aside && <span>{aside}</span>}
      </h2>
      <div ref={setNodeRef} className={cn("divide-y divide-hair rounded-card bg-card px-3.5", empty && "min-h-14", isOver && empty && "ring-2 ring-accent")}>
        {rows}
      </div>
    </section>
  );
};

// Разделы внутри группы: со сдвигом; в пустую группу можно бросить (зона «in:g:id»)
const GroupItems = ({ id, items, rowOf, onRemove }) => {
  const { setNodeRef, isOver } = useDroppable({ id: `in:${id}` });
  return (
    <SortableContext items={items} strategy={verticalListSortingStrategy}>
      <div ref={setNodeRef} className={cn("divide-y divide-hair border-t border-hair", items.length === 0 && "h-3", isOver && "rounded-tile bg-tint")}>
        {items.map((key) => (
          <Sortable key={key} id={key}>
            {(handle) => rowOf(key, { handle, nested: true, action: "minus", onAction: () => onRemove(key) })}
          </Sortable>
        ))}
      </div>
    </SortableContext>
  );
};

// Строка, которую можно тащить: ручка получает listeners, на месте тащимой — полупрозрачный след
const Sortable = ({ id, children: render }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Translate.toString(transform), transition }} className={cn(isDragging && "opacity-40")}>
      {render({ ...attributes, ...listeners })}
    </div>
  );
};

export default NavEditor;
