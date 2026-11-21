import { useState } from "react";
import { Plus, X } from "lucide-react";
import Checkbox from "../ui/Checkbox";
import { useT } from "../../shared/hooks/useT";

const TOPIC_MAX = 60;

// «Themen» (макет 41 handy-02): строки из описания теста — с галочкой, свои — с крестиком.
// Последняя строка — «Thema hinzufügen»: нажал — поле, Enter — тема добавлена
const TopicList = ({ topics, onToggle, onAdd, onRemove }) => {
  const t = useT();
  const [adding, setAdding] = useState(false);
  const [text, setText] = useState("");

  const add = (event) => {
    event.preventDefault();
    const topic = text.trim();
    if (topic) onAdd(topic);
    setText("");
  };

  return (
    <ul className="divide-y divide-hair rounded-card bg-card px-4">
      {topics.map((topic) => (
        <li key={topic.text} className="flex items-center gap-2">
          <span className="min-w-0 flex-1">
            <Checkbox checked={topic.on} onChange={() => onToggle(topic.text)} label={<span className="truncate font-bold">{topic.text}</span>} />
          </span>
          {topic.own && (
            <button type="button" onClick={() => onRemove(topic.text)} aria-label={t("Thema entfernen")} className="grid size-11 place-items-center rounded-full text-faint outline-none focus-visible:ring-2 focus-visible:ring-accent/50">
              <X className="size-4" />
            </button>
          )}
        </li>
      ))}
      <li>
        {adding ? (
          <form onSubmit={add} className="flex min-h-13 items-center gap-3">
            <Plus className="size-5 shrink-0 text-accent-ink" />
            <input
              autoFocus
              value={text}
              maxLength={TOPIC_MAX}
              onChange={(event) => setText(event.target.value)}
              onBlur={(event) => {
                add(event);
                setAdding(false);
              }}
              placeholder={t("Thema")}
              aria-label={t("Thema hinzufügen")}
              className="min-w-0 flex-1 bg-transparent text-row text-ink outline-none placeholder:text-faint"
            />
          </form>
        ) : (
          <button type="button" onClick={() => setAdding(true)} className="flex min-h-13 w-full items-center gap-3 text-row font-extrabold text-accent-ink outline-none focus-visible:ring-2 focus-visible:ring-accent/50">
            <Plus className="size-5" /> {t("Thema hinzufügen")}
          </button>
        )}
      </li>
    </ul>
  );
};

export default TopicList;
