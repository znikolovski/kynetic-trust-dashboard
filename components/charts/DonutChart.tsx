'use client';

type Segment = {
  value: number;
  color: string;
  label: string;
};

type DonutChartProps = {
  segments: Segment[];
  size?: number;
  thickness?: number;
};

export default function DonutChart({ segments, size = 180, thickness = 28 }: DonutChartProps) {
  const cx = size / 2;
  const cy = size / 2;
  const r = (size - thickness) / 2;
  const circumference = 2 * Math.PI * r;

  const total = segments.reduce((sum, s) => sum + s.value, 0);

  // Build stroke-dasharray arcs — offset accumulated immutably via index slice
  const arcs = segments.map((seg, i) => {
    const frac = seg.value / total;
    const offset = segments.slice(0, i).reduce((sum, s) => sum + s.value / total, 0);
    const dash = frac * circumference;
    const gap = circumference - dash;
    // strokeDashoffset: start at top (rotate -90deg) minus accumulated offset
    const dashOffset = circumference * (0.25 - offset);
    return { ...seg, dash, gap, dashOffset };
  });

  const primarySeg = segments[0];

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      {/* Background track */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="rgb(255 255 255 / 6%)"
        strokeWidth={thickness}
      />

      {/* Segments */}
      {arcs.map((arc, i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={arc.color}
          strokeWidth={thickness - 2}
          strokeDasharray={`${arc.dash} ${arc.gap}`}
          strokeDashoffset={arc.dashOffset}
          strokeLinecap="butt"
          style={{ transition: 'stroke-dasharray 0.4s ease' }}
        />
      ))}

      {/* Center label */}
      {primarySeg && (
        <>
          <text
            x={cx}
            y={cy - 8}
            textAnchor="middle"
            fill="rgb(185 202 203 / 80%)"
            fontSize={9}
            fontFamily="'JetBrains Mono', monospace"
            letterSpacing="0.08em"
          >
            EQUITIES
          </text>
          <text
            x={cx}
            y={cy + 12}
            textAnchor="middle"
            fill="#00dbe9"
            fontSize={20}
            fontFamily="'Hanken Grotesk', system-ui, sans-serif"
            fontWeight={900}
          >
            {primarySeg.value}%
          </text>
        </>
      )}
    </svg>
  );
}
