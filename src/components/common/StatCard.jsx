function StatCard({ title, value, hint, icon: Icon, tone = 'neutral' }) {
  const styles = {
    neutral: 'bg-white border-slate-200',
    blue: 'bg-blue-50 border-blue-100',
    green: 'bg-emerald-50 border-emerald-100',
    amber: 'bg-amber-50 border-amber-100',
    purple: 'bg-violet-50 border-violet-100',
  }

  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${styles[tone] || styles.neutral}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>
        </div>
        <div className="rounded-xl bg-white p-2 text-slate-700 shadow-sm">
          {Icon ? <Icon size={18} /> : null}
        </div>
      </div>
      <p className="mt-4 text-xs text-slate-500">{hint}</p>
    </div>
  )
}

export default StatCard
