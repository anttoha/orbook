import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import MaterialForm from "../components/materials/MaterialForm";
import PageHeader from "../components/ui/PageHeader";
import { Skeleton } from "../components/ui/PlanState";
import { useMaterials } from "../shared/store/materialsStore";
import { usePlanStore } from "../shared/store/planStore";
import { addMaterialTarget, canShareMaterials } from "../shared/utils/materials";

const Placeholder = ({ text }) => (
  <section className="flex flex-col gap-5 lg:max-w-186">
    <PageHeader backTo="/materialien" eyebrow="Materialien" title="Link ändern" />
    {text ? <p className="text-body-sm text-muted">{text}</p> : <Skeleton className="h-40 rounded-card" />}
  </section>
);

// Правка: /materialien/3/bearbeiten. Посилання — зі списку (його вантажимо, якщо адресу відкрили напряму)
const EditExisting = ({ id }) => {
  const item = useMaterials((s) => s.items.find((material) => String(material.id) === id)) ?? null;
  const status = useMaterials((s) => s.status);
  const ensure = useMaterials((s) => s.ensure);
  useEffect(() => {
    ensure();
  }, [ensure]);

  if (!item && (status === "idle" || status === "loading")) return <Placeholder />;
  if (!item) return <Placeholder text="Diesen Link gibt es nicht (mehr)." />;
  if (!item.canEdit) return <Placeholder text="Diesen Link kannst du nicht ändern." />;
  return <MaterialForm key={item.id} item={item} />;
};

// ─────────────────────────────────────────────────────────────
// Сторінка «Neuer Link» / «Link ändern» (частина 15): /materialien/neu і …/3/bearbeiten.
// Права ще раз перевіряємо тут (адресу можна відкрити напряму), остаточно — сервер.
// ─────────────────────────────────────────────────────────────
const MaterialEdit = () => {
  const { id } = useParams();
  const me = usePlanStore((s) => s.me);
  // лише при вході: якщо код застаріє посеред запису, сервер скаже при збереженні
  const [redirect] = useState(() => (canShareMaterials(me) ? null : addMaterialTarget(me) ?? "/materialien"));

  if (id) return <EditExisting id={id} />;
  if (redirect) return <Navigate to={redirect} replace />;
  return <MaterialForm item={null} />;
};

export default MaterialEdit;
