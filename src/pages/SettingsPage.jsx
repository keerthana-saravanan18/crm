function SettingsPage() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">Workspace settings</h3>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-700">Organization</p>
          <p className="mt-2 text-sm text-slate-600">Crest Labs</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-700">Default timezone</p>
          <p className="mt-2 text-sm text-slate-600">UTC-05:00</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-700">Team members</p>
          <p className="mt-2 text-sm text-slate-600">12 active users</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-700">Supabase status</p>
          <p className="mt-2 text-sm text-slate-600">Awaiting project configuration</p>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
