import { useEffect, useMemo, useState } from 'react'
import { Pencil, Plus, Search, Trash2, UserRoundCheck } from 'lucide-react'
import EmptyState from '../components/common/EmptyState.jsx'
import StatusBadge from '../components/common/StatusBadge.jsx'
import { convertLeadToCustomer, createLead, deleteLead, getLeads, updateLead } from '../services/leads.js'

const emptyForm = {
  full_name: '',
  email: '',
  phone: '',
  company: '',
  lead_source: 'Website',
  status: 'New',
  assigned_user: 'Alex Morgan',
  estimated_deal_value: 0,
  notes: '',
}

function LeadsPage() {
  const [leads, setLeads] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [selectedLead, setSelectedLead] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadLeads()
  }, [])

  async function loadLeads() {
    try {
      setLoading(true)
      const data = await getLeads()
      setLeads(data)
    } catch (loadError) {
      setError(loadError.message)
    } finally {
      setLoading(false)
    }
  }

  const filteredLeads = useMemo(() => {
    const query = search.trim().toLowerCase()

    return [...leads]
      .filter((lead) => {
        const matchesSearch = !query || [lead.full_name, lead.email, lead.company].some((value) => (value || '').toLowerCase().includes(query))
        const matchesStatus = statusFilter === 'All' || lead.status === statusFilter
        return matchesSearch && matchesStatus
      })
      .sort((a, b) => (a.created_at || '').localeCompare(b.created_at || ''))
  }, [leads, search, statusFilter])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const resetForm = () => {
    setForm(emptyForm)
    setSelectedLead(null)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!form.full_name || !form.email || !form.company) {
      setError('Full name, email, and company are required.')
      return
    }

    try {
      setSaving(true)
      setError('')

      if (selectedLead) {
        await updateLead(selectedLead.id, { ...form, estimated_deal_value: Number(form.estimated_deal_value || 0) })
      } else {
        await createLead({ ...form, estimated_deal_value: Number(form.estimated_deal_value || 0) })
      }

      resetForm()
      await loadLeads()
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (lead) => {
    setSelectedLead(lead)
    setForm({
      full_name: lead.full_name || '',
      email: lead.email || '',
      phone: lead.phone || '',
      company: lead.company || '',
      lead_source: lead.lead_source || 'Website',
      status: lead.status || 'New',
      assigned_user: lead.assigned_user || 'Alex Morgan',
      estimated_deal_value: lead.estimated_deal_value || 0,
      notes: lead.notes || '',
    })
  }

  const handleDelete = async (leadId) => {
    if (!window.confirm('Delete this lead?')) {
      return
    }

    try {
      await deleteLead(leadId)
      await loadLeads()
    } catch (deleteError) {
      setError(deleteError.message)
    }
  }

  const handleConvert = async (lead) => {
    if (lead.status === 'Converted') {
      setError('This lead has already been converted.')
      return
    }

    try {
      await convertLeadToCustomer(lead)
      await loadLeads()
    } catch (convertError) {
      setError(convertError.message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.5fr,0.9fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Lead pipeline</h3>
            <div className="flex flex-col gap-2 md:flex-row">
              <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
                <Search size={15} />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search lead"
                  className="w-full border-0 bg-transparent text-sm outline-none placeholder:text-slate-400 md:w-40"
                />
              </label>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none"
              >
                <option value="All">All status</option>
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Converted">Converted</option>
                <option value="Lost">Lost</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">Loading leads…</div>
          ) : filteredLeads.length ? (
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 font-medium text-slate-600">Lead</th>
                    <th className="px-4 py-3 font-medium text-slate-600">Status</th>
                    <th className="px-4 py-3 font-medium text-slate-600">Value</th>
                    <th className="px-4 py-3 font-medium text-slate-600 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id}>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-800">{lead.full_name}</p>
                        <p className="text-xs text-slate-500">{lead.company}</p>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge label={lead.status || 'New'} tone={lead.status === 'Qualified' ? 'info' : lead.status === 'Converted' ? 'success' : lead.status === 'Lost' ? 'danger' : 'neutral'} />
                      </td>
                      <td className="px-4 py-3 text-slate-700">${Number(lead.estimated_deal_value || 0).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => handleEdit(lead)} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50">
                            <Pencil size={15} />
                          </button>
                          <button type="button" onClick={() => handleConvert(lead)} className="rounded-lg border border-emerald-200 p-2 text-emerald-600 hover:bg-emerald-50">
                            <UserRoundCheck size={15} />
                          </button>
                          <button type="button" onClick={() => handleDelete(lead.id)} className="rounded-lg border border-rose-200 p-2 text-rose-600 hover:bg-rose-50">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState title="No leads found" message="Add a new lead to fill the sales pipeline." />
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">{selectedLead ? 'Edit lead' : 'Add lead'}</h3>
            {selectedLead ? <button type="button" onClick={resetForm} className="text-sm font-medium text-slate-500">Cancel</button> : null}
          </div>

          {error ? <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div> : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Full name</label>
              <input name="full_name" value={form.full_name} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-slate-400" required />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-slate-400" required />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Phone</label>
                <input name="phone" value={form.phone} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-slate-400" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Company</label>
                <input name="company" value={form.company} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-slate-400" required />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Lead source</label>
                <select name="lead_source" value={form.lead_source} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-slate-400">
                  <option value="Website">Website</option>
                  <option value="Referral">Referral</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Outbound">Outbound</option>
                </select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Status</label>
                <select name="status" value={form.status} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-slate-400">
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Converted">Converted</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Assigned user</label>
                <input name="assigned_user" value={form.assigned_user} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-slate-400" />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Estimated deal value</label>
              <input type="number" name="estimated_deal_value" value={form.estimated_deal_value} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-slate-400" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Notes</label>
              <textarea name="notes" value={form.notes} onChange={handleChange} rows="4" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-slate-400" />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Plus size={16} />
              {saving ? 'Saving...' : selectedLead ? 'Update lead' : 'Add lead'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LeadsPage
