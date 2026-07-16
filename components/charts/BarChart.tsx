'use client';

type BarChartProps = {
  data: number[];
  height?: number;
  color?: string;
};

export default function BarChart({
  data,
  height = 140,
  color = '#00dbe9',
}: BarChartProps) {
  const width = 560;
  const padX = 8;
  const padY = 12;
  const chartW = width - padX * 2;
  const chartH = height - padY * 2;

  const max = Math.max(...data, 1);
  const barCount = data.length;
  const gap = 6;
  const barW = (chartW - gap * (barCount - 1)) / barCount;

  const gridLines = [0.25, 0.5, 0.75];

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height={height}
      aria-hidden="true"
      style={{ display: 'block', overflow: 'visible' }}
    >
      <style>{`
        .sb-bar { transition: fill 0.15s; }
        .sb-bar:hover { fill: #00f0ff; filter: drop-shadow(0 0 6px rgb(0 219 233 / 60%)); }
      `}</style>

      {/* Grid lines */}
      {gridLines.map((pct) => {
        const y = padY + chartH * (1 - pct);
        return (
          <line
            key={pct}
            x1={padX}
            y1={y}
            x2={width - padX}
            y2={y}
            stroke="rgb(255 255 255 / 6%)"
            strokeWidth={1}
          />
        );
      })}

      {/* Bars */}
      {data.map((val, i) => {
        const barH = (val / max) * chartH;
        const x = padX + i * (barW + gap);
        const y = padY + chartH - barH;
        return (
          <rect
            key={i}
            className="sb-bar"
            x={x}
            y={y}
            width={barW}
            height={barH}
            rx={3}
            fill={`rgb(0 219 233 / 55%)`}
          />
        );
      })}
    </svg>
  );
}
