import { useSearchParams } from "react-router-dom";

// Що зараз відкрито у вкладці Klausuren: ?liste=hausaufgaben — Hausaufgaben (частина 14)
export const useListMode = () => {
  const [params] = useSearchParams();
  return params.get("liste") === "hausaufgaben" ? "homework" : "exams";
};
