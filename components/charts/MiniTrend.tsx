'use client';

type MiniTrendProps = {
  data?: number[];
  color: string;
  direction?: 'up' | 'down' | 'wave';
};

function buildPath(pts: [number, number][]): string {
  return pts
    .map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x},${y}`)
    .join(' ');
}

export default function MiniTrend({ data, color, direction = 'up' }: MiniTrendProps) {
  const W = 60;
  const H = 30;
  const pad = 3;

  let points: [number, number][];

  if (data && data.length > 1) {
    const max = Math.max(...data, 1);
    const min = Math.min(...data, 0);
    const range = max - min || 1;
    points = data.map((v, i) => [
      pad + (i / (data.length - 1)) * (W - pad * 2),
      pad + (H - pad * 2) - ((v - min) / range) * (H - pad * 2),
    ]);
  } else if (direction === 'up') {
    points = [
      [pad, H - pad],
      [W * 0.3, H * 0.65],
      [W * 0.55, H * 0.45],
      [W * 0.75, H * 0.3],
      [W - pad, pad + 2],
    ];
  } else if (direction === 'down') {
    points = [
      [pad, pad + 2],
      [W * 0.25, H * 0.3],
      [W * 0.5, H * 0.5],
      [W * 0.75, H * 0.65],
      [W - pad, H - pad],
    ];
  } else {
    // wave
    points = [
      [pad, H / 2],
      [W * 0.2, H * 0.25],
      [W * 0.4, H * 0.65],
      [W * 0.6, H * 0.2],
      [W * 0.8, H * 0.55],
      [W - pad, H / 2],
    ];
  }

  const pathD = buildPath(points);

  // Area fill
  const firstX = points[0]?.[0] ?? 0;
  const lastX = points[points.length - 1]?.[0] ?? W;
  const areaD = `${pathD} L${lastX},${H - pad} L${firstX},${H - pad} Z`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width={W}
      height={H}
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      <defs>
        <linearGradient id={`mt-grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={areaD}
        fill={`url(#mt-grad-${color.replace('#', '')})`}
      />
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
