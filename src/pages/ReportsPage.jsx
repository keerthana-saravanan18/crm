import { BarChart3 } from 'lucide-react'

function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Revenue forecast</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">$185K</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Win rate</p>
          <p className="mt-2 text-3xl font-bold text-emerald-700">41%</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Avg. response time</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">4.2h</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <BarChart3 size={18} className="text-slate-600" />
          <h3 className="text-lg font-semibold text-slate-900">Performance overview</h3>
        </div>
        <div className="grid gap-3 md:grid-cols-6">
          {[36, 52, 44, 68, 72, 90].map((value, index) => (
            <div key={index} className="flex flex-col items-center justify-end gap-2">
              <div className="flex h-40 w-full items-end rounded-xl bg-slate-100 p-2">
                <div className="w-full rounded-xl bg-slate-900" style={{ height: `${value}%` }} />
              </div>
              <span className="text-xs text-slate-500">Q{index + 1}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ReportsPage
