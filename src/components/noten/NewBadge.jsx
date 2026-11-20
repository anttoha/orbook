import { useT } from "../../shared/hooks/useT";

// Фиолетовая метка «neu» — оценка, которой не было при прошлой загрузке
const NewBadge = () => {
  const t = useT();
  return <span className="shrink-0 rounded-full bg-accent px-2 py-0.5 text-small font-extrabold text-on-accent">{t("neu")}</span>;
};

export default NewBadge;
