export default function StatCard({ title, value, hint, icon, accent = 'from-sky-500 to-cyan-400' }) {
  return (
    <div className="glass-panel relative overflow-hidden p-5">
      <div className={`absolute right-0 top-0 h-20 w-20 rounded-full bg-gradient-to-br ${accent} opacity-15 blur-2xl`} />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium theme-subtitle">{title}</p>
          <p className="metric-value mt-2 theme-heading">{value}</p>
          {hint ? <p className="mt-2 text-xs theme-subtitle">{hint}</p> : null}
        </div>
        <div className={`rounded-2xl bg-gradient-to-br ${accent} p-3 text-white shadow-lg`}>{icon}</div>
      </div>
    </div>
  );
}
