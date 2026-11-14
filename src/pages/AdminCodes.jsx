import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus } from "lucide-react";
import AdminHeader from "../components/admin/AdminHeader";
import { AdminEmpty, AdminError, AdminSkeleton } from "../components/admin/AdminState";
import CodeCard from "../components/admin/CodeCard";
import CodeDialogs from "../components/admin/CodeDialogs";
import CodeTable from "../components/admin/CodeTable";
import NewCodeSheet from "../components/admin/NewCodeSheet";
import SearchField from "../components/admin/SearchField";
import Button from "../components/ui/Button";
import Segmented from "../components/ui/Segmented";
import { DESKTOP_QUERY, useMediaQuery } from "../shared/hooks/useMediaQuery";
import { useCodeActions } from "../shared/hooks/useCodeActions";
import { useNow } from "../shared/hooks/useNow";
import { useAdminStore } from "../shared/store/adminStore";
import { isTeacherCode } from "../shared/utils/admin";
import PillButton from "../components/ui/PillButton";

// Тексти двох списків: Editor-Codes (макети 41, 43) і Lehrer-Codes (частина 14, handy-10, pc-04)
const TEXTS = {
  editor: { title: "Editor-Codes", search: "Code suchen", empty: "Noch keine Editor-Codes" },
  teacher: { title: "Lehrer-Codes", search: "Kürzel suchen", empty: "Noch keine Lehrer-Codes" },
};

// Телефон: «Editor-Codes · 4 | Lehrer-Codes · 3» — дві адреси, одна вкладка «Codes»
const KindSwitch = ({ kind, codes }) => {
  const navigate = useNavigate();
  const count = (teacher) => codes.filter((code) => isTeacherCode(code) === teacher).length;
  return (
    <Segmented
      label="Codes"
      className="lg:hidden"
      value={kind}
      options={[
        { value: "editor", label: `Editor-Codes · ${count(false)}` },
        { value: "teacher", label: `Lehrer-Codes · ${count(true)}` },
      ]}
      onChange={(value) => navigate(value === "teacher" ? "/admin/lehrer" : "/admin/codes", { replace: true })}
    />
  );
};

// Пошук на ПК: за назвою або хвостом коду
const matches = (code, query) => `${code.label} ${code.masked}`.toLowerCase().includes(query.trim().toLowerCase());

// ─────────────────────────────────────────────────────────────
// «Editor-Codes» (макети 41 телефон, 43 ПК). ?neu=1 у адресі одразу відкриває вікно нового коду
// (так працює кнопка «Neuer Editor-Code» на Übersicht).
// kind = "teacher" — «Lehrer-Codes» (/admin/lehrer): той самий список /admin/codes, інший фільтр і вікно
// ─────────────────────────────────────────────────────────────
const AdminCodes = ({ kind = "editor" }) => {
  const teacher = kind === "teacher";
  const texts = TEXTS[kind];
  const { today } = useNow();
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const [params, setParams] = useSearchParams();
  const codes = useAdminStore((s) => s.codes);
  const reloadCodes = useAdminStore((s) => s.reloadCodes);
  const ensureSettings = useAdminStore((s) => s.ensureSettings);
  const teachers = useAdminStore((s) => s.teachers.data?.teachers);
  const reloadTeachers = useAdminStore((s) => s.reloadTeachers);
  const { toggle } = useCodeActions();
  const [query, setQuery] = useState("");
  const [action, setAction] = useState(null); // відкрите вікно дії: { kind, code }
  const newOpen = params.get("neu") === "1";

  // «Schuljahresende» у вікнах строку бере settings.school.yearEnd
  useEffect(() => {
    ensureSettings();
  }, [ensureSettings]);
  // предмети вчителів («Ma, Ph») — з плану класу
  useEffect(() => {
    if (teacher) reloadTeachers();
  }, [teacher, reloadTeachers]);
  const subjectsOf = (code) => teachers?.find((item) => item.short === (code.teacher ?? code.label))?.subjects.join(", ") ?? "";

  const openNew = () => setParams({ neu: "1" });
  const all = codes.data?.codes ?? [];
  const mine = all.filter((code) => isTeacherCode(code) === teacher);
  const list = mine.filter((code) => matches(code, query));

  const addButton = isDesktop ? (
    <Button variant="primary" className="flex-none px-5" onClick={openNew}>
      <Plus className="size-4.5" /> Neuer Code
    </Button>
  ) : (
    <PillButton glass="filled" size="sm" aria-label="Neuer Code" onClick={openNew} className="grid size-9.5 place-items-center rounded-full bg-accent text-on-accent">
      <Plus className="size-5" />
    </PillButton>
  );

  const renderList = () => {
    if (codes.status === "loading") return <AdminSkeleton />;
    if (codes.status === "error") return <AdminError error={codes.error} onRetry={reloadCodes} />;
    if (!mine.length) {
      return (
        <AdminEmpty text={texts.empty}>
          <Button variant="primary" className="flex-none px-5" onClick={openNew}>
            <Plus className="size-4.5" /> Neuer Code
          </Button>
        </AdminEmpty>
      );
    }
    if (!list.length) return <AdminEmpty text="Kein Code passt zur Suche." />;
    if (!isDesktop) {
      return (
        <ul className="flex flex-col gap-2.5">
          {list.map((code) => (
            <CodeCard key={code.id} code={code} today={today} onToggle={toggle} onOpenSheet={() => setAction({ kind: "menu", code })} subjects={teacher ? subjectsOf(code) : null} />
          ))}
        </ul>
      );
    }
    return (
      <>
        <div className="rounded-card bg-card px-5 pt-4.5 pb-1">
          <CodeTable codes={list} today={today} onToggle={toggle} onAction={(name, code) => (name === "lock" ? toggle(code) : setAction({ kind: name, code }))} subjectsOf={teacher ? subjectsOf : null} />
        </div>
      </>
    );
  };

  return (
    <section className="flex flex-col gap-4 lg:gap-5">
      <AdminHeader title={texts.title} actions={[isDesktop && <SearchField key="search" value={query} onChange={setQuery} placeholder={texts.search} className="w-50" />, <span key="add">{addButton}</span>]} />
      <KindSwitch kind={kind} codes={all} />
      <div>{renderList()}</div>

      <NewCodeSheet open={newOpen} kind={kind} onClose={() => setParams({}, { replace: true })} />
      <CodeDialogs action={action} onChange={setAction} />
    </section>
  );
};

export default AdminCodes;
