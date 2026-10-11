import * as ContextMenu from "@radix-ui/react-context-menu";
import { EyeOff, FileText, Info, Palette, Share } from "lucide-react";
import { toast } from "sonner";
import { useSheet } from "../../shared/hooks/useSheet";
import { usePlanStore } from "../../shared/store/planStore";
import { useUserStore } from "../../shared/store/userStore";
import { subjectName } from "../../shared/utils/format";
import { lessonText, shareText } from "../../shared/utils/share";
import Kbd from "../ui/Kbd";
import { menuContentClass, menuIconClass, menuItemClass, menuSeparatorClass } from "../ui/menuStyles";

// Підказка клавіші праворуч у пункті меню (тільки на ПК, на телефоні схована)
const Shortcut = ({ children }) => <Kbd className="ml-auto hidden lg:inline-grid">{children}</Kbd>;

// ─────────────────────────────────────────────────────────────
// Контекстне меню уроку.
// Відкривається правою кнопкою миші або довгим натисканням на телефоні —
// це вміє Radix ContextMenu сам.
// Поки меню відкрите, працюють клавіші: Enter — Details (або підсвічений пункт), N — Notiz, S — Teilen.
// children — сам урок (кнопка), він стає «тригером» меню.
// lesson — урок із сервера; date — "2026-10-07"
// ─────────────────────────────────────────────────────────────
const LessonContextMenu = ({ lesson, date, children }) => {
  const { openSheet } = useSheet(); // відкрити шторку
  const courses = usePlanStore((s) => s.courses); // курси класу
  const picked = useUserStore((s) => s.picked); // вибрані курси
  const hideCourse = useUserStore((s) => s.hideCourse); // сховати курс
  const setPicked = useUserStore((s) => s.setPicked); // повернути вибір

  const params = { datum: date, stunde: lesson.period, fach: lesson.subject.code }; // параметри шторок цього уроку
  // Сховати можна лише курс за вибором (Wahl); обов'язкові («immer») — ні
  const course = courses.find((c) => c.nr === lesson.course?.nr);
  const canHide = Boolean(course?.optional);

  // Дії меню
  const openDetails = () => openSheet("stunde", params);
  const openNote = () => openSheet("notiz", params);
  const share = () => shareText(lessonText(lesson, date));

  // «Kurs ausblenden» + сповіщення з кнопкою «Rückgängig» (скасувати)
  const handleHide = () => {
    const before = picked; // запам'ятовуємо, щоб можна було повернути
    hideCourse(course.nr, courses.filter((c) => c.optional).map((c) => c.nr));
    toast(`${subjectName(lesson.subject)} (${course.label}) ausgeblendet`, {
      action: { label: "Rückgängig", onClick: () => setPicked(before) },
    });
  };

  // Гарячі клавіші всередині відкритого меню.
  // Enter на підсвіченому пункті Radix обробляє сам; якщо нічого не підсвічено
  // (меню відкрили мишкою) — Enter відкриває Details, як підказує ↵ на макеті.
  const handleKeyDown = (event) => {
    const key = event.key.toLowerCase();
    const nothingHighlighted = event.target === event.currentTarget; // фокус на самому меню, а не на пункті
    const action = { n: openNote, s: share, enter: nothingHighlighted ? openDetails : null }[key]; // клавіша → дія
    if (!action) return;
    event.preventDefault();
    // У ContextMenu немає «закрити з коду» — імітуємо Esc, його Radix слухає на document
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    action();
  };

  return (
    <ContextMenu.Root>
      {/* asChild — меню вішається прямо на переданий урок, без зайвої обгортки */}
      <ContextMenu.Trigger asChild>{children}</ContextMenu.Trigger>

      {/* Portal — меню малюється в кінці <body>, поверх усього */}
      <ContextMenu.Portal>
        <ContextMenu.Content className={menuContentClass} onKeyDown={handleKeyDown}>
          <ContextMenu.Item className={menuItemClass} onSelect={openDetails}>
            <Info className={menuIconClass} /> Details <Shortcut>↵</Shortcut>
          </ContextMenu.Item>
          <ContextMenu.Item className={menuItemClass} onSelect={openNote}>
            <FileText className={menuIconClass} /> Notiz zur Stunde <Shortcut>N</Shortcut>
          </ContextMenu.Item>
          <ContextMenu.Item className={menuItemClass} onSelect={share}>
            <Share className={menuIconClass} /> Teilen <Shortcut>S</Shortcut>
          </ContextMenu.Item>

          <ContextMenu.Separator className={menuSeparatorClass} />

          <ContextMenu.Item className={menuItemClass} onSelect={() => openSheet("farbe", { fach: lesson.subject.code })}>
            <Palette className={menuIconClass} /> Fachfarbe ändern
          </ContextMenu.Item>
          {canHide && (
            <ContextMenu.Item className={menuItemClass} onSelect={handleHide}>
              <EyeOff className={menuIconClass} /> Kurs ausblenden
            </ContextMenu.Item>
          )}
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
};

export default LessonContextMenu;
