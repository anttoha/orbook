import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronRight, EllipsisVertical, Plus } from "lucide-react";
import ClassBadge from "../../ui/ClassBadge";
import { TrashIcon } from "../../ui/icons";
import { menuContentClass, menuIconClass, menuItemClass } from "../../ui/menuStyles";
import SchoolHead from "./SchoolHead";
import PillButton from "../../ui/PillButton";

const cell = "py-3.5 pr-4 text-body-sm";

// «⋮» у класса: удалить (класс № 1 удалить нельзя — у него Klassenpasswort)
const ClassMenu = ({ item, onDelete }) => (
  <DropdownMenu.Root>
    <DropdownMenu.Trigger aria-label={`Klasse ${item.name}: Menü`} className="grid size-8 place-items-center rounded-full text-ink outline-none hover:bg-sand focus-visible:bg-sand">
      <EllipsisVertical className="size-4.5" />
    </DropdownMenu.Trigger>
    <DropdownMenu.Portal>
      <DropdownMenu.Content align="end" sideOffset={4} className={menuContentClass}>
        <DropdownMenu.Item disabled={item.id === 1} onSelect={() => onDelete(item)} className={`${menuItemClass} text-danger`}>
          <TrashIcon className={`${menuIconClass} text-danger`} /> Klasse löschen
        </DropdownMenu.Item>
        {item.id === 1 && <p className="px-3 pb-2 text-caption text-faint">Die erste Klasse hat das Klassenpasswort und bleibt.</p>}
      </DropdownMenu.Content>
    </DropdownMenu.Portal>
  </DropdownMenu.Root>
);

// ─────────────────────────────────────────────────────────────
// Школа на ПК (макет 29 pc-03): шапка с «Zugang ändern» и «Code für neue Klasse», ниже таблица классов
// ─────────────────────────────────────────────────────────────
const SchoolTable = ({ school, colorOf, onOpen, onEdit, onNewCode, onDelete }) => (
  <article className="rounded-card bg-card px-5 pt-4.5 pb-1.5">
    <div className="flex items-center gap-4 border-b border-hair pb-4">
      <SchoolHead school={school}>
        <button type="button" onClick={() => onEdit(school)} className="shrink-0 px-2 text-row font-extrabold text-accent-ink">
          Zugang ändern
        </button>
        <PillButton glass="glass" size="md" onClick={() => onNewCode(school)} className="flex h-10.5 shrink-0 items-center gap-2 rounded-full bg-sand px-4.5 text-row font-extrabold text-ink">
          <Plus className="size-4.5" /> Code für neue Klasse
        </PillButton>
      </SchoolHead>
    </div>
    {(school.classes ?? []).length === 0 ? (
      <p className="py-4 text-body-sm text-muted">Noch keine Klasse — sie entsteht mit ihrem ersten Code.</p>
    ) : (
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-hair text-label text-faint">
            <th className="py-3 pr-4 font-bold">Klasse</th>
            <th className="py-3 pr-4 font-bold">Geräte</th>
            <th className="py-3 pr-4 font-bold">Codes</th>
            <th className="py-3 pr-4 font-bold">Tests</th>
            <th className="w-32" />
          </tr>
        </thead>
        <tbody className="divide-y divide-hair">
          {school.classes.map((item) => (
            <tr key={item.id}>
              <td className={cell}>
                <span className="flex items-center gap-3.5">
                  <ClassBadge name={item.name} color={colorOf(item.id)} size="md" />
                  <span className="text-row font-extrabold text-ink">Klasse {item.name}</span>
                </span>
              </td>
              <td className={`${cell} font-extrabold text-ink`}>{item.devices}</td>
              <td className={`${cell} text-ink`}>{item.codes}</td>
              <td className={`${cell} text-ink`}>{item.exams}</td>
              <td className="py-3.5">
                <span className="flex items-center justify-end gap-1">
                  <button type="button" onClick={() => onOpen(item)} className="flex items-center gap-1 px-2 text-row font-extrabold text-accent-ink">
                    Öffnen <ChevronRight className="size-4" />
                  </button>
                  <ClassMenu item={item} onDelete={onDelete} />
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </article>
);

export default SchoolTable;
