import Badge from "../../ui/Badge";
import { cn } from "../../../shared/utils/cn";
import { sourceBadge, teacherTitle } from "../../../shared/utils/teachers";
import { useT } from "../../../shared/hooks/useT";
import CodeMenu from "../CodeMenu";
import SubjectPlates from "./SubjectPlates";
import { teacherActions } from "./teacherActions";

const th = "pb-3 text-left text-hint font-extrabold text-faint";

// Tabelle der Lehrkräfte am PC (Entwurf 34 pc-01): Name, Kürzel, Fächer, Quelle, Lehrer-Code, «⋮»
const TeacherTable = ({ teachers, names, codeText, onAction }) => {
  const t = useT();
  return (
    <table className="w-full border-collapse">
      <thead className="border-b border-hair">
        <tr>
          <th className={th}>{t("Name")}</th>
          <th className={th}>{t("Kürzel")}</th>
          <th className={th}>{t("Fächer")}</th>
          <th className={th}>{t("Quelle")}</th>
          <th className={th}>{t("Lehrer-Code")}</th>
          <th className={th}>
            <span className="sr-only">{t("Aktionen")}</span>
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-hair">
        {teachers.map((teacher) => {
          const badge = sourceBadge(teacher);
          return (
            <tr key={teacher.short} className={cn("text-body-sm text-muted", teacher.hidden && "opacity-55")}>
              <td className="py-3.5 pr-3 font-extrabold text-ink">{teacherTitle(teacher)}</td>
              <td className="pr-3">{teacher.short}</td>
              <td className="pr-3">
                <SubjectPlates codes={teacher.subjects} names={names} />
              </td>
              <td className="pr-3">
                <Badge variant={badge.variant}>{badge.text}</Badge>
              </td>
              <td className="pr-3 whitespace-nowrap">{codeText(teacher) ?? "—"}</td>
              <td>
                <div className="flex justify-end">
                  <CodeMenu code={{ label: teacherTitle(teacher) }} items={teacherActions(teacher)} onAction={(kind) => onAction(kind, teacher)} />
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default TeacherTable;
