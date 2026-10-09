import { useEffect, useMemo, useState } from 'react'
import { Activity, ArrowUpRight, BriefcaseBusiness, CheckCircle2, ClipboardList, Users } from 'lucide-react'
import StatCard from '../components/common/StatCard.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import { getDashboardData } from '../services/dashboard.js'

function DashboardPage() {
  const [dashboard, setDashboard] = useState({ customers: [], leads: [], deals: [], tasks: [], activities: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    const loadData = async () => {
      try {
        setLoading(true)
        const data = await getDashboardData()
        if (mounted) {
          setDashboard(data)
        }
      } catch (loadError) {
        if (mounted) {
          setError(loadError.message || 'Unable to load dashboard data.')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadData()

    return () => {
      mounted = false
    }
  }, [])

  const stats = useMemo(() => {
    const totalCustomers = dashboard.customers.length
    const totalLeads = dashboard.leads.length
    const activeDeals = dashboard.deals.filter((deal) => !['Won', 'Lost'].includes(deal.deal_stage)).length
    const pendingTasks = dashboard.tasks.filter((task) => task.status !== 'Completed').length

    return {
      totalCustomers,
      totalLeads,
      activeDeals,
      pendingTasks,
    }
  }, [dashboard])

  const customerGrowth = [42, 56, 68, 72, 94, 102]
  const leadStatusData = [
    { label: 'New', value: dashboard.leads.filter((lead) => lead.status === 'New').length },
    { label: 'Qualified', value: dashboard.leads.filter((lead) => lead.status === 'Qualified').length },
    { label: 'Converted', value: dashboard.leads.filter((lead) => lead.status === 'Converted').length },
    { label: 'Lost', value: dashboard.leads.filter((lead) => lead.status === 'Lost').length },
  ]

  const pipelineTotal = dashboard.deals.reduce((sum, deal) => sum + Number(deal.deal_value || 0), 0)

  if (loading) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">Loading dashboard…</div>
  }

  if (error) {
    return <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">{error}</div>
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Customers" value={stats.totalCustomers} hint="Across all active accounts" icon={Users} tone="blue" />
        <StatCard title="Total Leads" value={stats.totalLeads} hint="Qualified pipeline coverage" icon={BriefcaseBusiness} tone="purple" />
        <StatCard title="Active Deals" value={stats.activeDeals} hint={`$${pipelineTotal.toLocaleString()} in pipeline`} icon={ArrowUpRight} tone="green" />
        <StatCard title="Pending Tasks" value={stats.pendingTasks} hint="Tasks still requiring action" icon={ClipboardList} tone="amber" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr,1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Customer growth</h3>
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">6 months</span>
          </div>
          <div className="flex h-48 items-end gap-3">
            {customerGrowth.map((value, index) => (
              <div key={index} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-xl bg-slate-900"
                  style={{ height: `${(value / 110) * 100}%`, minHeight: '28px' }}
                />
                <span className="text-[10px] uppercase text-slate-400">M{index + 1}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Leads by status</h3>
          <div className="space-y-4">
            {leadStatusData.map((item) => (
              <div key={item.label}>
                <div className="mb-1 flex items-center justify-between text-sm text-slate-600">
                  <span>{item.label}</span>
                  <span className="font-medium text-slate-900">{item.value}</span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-100">
                  <div
                    className="h-2.5 rounded-full bg-slate-900"
                    style={{ width: `${Math.max((item.value / Math.max(dashboard.leads.length, 1)) * 100, item.value ? 12 : 0)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Recent customers</h3>
            <button type="button" className="text-sm font-medium text-slate-500">View all</button>
          </div>

          {dashboard.customers.length ? (
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 font-medium text-slate-600">Name</th>
                    <th className="px-4 py-3 font-medium text-slate-600">Company</th>
                    <th className="px-4 py-3 font-medium text-slate-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {dashboard.customers.slice(0, 4).map((customer) => (
                    <tr key={customer.id}>
                      <td className="px-4 py-3 font-medium text-slate-800">{customer.full_name}</td>
                      <td className="px-4 py-3 text-slate-600">{customer.company}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                          {customer.customer_status || 'Active'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState title="No customers yet" message="Your CRM will show customer details here once records are added." />
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Upcoming tasks</h3>
            <CheckCircle2 size={18} className="text-emerald-600" />
          </div>
          <div className="space-y-3">
            {dashboard.tasks.length ? (
              dashboard.tasks.slice(0, 4).map((task) => (
                <div key={task.id} className="rounded-xl border border-slate-200 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-slate-800">{task.title}</p>
                    <span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-semibold uppercase text-amber-700">{task.priority}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">Due {task.due_date || 'Not set'}</p>
                </div>
              ))
            ) : (
              <EmptyState title="No tasks scheduled" message="There are no pending tasks to display." />
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Recent activities</h3>
          <Activity size={18} className="text-slate-600" />
        </div>
        {dashboard.activities.length ? (
          <div className="space-y-3">
            {dashboard.activities.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 rounded-xl border border-slate-200 p-3">
                <div className="mt-1 rounded-full bg-slate-100 p-2 text-slate-600">
                  <Activity size={14} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-slate-800">{activity.title}</p>
                    <span className="text-xs text-slate-400">{new Date(activity.activity_date || activity.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{activity.description}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No recent activity" message="Customer interactions and follow-ups will appear here once logged." />
        )}
      </div>
    </div>
  )
}

export default DashboardPage
