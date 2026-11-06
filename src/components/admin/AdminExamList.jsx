import { useUserStore } from "../../shared/store/userStore";
import { ago, authorText } from "../../shared/utils/admin";
import { fullDate } from "../../shared/utils/examRules";
import { subjectName, weekdayShort } from "../../shared/utils/format";
import { fachDotClass } from "../../shared/utils/lessons";
import { cn } from "../../shared/utils/cn";
import ExamBadge from "../exams/ExamBadge";
import ExamDateTile from "../exams/ExamDateTile";
import { PencilIcon, TrashIcon } from "../ui/icons";

const lessonText = (exam) => (exam.lesson ? `${exam.lesson}. Std` : "—");
const iconButton = "grid size-9 shrink-0 place-items-center rounded-full text-ink hover:bg-sand";

// Олівець і кошик у рядку
const RowActions = ({ exam, onEdit, onDelete }) => (
  <div className="flex shrink-0 items-center">
    <button type="button" aria-label="Bearbeiten" className={iconButton} onClick={() => onEdit(exam)}>
      <PencilIcon className="size-4" />
    </button>
    <button type="button" aria-label="Löschen" className={iconButton} onClick={() => onDelete(exam)}>
      <TrashIcon className="size-4" />
    </button>
  </div>
);

// Телефон (макет 44): плашка дати, тип і предмет, тема; під карткою — хто вніс і коли
const ExamCards = ({ exams, now, onEdit, onDelete }) => {
  const overrides = useUserStore((s) => s.colorOverrides);
  return (
    <ul className="flex flex-col gap-3">
      {exams.map((exam) => (
        <li key={exam.id}>
          <div className="flex items-center gap-3 rounded-card bg-card py-2.5 pr-1.5 pl-3">
            <ExamDateTile exam={exam} overrides={overrides} />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 text-caption text-muted">
                <ExamBadge type={exam.type} />
                <span className="truncate">{exam.lesson ? `${subjectName(exam.subject)} · ${lessonText(exam)}` : subjectName(exam.subject)}</span>
              </p>
              <p className="mt-1 truncate text-row font-extrabold text-ink">{exam.topic || exam.type}</p>
            </div>
            <RowActions exam={exam} onEdit={onEdit} onDelete={onDelete} />
          </div>
          <p className="mt-1.5 px-1 text-caption text-faint">
            über {authorText(exam)} · {ago(exam.createdAt, now)}
          </p>
        </li>
      ))}
    </ul>
  );
};

const th = "pb-3 text-left text-hint font-extrabold text-faint";

// ПК (макет 46): таблиця
const ExamTable = ({ exams, now, onEdit, onDelete }) => {
  const overrides = useUserStore((s) => s.colorOverrides);
  return (
    <table className="w-full border-collapse">
      <thead className="border-b border-hair">
        <tr>
          {["Datum", "Art", "Fach", "Thema", "Stunde", "Eingetragen von", "Seit"].map((title) => (
            <th key={title} className={th}>
              {title}
            </th>
          ))}
          <th className={th}>
            <span className="sr-only">Aktionen</span>
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-hair">
        {exams.map((exam) => (
          <tr key={exam.id} className="text-body-sm text-muted">
            <td className="py-3.5 pr-3 font-extrabold whitespace-nowrap text-ink">
              {weekdayShort(exam.date)} {fullDate(exam.date).slice(0, 6)}
            </td>
            <td className="pr-3">
              <ExamBadge type={exam.type} />
            </td>
            <td className="pr-3">
              <span className="flex items-center gap-2 text-ink">
                <span className={cn("size-2 shrink-0 rounded-full", fachDotClass(exam.subject?.code, overrides))} />
                {subjectName(exam.subject)}
              </span>
            </td>
            <td className="pr-3 font-extrabold text-ink">{exam.topic || "—"}</td>
            <td className="pr-3 whitespace-nowrap">{lessonText(exam)}</td>
            <td className="pr-3">{authorText(exam)}</td>
            <td className="pr-3 whitespace-nowrap text-faint">{ago(exam.createdAt, now)}</td>
            <td>
              <RowActions exam={exam} onEdit={onEdit} onDelete={onDelete} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

// Список Klausuren адмінки: картки на телефоні, таблиця на ПК
const AdminExamList = ({ isDesktop, ...props }) =>
  isDesktop ? (
    <div className="rounded-card bg-card px-5 pt-4.5 pb-1">
      <ExamTable {...props} />
    </div>
  ) : (
    <ExamCards {...props} />
  );

export default AdminExamList;
