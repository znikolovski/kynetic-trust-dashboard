'use client';

type LineChartProps = {
  realized: number[];
  projected: number[];
  labels: string[];
};

function toPoints(data: number[], w: number, h: number, padX: number, padY: number, max: number): string {
  return data
    .map((v, i) => {
      const x = padX + (i / (data.length - 1)) * w;
      const y = padY + h - (v / max) * h;
      return `${x},${y}`;
    })
    .join(' ');
}

function toPath(data: number[], w: number, h: number, padX: number, padY: number, max: number): string {
  return data
    .map((v, i) => {
      const x = padX + (i / (data.length - 1)) * w;
      const y = padY + h - (v / max) * h;
      return `${i === 0 ? 'M' : 'L'}${x},${y}`;
    })
    .join(' ');
}

export default function LineChart({ realized, projected, labels }: LineChartProps) {
  const svgW = 560;
  const svgH = 200;
  const padX = 8;
  const padTop = 12;
  const padBottom = 28;
  const chartW = svgW - padX * 2;
  const chartH = svgH - padTop - padBottom;

  const max = Math.max(...realized, ...projected, 1) * 1.1;

  const realPath = toPath(realized, chartW, chartH, padX, padTop, max);
  const projPath = toPath(projected, chartW, chartH, padX, padTop, max);

  // Area fill path: go along realized, then close back along x-axis
  const lastX = padX + chartW;
  const baseY = padTop + chartH;
  const areaPath = `${realPath} L${lastX},${baseY} L${padX},${baseY} Z`;

  const gridLines = [0.25, 0.5, 0.75, 1.0];

  return (
    <svg
      viewBox={`0 0 ${svgW} ${svgH}`}
      width="100%"
      height={svgH}
      aria-hidden="true"
      style={{ display: 'block', overflow: 'visible' }}
    >
      <defs>
        <linearGradient id="lc-area-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00dbe9" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#00dbe9" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Horizontal grid lines */}
      {gridLines.map((pct) => {
        const y = padTop + chartH * (1 - pct);
        return (
          <line
            key={pct}
            x1={padX}
            y1={y}
            x2={svgW - padX}
            y2={y}
            stroke="rgb(255 255 255 / 6%)"
            strokeWidth={1}
          />
        );
      })}

      {/* Area fill under realized */}
      <path d={areaPath} fill="url(#lc-area-grad)" />

      {/* Projected line (dashed, muted) */}
      <polyline
        points={toPoints(projected, chartW, chartH, padX, padTop, max)}
        fill="none"
        stroke="rgb(255 255 255 / 30%)"
        strokeWidth={1.5}
        strokeDasharray="5 4"
      />

      {/* Realized line (solid cyan) */}
      <path
        d={realPath}
        fill="none"
        stroke="#00dbe9"
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* X-axis labels */}
      {labels.map((label, i) => {
        const x = padX + (i / (labels.length - 1)) * chartW;
        return (
          <text
            key={label}
            x={x}
            y={svgH - 4}
            textAnchor={i === 0 ? 'start' : i === labels.length - 1 ? 'end' : 'middle'}
            fill="rgb(185 202 203 / 70%)"
            fontSize={9}
            fontFamily="'JetBrains Mono', monospace"
            letterSpacing="0.04em"
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
}
