import { useState } from "react";
import { toast } from "sonner";
import { useNow } from "../../shared/hooks/useNow";
import { usePlanStore } from "../../shared/store/planStore";
import { useTasksStore } from "../../shared/store/tasksStore";
import { useUserStore } from "../../shared/store/userStore";
import { formSubjects } from "../../shared/utils/examRules";
import { mySubjectCodes, subjectItems } from "../../shared/utils/picker";
import { dueChoices, TASK_MAX, validateTaskText } from "../../shared/utils/tasks";
import Button from "../ui/Button";
import Field from "../ui/Field";
import { CheckIcon, TrashIcon } from "../ui/icons";
import ListPicker from "../ui/ListPicker";
import Sheet from "../ui/Sheet";
import TextField from "../ui/TextField";
import DueChips from "./DueChips";

// ─────────────────────────────────────────────────────────────
// Шторка «Eigene Aufgabe» (макет 25 handy-03). Своя задача живёт только на устройстве (tasksStore).
//   ?sheet=aufgabe        — новая
//   ?sheet=aufgabe&id=t-… — изменить или удалить
// ─────────────────────────────────────────────────────────────
const TaskSheet = ({ open, onClose, sheet }) => {
  const task = useTasksStore((s) => (sheet.id ? s.tasks.find((t) => t.id === sheet.id && !t.deleted) : null)) ?? null;

  return (
    <Sheet open={open} onClose={onClose} desktop="dialog" eyebrow="Aufgaben" title="Eigene Aufgabe">
      {/* key — при смене задачи форма создаётся заново с её полями */}
      <TaskForm key={task?.id ?? "neu"} task={task} onDone={onClose} />
    </Sheet>
  );
};

const TaskForm = ({ task, onDone }) => {
  const { today } = useNow();
  const [text, setText] = useState(task?.text ?? "");
  const [due, setDue] = useState(task ? task.due : dueChoices(today)[0].value); // новая — «Morgen»
  const [subject, setSubject] = useState(task?.subject ?? null);
  const [error, setError] = useState(null);
  const { addTask, updateTask, deleteTask, restoreTask } = useTasksStore.getState();
  const courses = usePlanStore((s) => s.courses);
  const metaSubjects = usePlanStore((s) => s.meta?.subjects);
  const picked = useUserStore((s) => s.picked);
  const subjects = formSubjects(courses, picked, metaSubjects, null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const problem = validateTaskText(text);
    if (problem) return setError(problem);
    try {
      if (task) updateTask(task.id, { text: text.trim(), due, subject });
      else addTask({ text, due, subject });
    } catch {
      return toast.error("Aufgabe konnte nicht gespeichert werden"); // localStorage переполнен или запрещён
    }
    toast.success("Aufgabe gespeichert");
    onDone();
  };

  // Удаление без вопроса: в уведомлении есть «Rückgängig»
  const handleDelete = () => {
    const old = deleteTask(task.id);
    toast("Aufgabe gelöscht", { duration: 6000, action: { label: "Rückgängig", onClick: () => restoreTask(old) } });
    onDone();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <TextField
        id="task-text"
        label="Was ist zu tun?"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setError(null);
        }}
        placeholder="z. B. Referat-Thema aussuchen"
        maxLength={TASK_MAX}
        error={error}
        autoFocus
      />
      <Field label="Bis wann?">
        <DueChips value={due} today={today} onChange={setDue} />
      </Field>
      <Field label="Fach · optional">
        <ListPicker id="task-subject" label="Fach" inline clearable clearLabel="Ohne Fach" items={subjectItems(subjects, mySubjectCodes(courses, picked))} value={subject} onChange={setSubject} />
      </Field>

      <div className="flex flex-col gap-3.5">
        <div className="flex gap-2">
          {task && (
            <Button variant="danger" onClick={handleDelete} className="flex-none px-4.5">
              <TrashIcon className="size-4" /> Löschen
            </Button>
          )}
          <Button type="submit" variant="primary" disabled={!text.trim()}>
            <CheckIcon className="size-4" /> Speichern
          </Button>
        </div>
      </div>
    </form>
  );
};


export default TaskSheet;
