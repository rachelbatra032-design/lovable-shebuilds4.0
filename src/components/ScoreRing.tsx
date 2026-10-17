export function ScoreRing({ value, size = 64 }: { value: number; size?: number }) {
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  const color = value >= 75 ? "var(--success)" : value >= 45 ? "var(--terracotta)" : "var(--destructive)";
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={`${value}% documented`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--secondary)" strokeWidth={6} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={6} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold">{value}%</span>
    </div>
  );
}
