import * as ContextMenu from "@radix-ui/react-context-menu";
import { BookOpen, EyeOff, FileText, Info, Palette, Share } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useSheet } from "../../shared/hooks/useSheet";
import { usePlanStore } from "../../shared/store/planStore";
import { useUserStore } from "../../shared/store/userStore";
import { mergeCourses, optionalNumbers, switchCourses, withNumbers } from "../../shared/utils/courses";
import { subjectName } from "../../shared/utils/format";
import { lessonText, shareText } from "../../shared/utils/share";
import { addExamTarget, addHomeworkTarget, canCreateExam, canCreateHomework } from "../../shared/utils/examRules";
import { FlagIcon, LockIcon } from "../ui/icons";
import { cn } from "../../shared/utils/cn";
import Kbd from "../ui/Kbd";
import { menuContentClass, menuIconClass, menuItemClass, menuSeparatorClass } from "../ui/menuStyles";

// Підказка клавіші праворуч у пункті меню (тільки на ПК, на телефоні схована)
const Shortcut = ({ children }) => <Kbd className="ml-auto hidden lg:inline-grid">{children}</Kbd>;

// ─────────────────────────────────────────────────────────────
// Контекстне меню уроку.
// Відкривається правою кнопкою миші або довгим натисканням на телефоні —
// це вміє Radix ContextMenu сам.
// Поки меню відкрите, працюють клавіші: Enter — Details (або підсвічений пункт), N — Notiz, S — Teilen,
// H — Hausaufgabe geben, T — Test eintragen (часть 24).
// children — сам урок (кнопка), він стає «тригером» меню.
// lesson — урок із сервера; date — "2026-10-07"
// ─────────────────────────────────────────────────────────────
const LessonContextMenu = ({ lesson, date, children }) => {
  const { openSheet } = useSheet(); // відкрити шторку
  const courses = usePlanStore((s) => s.courses); // курси класу
  const picked = useUserStore((s) => s.picked); // вибрані курси
  const setPicked = useUserStore((s) => s.setPicked); // повернути вибір
  const hiddenRequired = useUserStore((s) => s.hiddenRequired); // приховані обов'язкові
  const setHiddenRequired = useUserStore((s) => s.setHiddenRequired);
  const shareEnabled = usePlanStore((s) => s.me?.features?.share !== false); // адмін міг вимкнути «Teilen»
  const me = usePlanStore((s) => s.me); // права на записи (часть 24)
  const navigate = useNavigate();

  const params = { datum: date, stunde: lesson.period, fach: lesson.subject?.code }; // параметри шторок цього уроку
  // Сховати можна будь-який курс; урок без курсу (подія, заміна) — ні
  const course = courses.find((c) => c.nr === lesson.course?.nr);
  const canHide = Boolean(course);

  // Дії меню
  const openDetails = () => openSheet("stunde", params);
  const openNote = () => openSheet("notiz", params);
  const share = () => shareText(lessonText(lesson, date));

  // Записи на этот урок (часть 24). Без права — пункт с замком ведёт на ввод Editor-Code;
  // код есть, но права нет — пункта нет (target = null)
  const query = `?datum=${date}&stunde=${lesson.period}&fach=${encodeURIComponent(lesson.subject?.code ?? "")}`;
  const entryItem = (allowed, path, fallback) => (allowed ? `${path}${query}` : fallback);
  const homeworkTarget = lesson.subject ? entryItem(canCreateHomework(me), "/testen/hausaufgaben/neu", addHomeworkTarget(me)) : null;
  const examTarget = lesson.subject ? entryItem(canCreateExam(me), "/testen/neu", addExamTarget(me)) : null;
  const giveHomework = homeworkTarget ? () => navigate(homeworkTarget) : null;
  const addExam = examTarget ? () => navigate(examTarget) : null;

  // «Kurs ausblenden» + сповіщення з кнопкою «Rückgängig» (скасувати)
  const handleHide = () => {
    const before = { picked, hiddenRequired }; // запам'ятовуємо, щоб можна було повернути
    // той самий курс в інші дні може мати інший номер — ховаємо всі (mergeCourses)
    const nrs = mergeCourses(courses.filter((c) => c.optional === course.optional)).find((c) => c.nrs.includes(course.nr))?.nrs ?? [course.nr];
    if (course.optional) setPicked(switchCourses(picked, nrs, false, optionalNumbers(courses)));
    else setHiddenRequired(withNumbers(hiddenRequired, nrs, true));
    toast(`${subjectName(lesson.subject)} (${course.label}) ausgeblendet`, {
      action: {
        label: "Rückgängig",
        onClick: () => {
          setPicked(before.picked);
          setHiddenRequired(before.hiddenRequired);
        },
      },
    });
  };

  // Гарячі клавіші всередині відкритого меню.
  // Enter на підсвіченому пункті Radix обробляє сам; якщо нічого не підсвічено
  // (меню відкрили мишкою) — Enter відкриває Details, як підказує ↵ на макеті.
  const handleKeyDown = (event) => {
    const key = event.key.toLowerCase();
    const nothingHighlighted = event.target === event.currentTarget; // фокус на самому меню, а не на пункті
    const action = { n: openNote, s: shareEnabled ? share : null, h: giveHomework, t: addExam, enter: nothingHighlighted ? openDetails : null }[key]; // клавіша → дія
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
          {giveHomework && (
            <ContextMenu.Item className={cn(menuItemClass, "text-accent-ink")} onSelect={giveHomework}>
              <BookOpen className={cn(menuIconClass, "text-accent-ink")} /> Hausaufgabe geben {canCreateHomework(me) ? <Shortcut>H</Shortcut> : <LockIcon className="ml-auto size-4 text-faint" />}
            </ContextMenu.Item>
          )}
          {addExam && (
            <ContextMenu.Item className={cn(menuItemClass, "text-accent-ink")} onSelect={addExam}>
              <FlagIcon className={cn(menuIconClass, "text-accent-ink")} /> Test eintragen {canCreateExam(me) ? <Shortcut>T</Shortcut> : <LockIcon className="ml-auto size-4 text-faint" />}
            </ContextMenu.Item>
          )}
          {shareEnabled && (
            <ContextMenu.Item className={menuItemClass} onSelect={share}>
              <Share className={menuIconClass} /> Teilen <Shortcut>S</Shortcut>
            </ContextMenu.Item>
          )}

          <ContextMenu.Separator className={menuSeparatorClass} />

          {/* у уроку без предмета (subject: null) немає кольору, який можна змінити */}
          {lesson.subject && (
            <ContextMenu.Item className={menuItemClass} onSelect={() => openSheet("farbe", { fach: lesson.subject.code })}>
              <Palette className={menuIconClass} /> Fachfarbe ändern
            </ContextMenu.Item>
          )}
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
