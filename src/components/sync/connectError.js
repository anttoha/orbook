import { retryText } from "../../shared/api/api";
import { syncErrorText } from "../../shared/utils/notes";

// Текст помилки під полем коду (і на екрані «Gerät verbinden?»)
export function connectError(error) {
  if (error?.message === "Ungültiger Sync-Code") return "Der Code hat 20 Zeichen, z. B. K7QM-4TXP-R2AB-9CDE-FGHJ.";
  if (error?.status === 429) return retryText(error);
  return syncErrorText(error);
}
