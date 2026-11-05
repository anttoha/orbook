import SubjectBadge from "../components/ui/SubjectBadge";
import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { toast } from "sonner";
import CoursesState from "../components/courses/CoursesState";
import ColorPalette from "../components/more/ColorPalette";
import { CheckIcon } from "../components/ui/icons";
import ListCard from "../components/ui/ListCard";
import PageHeader from "../components/ui/PageHeader";
import { usePlanStore } from "../shared/store/planStore";
import { useUserStore } from "../shared/store/userStore";
import { cn } from "../shared/utils/cn";
import { visibleSubjects } from "../shared/utils/courses";
import { fachDotClass, paletteOf } from "../shared/utils/lessons";

// Рядок предмета: натискання вибирає його, і палітра зверху змінює саме його колір.
// Вибраний виділено фоном, жирною назвою і галочкою — щоб було видно, що зараз фарбуємо
const SubjectRow = ({ subject, overrides, selected, onSelect }) => (
  <li className="-mx-2">
    <button
      type="button"
      onClick={onSelect}
      aria-current={selected ? "true" : undefined}
      className={cn("flex h-13.25 w-full items-center gap-3 rounded-field px-2 text-left transition-colors duration-300", selected ? "bg-tint" : "hover:bg-paper")}
    >
      <SubjectBadge subject={subject} />
      <span className={cn("min-w-0 flex-1 truncate text-row transition-colors duration-300", selected ? "font-extrabold text-accent-ink" : "font-semibold text-ink")}>{subject.name}</span>
      <span className={cn("size-5.5 shrink-0 rounded-full transition-colors duration-300", fachDotClass(subject.code, overrides))} />
      {/* вибраний — галочка у фіолетовому кружечку, як у макеті «Nutzbarkeit» */}
      {selected ? (
        <span className="grid size-5.5 shrink-0 place-items-center rounded-full bg-accent text-on-accent motion-safe:animate-pop-in">
          <CheckIcon className="size-3.5" />
        </span>
      ) : (
        <ChevronRight className="size-4 shrink-0 text-faint2" />
      )}
    </button>
  </li>
);

// ─────────────────────────────────────────────────────────────
// «Fachfarben» (макет 25). Кольори лише на цьому пристрої, запитів немає.
// У списку предмети видимих курсів: їх у школи більше, ніж 8 на макеті.
// ─────────────────────────────────────────────────────────────
const SubjectColors = () => {
  const courses = usePlanStore((s) => s.courses);
  const metaSubjects = usePlanStore((s) => s.meta?.subjects);
  const picked = useUserStore((s) => s.picked);
  const overrides = useUserStore((s) => s.colorOverrides);
  const setFachColor = useUserStore((s) => s.setFachColor);
  const setColorOverrides = useUserStore((s) => s.setColorOverrides);
  const [selectedCode, setSelectedCode] = useState(null);

  const hiddenRequired = useUserStore((s) => s.hiddenRequired);
  const subjects = visibleSubjects(courses, picked, metaSubjects, hiddenRequired);
  const selected = subjects.find((subject) => subject.code === selectedCode) ?? subjects[0];

  const resetAll = () => {
    const before = overrides; // для «Rückgängig»
    setColorOverrides({});
    toast("Standardfarben wiederhergestellt", { duration: 6000, action: { label: "Rückgängig", onClick: () => setColorOverrides(before) } });
  };

  return (
    <section className="flex flex-col gap-4.5 lg:max-w-186">
      <div className="flex items-end justify-between gap-2">
        <PageHeader backTo="/mehr" eyebrow="Mehr" title="Fachfarben" />
        <button type="button" onClick={resetAll} className="shrink-0 pb-1 text-label font-bold text-accent-ink">
          Standard
        </button>
      </div>

      <CoursesState>
        {selected && (
          <>
            <ColorPalette subject={selected} current={paletteOf(selected.code, overrides)} onPick={(palette) => setFachColor(selected.code, palette)} />
            <ListCard>
              {subjects.map((subject) => (
                <SubjectRow key={subject.code} subject={subject} overrides={overrides} selected={subject.code === selected.code} onSelect={() => setSelectedCode(subject.code)} />
              ))}
            </ListCard>
          </>
        )}
      </CoursesState>
    </section>
  );
};

export default SubjectColors;
