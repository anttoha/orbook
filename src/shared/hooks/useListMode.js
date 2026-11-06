import { useSearchParams } from "react-router-dom";

// Що зараз відкрито у вкладці Klausuren: ?liste=hausaufgaben — Hausaufgaben (частина 14), ?liste=termine — Termine (18)
const MODES = { hausaufgaben: "homework", termine: "appointments" };
export const LIST_PARAM = { homework: "hausaufgaben", appointments: "termine" };

export const useListMode = () => {
  const [params] = useSearchParams();
  return MODES[params.get("liste")] ?? "exams";
};
