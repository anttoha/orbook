import { useState } from "react";
import { Navigate, useParams, useSearchParams } from "react-router-dom";
import ExamForm from "../components/exams/ExamForm";
import { Skeleton } from "../components/ui/PlanState";
import PageHeader from "../components/ui/PageHeader";
import { useExam } from "../shared/hooks/useExams";
import { usePlanStore } from "../shared/store/planStore";
import { canCreateExam, examPreset } from "../shared/utils/examRules";

// Запису немає, її ще вантажимо або її не можна міняти
const Placeholder = ({ text }) => (
  <section className="flex flex-col gap-5 lg:max-w-186">
    <PageHeader backTo="/testen" eyebrow="Klausuren" title="Klausur ändern" />
    {text ? <p className="text-body-sm text-muted">{text}</p> : <Skeleton className="h-40 rounded-card" />}
  </section>
);

// Правка: /testen/12/bearbeiten. key — інша запис означає нову форму з її значеннями
const EditExistingExam = ({ id }) => {
  const { exam, status, error } = useExam(id);

  if (status === "loading") return <Placeholder />;
  if (!exam) return <Placeholder text={status === "missing" ? "Diese Klausur gibt es nicht (mehr)." : error?.message} />;
  if (!exam.canEdit) return <Placeholder text="Diese Klausur kannst du mit deinem Code nicht ändern." />;
  return <ExamForm key={exam.id} exam={exam} />;
};

// ─────────────────────────────────────────────────────────────
// Сторінка запису: /testen/neu і /testen/12/bearbeiten. /testen/neu?datum=…&stunde=…&fach=… — поля вже заповнені.
// Кнопки ховають те, що не можна, але адресу можна відкрити й напряму, тому перевіряємо ще раз.
// Остаточно права перевіряє сервер при кожному записі.
// ─────────────────────────────────────────────────────────────
const ExamEdit = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams(); // з уроку Muster: ?datum=…&stunde=…&fach=…&muster=1 (частина 19)
  const me = usePlanStore((s) => s.me);
  // Лише при вході на сторінку. Якщо код застаріє посеред запису, сервер скаже про це при збереженні:
  // тоді відкриється вікно коду, а перехід на іншу сторінку знищив би заповнену форму
  const [needsCode] = useState(() => !canCreateExam(me) && !me?.editor);

  if (id) return <EditExistingExam id={id} />;
  if (needsCode) return <Navigate to="/editor-code?weiter=neu" replace />;
  return <ExamForm exam={null} preset={examPreset(searchParams)} />;
};

export default ExamEdit;
