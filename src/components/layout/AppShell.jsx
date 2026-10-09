import { NavLink } from 'react-router-dom'
import {
  Activity,
  BarChart3,
  Bell,
  BriefcaseBusiness,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Search,
  Settings,
  UserCircle2,
  Users,
} from 'lucide-react'

const navigation = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Customers', path: '/customers', icon: Users },
  { label: 'Leads', path: '/leads', icon: BriefcaseBusiness },
  { label: 'Deals', path: '/deals', icon: BarChart3 },
  { label: 'Tasks', path: '/tasks', icon: ClipboardList },
  { label: 'Activities', path: '/activities', icon: Activity },
  { label: 'Reports', path: '/reports', icon: BarChart3 },
  { label: 'Settings', path: '/settings', icon: Settings },
]

function AppShell({ children, title = 'Dashboard', actionLabel, onAction, userName = 'Alex Morgan', onLogout }) {
  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-900">
      <aside className="hidden w-72 flex-col border-r border-slate-200 bg-white p-5 lg:flex">
        <div className="flex items-center gap-3 px-2 pb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-lg font-bold text-white">C</div>
          <div>
            <p className="text-lg font-bold text-slate-900">Crest CRM</p>
            <p className="text-xs text-slate-500">Operations Suite</p>
          </div>
        </div>

        <nav className="mt-4 space-y-1">
          {navigation.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={label}
              to={path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              <Icon size={16} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto rounded-2xl bg-slate-50 p-4">
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1">
        <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">Overview</p>
              <h1 className="mt-1 text-2xl font-semibold text-slate-900">{title}</h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-500 md:flex">
                <Search size={15} />
                <input
                  type="text"
                  placeholder="Search"
                  className="w-40 border-0 bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
              </div>
              <button type="button" className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-100">
                <Bell size={16} />
              </button>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 py-1.5">
                <UserCircle2 size={20} className="text-slate-500" />
                <div className="hidden text-left sm:block">
                  <p className="text-sm font-medium text-slate-900">{userName}</p>
                  <p className="text-[10px] uppercase tracking-wide text-slate-400">Owner</p>
                </div>
              </div>
              {actionLabel ? (
                <button
                  type="button"
                  onClick={onAction}
                  className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
                >
                  {actionLabel}
                </button>
              ) : null}
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  )
}

export default AppShell
