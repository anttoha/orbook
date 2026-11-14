import { useSortable } from "@dnd-kit/sortable";
import { GripVertical, X } from "lucide-react";
import { useT } from "../../shared/hooks/useT";
import { cn } from "../../shared/utils/cn";
import { blockInfo, SIZE_LABELS, SPAN } from "../../shared/utils/startBlocks";
import { SizeIcon } from "./SizeTile";
import StartBlock from "./StartBlock";

// Кнопки панели не должны начинать перетаскивание
const stop = (event) => event.stopPropagation();

// Панель над блоком: ручка (за неё видно, что блок можно тащить), размеры, «убрать»
// listeners — те же обработчики перетаскивания, что у всего блока: за ручку тоже можно тянуть
const BlockTools = ({ block, info, listeners, onResize, onRemove, t }) => (
  <div className="absolute -top-3.5 right-2.5 z-10 flex items-center gap-0.5 rounded-full border border-hair bg-paper p-0.5 shadow-menu motion-safe:animate-pop-in">
    <span {...listeners} className="grid size-7 cursor-grab touch-none place-items-center rounded-full text-faint hover:bg-sand active:cursor-grabbing" title={t("Ziehen zum Verschieben")}>
      <GripVertical className="size-4" />
    </span>
    {info.sizes.length > 1 &&
      info.sizes.map((size) => (
        <button
          key={size}
          type="button"
          onPointerDown={stop}
          onClick={() => onResize(block, size)}
          aria-label={`${t("Größe")}: ${t(SIZE_LABELS[size])}`}
          aria-pressed={block.size === size}
          title={t(SIZE_LABELS[size])}
          className={cn("grid size-7 place-items-center rounded-full transition-colors", block.size === size ? "bg-tint" : "hover:bg-sand")}
        >
          <SizeIcon size={size} small active={block.size === size} />
        </button>
      ))}
    <button
      type="button"
      onPointerDown={stop}
      onClick={() => onRemove(block)}
      aria-label={t("{name} entfernen").replace("{name}", t(info.label))}
      title={t("Vom Start entfernen")}
      className="grid size-7 place-items-center rounded-full text-danger transition-colors hover:bg-danger-tint"
    >
      <X className="size-4" strokeWidth={2.6} />
    </button>
  </div>
);

// ─────────────────────────────────────────────────────────────
// Блок в режиме «Anpassen»: весь блок можно взять и тащить (@dnd-kit), сверху — панель
// с ручкой, размерами (Klein / Breit / Groß) и «убрать»; нажатие на блок — шторка блока.
// Пока блок тащат, на его месте — пунктир: туда он встанет. Соседи разъезжаются плавно (useFlip в EditGrid).
// С клавиатуры: Tab до блока, Пробел — взять, стрелки — нести, Пробел — положить; Enter — шторка
// ─────────────────────────────────────────────────────────────
const EditableBlock = ({ block, onOpen, onRemove, onResize }) => {
  const t = useT();
  const { attributes, listeners, setNodeRef, isDragging } = useSortable({ id: block.id });
  const info = blockInfo(block.kind);
  const name = t(info.label);

  return (
    <div ref={setNodeRef} data-flip={block.id} className={cn("relative", SPAN[block.size])}>
      {isDragging ? (
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
            className="h-full cursor-grab touch-manipulation rounded-card ring-1 ring-accent/25 outline-none select-none hover:ring-2 hover:ring-accent/60 focus-visible:ring-2 focus-visible:ring-accent active:cursor-grabbing [&_*]:pointer-events-none"
          >
            <StartBlock block={block} editing />
          </div>
          <BlockTools block={block} info={info} listeners={listeners} onResize={onResize} onRemove={onRemove} t={t} />
        </>
      )}
    </div>
  );
};

export default EditableBlock;
