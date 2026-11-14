import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Minus, MoveDiagonal } from "lucide-react";
import { useT } from "../../shared/hooks/useT";
import { blockInfo, SIZE_LABELS, SPAN } from "../../shared/utils/startBlocks";
import { cn } from "../../shared/utils/cn";
import StartBlock from "./StartBlock";

// Кнопки на углах не должны начинать перетаскивание
const stop = (event) => event.stopPropagation();

// ─────────────────────────────────────────────────────────────
// Блок в режиме «Anpassen» (макет handy-02): держим и тянем (@dnd-kit/sortable),
// минус слева сверху убирает, стрелки справа снизу меняют размер по кругу, нажатие — шторка блока.
// С клавиатуры: Tab до блока, Пробел — взять, стрелки — нести, Пробел — положить; Enter — шторка
// ─────────────────────────────────────────────────────────────
const EditableBlock = ({ block, onOpen, onRemove, onResize }) => {
  const t = useT();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  const info = blockInfo(block.kind);
  const name = t(info.label);
  const style = { transform: CSS.Translate.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className={cn("relative", SPAN[block.size])}>
      {isDragging ? (
        // место, куда встанет блок: пунктир цветом акцента (сам блок едет под пальцем — DragOverlay)
        <div className="h-full rounded-card border-2 border-dashed border-accent bg-tint" />
      ) : (
        <>
          <div
            {...attributes}
            {...listeners}
            aria-label={`${name} · ${t(SIZE_LABELS[block.size])}`}
            aria-roledescription={t("verschiebbarer Block")}
            onClick={() => onOpen(block)}
            onKeyDown={(event) => {
              if (event.key === "Enter") onOpen(block);
              else listeners?.onKeyDown?.(event);
            }}
            className="h-full cursor-grab touch-manipulation rounded-card outline-none select-none focus-visible:ring-2 focus-visible:ring-accent/50 active:cursor-grabbing [&_*]:pointer-events-none"
          >
            <StartBlock block={block} editing />
          </div>
          <button
            type="button"
            onPointerDown={stop}
            onClick={() => onRemove(block)}
            aria-label={t("{name} entfernen").replace("{name}", name)}
            className="absolute -top-2 -left-2 grid size-6 place-items-center rounded-full border-2 border-paper bg-danger text-white"
          >
            <Minus className="size-3.5" strokeWidth={3} />
          </button>
          {info.sizes.length > 1 && (
            <button
              type="button"
              onPointerDown={stop}
              onClick={() => onResize(block)}
              aria-label={t("Größe ändern")}
              className="absolute -right-2 -bottom-2 grid size-6 place-items-center rounded-full border border-rule bg-card text-ink"
            >
              <MoveDiagonal className="size-3.5" strokeWidth={2.4} />
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default EditableBlock;
