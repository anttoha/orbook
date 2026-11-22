import { dotDate } from "../../shared/utils/noten";
import { noteNumber } from "../../shared/utils/noten";
import { translate } from "../../shared/i18n/translate";
import { scaleBottom } from "../../shared/utils/notenZiel";

// Размеры рисунка: ширина зависит от места (телефон / колонка ПК), текст в SVG масштабируется вместе с ним
const H = 96; // высота поля графика
const LEFT = 22; // место под «1», «2», «3»
const BOTTOM = 28; // место под даты

// ─────────────────────────────────────────────────────────────
// Ход Schnitt (часть 42): 1 сверху (лучше = выше), пунктир — цель, точка — день с оценкой.
// Цвет — currentColor: карточка задаёт цвет текста (предмета или акцента), график его берёт.
// wide — подписать все даты (ПК), иначе первую и последнюю.
// ─────────────────────────────────────────────────────────────
const SchnittChart = ({ points, ziel, wide = false }) => {
  const W = wide ? 560 : 318;
  const bottom = scaleBottom(points, ziel);
  const y = (v) => ((v - 1) / (bottom - 1)) * H;
  const x = (i) => LEFT + (points.length > 1 ? ((W - LEFT) * i) / (points.length - 1) : (W - LEFT) / 2);
  const lines = Array.from({ length: bottom }, (_, i) => i + 1);
  const path = points.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(" ");
  const showDate = (i) => wide || i === 0 || i === points.length - 1;
  const anchor = (i) => (wide ? "middle" : i === 0 ? "start" : "end");

  return (
    <svg viewBox={`0 -8 ${W} ${H + BOTTOM + 8}`} className="block h-auto w-full overflow-visible" role="img" aria-label={translate("Verlauf")}>
      {lines.map((v) => (
        <g key={v}>
          <line x1={LEFT} x2={W} y1={y(v)} y2={y(v)} stroke="currentColor" strokeOpacity="0.16" />
          <text x="0" y={y(v) + 4} fill="currentColor" opacity="0.6" className="text-small font-extrabold">{v}</text>
        </g>
      ))}
      {ziel != null && (
        <g>
          <line x1={LEFT} x2={W} y1={y(ziel)} y2={y(ziel)} stroke="currentColor" strokeWidth="1.6" strokeDasharray="5 4" />
          <text x={LEFT + 4} y={y(ziel) - 7} fill="currentColor" className="text-small font-extrabold">{translate("Ziel {note}", { note: noteNumber(ziel) })}</text>
        </g>
      )}
      <path d={path} fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <g key={p.date}>
          <circle cx={x(i)} cy={y(p.value)} r={i === points.length - 1 ? 5.5 : 3.6} fill="currentColor" />
          {showDate(i) && (
            <text x={wide ? x(i) : i === 0 ? LEFT : W} y={H + 20} textAnchor={anchor(i)} fill="currentColor" opacity="0.75" className="text-small font-bold">
              {dotDate(p.date)}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
};

// Мини-график на плитке «Schnitt»: только линия и последняя точка
export const Sparkline = ({ points }) => {
  const W = 70;
  const SH = 22;
  const values = points.map((p) => p.value);
  const lo = Math.min(...values) - 0.1;
  const hi = Math.max(...values) + 0.1;
  const y = (v) => ((v - lo) / (hi - lo)) * SH;
  const x = (i) => (W * i) / (points.length - 1);
  const path = points.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`-4 -4 ${W + 8} ${SH + 8}`} className="h-7.5 w-20 shrink overflow-visible text-accent" aria-hidden="true">
      <path d={path} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={W} cy={y(values.at(-1))} r="3.4" fill="currentColor" />
    </svg>
  );
};

export default SchnittChart;
