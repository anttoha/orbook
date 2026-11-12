import { useEffect, useState } from "react";
import { loadChannelText } from "../api/admin";

// Текст сообщения «plan» или «tomorrow» для админки (превью и «Nachricht teilen»).
// Сеть не ответила — text: null, превью покажет «Noch nichts zu zeigen.»
export function useChannelText(kind) {
  const [state, setState] = useState({ kind: null, text: null });

  useEffect(() => {
    let alive = true; // сменили вид, пока ждали — старый ответ не нужен
    loadChannelText(kind)
      .then((result) => alive && setState({ kind, text: result?.text ?? null }))
      .catch(() => alive && setState({ kind, text: null }));
    return () => {
      alive = false;
    };
  }, [kind]);

  return { text: state.text, loading: state.kind !== kind };
}
