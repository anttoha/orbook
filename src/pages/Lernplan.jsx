import { useParams } from "react-router-dom";
import LernplanForm from "../components/lernplan/LernplanForm";
import PageHeader from "../components/ui/PageHeader";
import { Skeleton } from "../components/ui/PlanState";
import { useExam } from "../shared/hooks/useExams";
import { useT } from "../shared/hooks/useT";
import { examLabel } from "../shared/utils/examRules";

// ─────────────────────────────────────────────────────────────
// «Lernplan» zum Test: /testen/12/lernplan (часть 41). Тест — из загруженного списка или по запросу (useExam).
// Сам план живёт только на устройстве (tasksStore), сервер про него не знает.
// ─────────────────────────────────────────────────────────────
const Lernplan = () => {
  const t = useT();
  const { id } = useParams();
  const { exam, status, error } = useExam(id);
  const eyebrow = exam ? examLabel(exam) : t("Tests"); // «Physik · Do 25.09.»

  return (
    <section className="flex flex-1 flex-col lg:max-w-186">
      <PageHeader backTo={`/testen?sheet=klausur&id=${id}`} eyebrow={eyebrow} eyebrowClassName="text-accent-ink" title={t("Lernplan")} />
      {exam && <LernplanForm key={exam.id} exam={exam} />}
      {!exam && status === "loading" && <Skeleton className="mt-5 h-40 rounded-card" />}
      {!exam && status !== "loading" && <p className="mt-5 text-body-sm text-muted">{status === "missing" ? t("Diesen Test gibt es nicht (mehr).") : error?.message}</p>}
    </section>
  );
};

export default Lernplan;
