import { useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import HomeworkForm from "../components/homework/HomeworkForm";
import { Skeleton } from "../components/ui/PlanState";
import PageHeader from "../components/ui/PageHeader";
import { useHomeworkItem } from "../shared/hooks/useHomework";
import { usePlanStore } from "../shared/store/planStore";
import { addHomeworkTarget, canCreateHomework } from "../shared/utils/examRules";

const Placeholder = ({ text }) => (
  <section className="flex flex-col gap-5 lg:max-w-186">
    <PageHeader backTo="/testen?liste=hausaufgaben" eyebrow="Hausaufgaben" title="Hausaufgabe ändern" />
    {text ? <p className="text-body-sm text-muted">{text}</p> : <Skeleton className="h-40 rounded-card" />}
  </section>
);

// Правка: /testen/hausaufgaben/4/bearbeiten
const EditExisting = ({ id }) => {
  const { item, status, error } = useHomeworkItem(id);
  if (status === "loading") return <Placeholder />;
  if (!item) return <Placeholder text={status === "missing" ? "Diese Hausaufgabe gibt es nicht (mehr)." : error?.message} />;
  if (!item.canEdit) return <Placeholder text="Diese Hausaufgabe kannst du nicht ändern." />;
  return <HomeworkForm key={item.id} item={item} />;
};

// ─────────────────────────────────────────────────────────────
// Сторінка запису Hausaufgabe: /testen/hausaufgaben/neu і …/4/bearbeiten (частина 14).
// Права ще раз перевіряємо тут (адресу можна відкрити напряму), остаточно — сервер.
// ─────────────────────────────────────────────────────────────
const HomeworkEdit = () => {
  const { id } = useParams();
  const me = usePlanStore((s) => s.me);
  // лише при вході: якщо код застаріє посеред запису, сервер скаже при збереженні
  const [redirect] = useState(() => (canCreateHomework(me) ? null : addHomeworkTarget(me) ?? "/testen?liste=hausaufgaben"));

  if (id) return <EditExisting id={id} />;
  if (redirect) return <Navigate to={redirect} replace />;
  return <HomeworkForm item={null} />;
};

export default HomeworkEdit;
