"use client";

interface ScoreRingProps {
  score: number;
  size?: number;
  label?: string;
  color?: string;
}

export default function ScoreRing({
  score,
  size = 80,
  label,
  color = "#6366f1",
}: ScoreRingProps) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={8}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={8}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <div
        className="absolute flex flex-col items-center justify-center"
        style={{ width: size, height: size, marginTop: -(size + 4) }}
      >
        <span className="text-xl font-bold" style={{ color }}>
          {score}
        </span>
      </div>
      {label && (
        <span className="text-xs text-gray-500 text-center">{label}</span>
      )}
    </div>
  );
}
