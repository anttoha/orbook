import { useLocation } from "react-router-dom";
import { listModeOf } from "../utils/navLayout";

// Що зараз відкрито у вкладці Klausuren: ?liste=hausaufgaben — Hausaufgaben (частина 14), ?liste=termine — Termine (18)
export const LIST_PARAM = { homework: "hausaufgaben", appointments: "termine" };

export const useListMode = () => listModeOf(useLocation().search);
