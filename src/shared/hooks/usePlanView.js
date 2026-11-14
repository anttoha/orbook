import { useUserStore } from "../store/userStore";
import { planOf } from "../utils/planView";

// Налаштування «Stundenplan» (частина 30b) з усіма значеннями: const plan = usePlanView()
export const usePlanView = () => planOf(useUserStore((s) => s.plan));
