import Badge from "../../ui/Badge";
import { cn } from "../../../shared/utils/cn";
import { sourceBadge, teacherTitle } from "../../../shared/utils/teachers";
import { useT } from "../../../shared/hooks/useT";
import CodeMenu from "../CodeMenu";
import SubjectPlates from "./SubjectPlates";
import { teacherActions } from "./teacherActions";

// Karte einer Lehrkraft am Handy (Entwurf 34 handy-01): Name, Kürzel, Quelle, «⋮», Fächer, Lehrer-Code
const TeacherCard = ({ teacher, names, codeText, onOpenSheet }) => {
  const t = useT();
  const badge = sourceBadge(teacher);
  return (
    <li className={cn("rounded-card bg-card px-3.5 pt-3 pb-3.5", teacher.hidden && "opacity-55")}>
      <div className="flex items-center gap-2">
        <p className="min-w-0 truncate text-subhead font-extrabold text-ink">{teacherTitle(teacher)}</p>
        {teacher.name && <span className="text-body-sm text-faint">{teacher.short}</span>}
        <Badge variant={badge.variant}>{badge.text}</Badge>
        <span className="ml-auto">
          <CodeMenu code={{ label: teacherTitle(teacher) }} items={teacherActions(teacher)} onOpenSheet={onOpenSheet} />
        </span>
      </div>
      <SubjectPlates codes={teacher.subjects} names={names} className="mt-2" />
      <p className="mt-2 text-caption text-faint">{codeText ?? t("Kein Lehrer-Code")}</p>
    </li>
  );
};

export default TeacherCard;
