import Switch from "../ui/Switch";

// ─────────────────────────────────────────────────────────────
// «Schüler dürfen ändern» у формах учителя (макети handy-06, handy-14, pc-03).
// Лише для role=teacher: від інших сервер це поле не приймає (422 teacher_only).
// note — підпис під карткою, коли перемикач увімкнено
// ─────────────────────────────────────────────────────────────
const StudentsMayEdit = ({ checked, onChange, note }) => (
  <div>
    <div className="flex items-center gap-3 rounded-card bg-card px-3.75 py-3.5">
      <div className="min-w-0 flex-1">
        <p className="text-body text-ink">Schüler dürfen ändern</p>
        <p className="mt-0.5 text-caption text-faint">nur Editor-Codes mit „Lehrer-Einträge ändern“</p>
      </div>
      <Switch checked={checked} onChange={onChange} label="Schüler dürfen ändern" />
    </div>
    {checked && note && <p className="mt-1.5 text-caption text-faint">{note}</p>}
  </div>
);

export default StudentsMayEdit;
