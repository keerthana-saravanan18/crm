import { useEffect, useMemo, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import EmptyState from '../components/common/EmptyState.jsx'
import StatusBadge from '../components/common/StatusBadge.jsx'
import { createDeal, deleteDeal, getDeals, updateDeal } from '../services/deals.js'

const emptyForm = {
  title: '',
  customer: '',
  lead: '',
  deal_value: 0,
  deal_stage: 'Qualification',
  expected_closing_date: '',
  assigned_user: 'Alex Morgan',
  notes: '',
}

function DealsPage() {
  const [deals, setDeals] = useState([])
  const [selectedDeal, setSelectedDeal] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadDeals()
  }, [])

  async function loadDeals() {
    try {
      setLoading(true)
      const data = await getDeals()
      setDeals(data)
    } catch (loadError) {
      setError(loadError.message)
    } finally {
      setLoading(false)
    }
  }

  const pipelineTotal = useMemo(() => deals.reduce((sum, deal) => sum + Number(deal.deal_value || 0), 0), [deals])
  const wonDeals = deals.filter((deal) => deal.deal_stage === 'Won')
  const lostDeals = deals.filter((deal) => deal.deal_stage === 'Lost')

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const resetForm = () => {
    setForm(emptyForm)
    setSelectedDeal(null)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!form.title || !form.customer) {
      setError('Deal title and customer are required.')
      return
    }

    try {
      setSaving(true)
      setError('')

      if (selectedDeal) {
        await updateDeal(selectedDeal.id, { ...form, deal_value: Number(form.deal_value || 0) })
      } else {
        await createDeal({ ...form, deal_value: Number(form.deal_value || 0) })
      }

      resetForm()
      await loadDeals()
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (deal) => {
    setSelectedDeal(deal)
    setForm({
      title: deal.title || '',
      customer: deal.customer || '',
      lead: deal.lead || '',
      deal_value: deal.deal_value || 0,
      deal_stage: deal.deal_stage || 'Qualification',
      expected_closing_date: deal.expected_closing_date || '',
      assigned_user: deal.assigned_user || 'Alex Morgan',
      notes: deal.notes || '',
    })
  }

  const handleDelete = async (dealId) => {
    if (!window.confirm('Delete this deal?')) {
      return
    }

    try {
      await deleteDeal(dealId)
      await loadDeals()
    } catch (deleteError) {
      setError(deleteError.message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Pipeline value</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">${pipelineTotal.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Won deals</p>
          <p className="mt-2 text-3xl font-bold text-emerald-700">{wonDeals.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Lost deals</p>
          <p className="mt-2 text-3xl font-bold text-rose-700">{lostDeals.length}</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr,0.8fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          {loading ? (
            <div className="p-6 text-sm text-slate-500">Loading deals…</div>
          ) : deals.length ? (
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 font-medium text-slate-600">Deal</th>
                    <th className="px-4 py-3 font-medium text-slate-600">Stage</th>
                    <th className="px-4 py-3 font-medium text-slate-600">Value</th>
                    <th className="px-4 py-3 font-medium text-slate-600">Closing</th>
                    <th className="px-4 py-3 font-medium text-slate-600 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {deals.map((deal) => (
                    <tr key={deal.id}>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-800">{deal.title}</p>
                        <p className="text-xs text-slate-500">{deal.customer}</p>
                      </td>
                      <td className="px-4 py-3"><StatusBadge label={deal.deal_stage || 'Qualification'} tone={deal.deal_stage === 'Won' ? 'success' : deal.deal_stage === 'Lost' ? 'danger' : 'info'} /></td>
                      <td className="px-4 py-3 text-slate-700">${Number(deal.deal_value || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-slate-600">{deal.expected_closing_date || 'N/A'}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => handleEdit(deal)} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"><Pencil size={15} /></button>
                          <button type="button" onClick={() => handleDelete(deal.id)} className="rounded-lg border border-rose-200 p-2 text-rose-600 hover:bg-rose-50"><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState title="No deals created" message="Start by adding a new opportunity for a customer or lead." />
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">{selectedDeal ? 'Edit deal' : 'Add deal'}</h3>
            {selectedDeal ? <button type="button" onClick={resetForm} className="text-sm font-medium text-slate-500">Cancel</button> : null}
          </div>

          {error ? <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div> : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Deal title</label>
              <input name="title" value={form.title} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-slate-400" required />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Customer</label>
                <input name="customer" value={form.customer} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-slate-400" required />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Lead</label>
                <input name="lead" value={form.lead} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-slate-400" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Deal value</label>
                <input type="number" name="deal_value" value={form.deal_value} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-slate-400" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Stage</label>
                <select name="deal_stage" value={form.deal_stage} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-slate-400">
                  <option value="Qualification">Qualification</option>
                  <option value="Proposal">Proposal</option>
                  <option value="Negotiation">Negotiation</option>
                  <option value="Won">Won</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Expected close</label>
                <input type="date" name="expected_closing_date" value={form.expected_closing_date} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-slate-400" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Assigned user</label>
                <input name="assigned_user" value={form.assigned_user} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-slate-400" />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Notes</label>
              <textarea name="notes" value={form.notes} onChange={handleChange} rows="4" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-slate-400" />
            </div>

            <button type="submit" disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">
              <Plus size={16} />
              {saving ? 'Saving...' : selectedDeal ? 'Update deal' : 'Add deal'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default DealsPage
