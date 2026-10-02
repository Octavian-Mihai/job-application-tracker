function Card({ label, value, hint }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-semibold">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

export default function SummaryCards({ stats }) {
  const pct = stats ? `${Math.round(stats.response_rate * 100)}%` : '–';
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card label="Total applied" value={stats?.total ?? '–'} />
      <Card label="Interviewing" value={stats?.interviewing ?? '–'} />
      <Card label="Response rate" value={pct} hint="Anything past Applied, excluding withdrawn" />
    </div>
  );
}
