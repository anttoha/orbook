import { standLine } from "../../shared/utils/noten";

// «● Stand 16.09. · geholt 07:41»: когда школа обновила InfoPoint и когда мы забрали
const StandLine = ({ data }) => {
  const text = standLine(data);
  if (!text) return null;
  return (
    <p className="flex items-center gap-2 text-caption text-faint">
      <span className="size-2 shrink-0 rounded-full bg-ok" />
      {text}
    </p>
  );
};

export default StandLine;
