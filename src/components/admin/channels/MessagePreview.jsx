import { useState } from "react";
import { useChannelText } from "../../../shared/hooks/useChannelText";
import { KINDS } from "../../../shared/utils/channels";
import Segmented from "../../ui/Segmented";
import MessageBubble from "./MessageBubble";

// «So sieht es aus»: настоящий текст с сервера — последний отправленный или собранный сейчас
const MessagePreview = () => {
  const [kind, setKind] = useState("plan");
  const { text, loading } = useChannelText(kind);
  return (
    <section className="flex flex-col gap-2.5">
      <h2 className="text-hint font-extrabold text-faint">So sieht es aus</h2>
      <Segmented options={KINDS} value={kind} onChange={setKind} label="Welche Nachricht" />
      <MessageBubble text={text} loading={loading} />
    </section>
  );
};

export default MessagePreview;
