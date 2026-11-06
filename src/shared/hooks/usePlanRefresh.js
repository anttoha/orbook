import { useState } from "react";
import { toast } from "sonner";
import { retryText } from "../api/api";
import { refreshPlan } from "../api/admin";
import { useAdminStore } from "../store/adminStore";

// Кнопка «Plan jetzt neu laden»: POST /admin/plan/refresh, потім оновити огляд
export const usePlanRefresh = () => {
  const reloadOverview = useAdminStore((s) => s.reloadOverview);
  const [busy, setBusy] = useState(false);
  const run = async () => {
    setBusy(true);
    try {
      await refreshPlan();
      toast.success("Plan wird neu geladen");
    } catch (error) {
      toast.error(error.status === 429 ? retryText(error) : error.message);
    } finally {
      setBusy(false);
      reloadOverview();
    }
  };
  return { busy, run };
};
