import { useEffect, useMemo, useState } from 'react'
import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import EmptyState from '../components/common/EmptyState.jsx'
import StatusBadge from '../components/common/StatusBadge.jsx'
import { createCustomer, deleteCustomer, getCustomers, updateCustomer } from '../services/customers.js'

const emptyForm = {
  full_name: '',
  email: '',
  phone_number: '',
  company: '',
  job_title: '',
  customer_status: 'Active',
  notes: '',
}

function CustomersPage() {
  const [customers, setCustomers] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [companyFilter, setCompanyFilter] = useState('All')
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadCustomers()
  }, [])

  async function loadCustomers() {
    try {
      setLoading(true)
      const data = await getCustomers()
      setCustomers(data)
    } catch (loadError) {
      setError(loadError.message)
    } finally {
      setLoading(false)
    }
  }

  const companyOptions = useMemo(() => ['All', ...new Set(customers.map((customer) => customer.company).filter(Boolean))], [customers])

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase()

    return [...customers]
      .filter((customer) => {
        const matchesSearch = !query || [customer.full_name, customer.email, customer.company].some((value) => (value || '').toLowerCase().includes(query))
        const matchesStatus = statusFilter === 'All' || customer.customer_status === statusFilter
        const matchesCompany = companyFilter === 'All' || customer.company === companyFilter
        return matchesSearch && matchesStatus && matchesCompany
      })
      .sort((a, b) => (a.full_name || '').localeCompare(b.full_name || ''))
  }, [customers, search, statusFilter, companyFilter])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const resetForm = () => {
    setForm(emptyForm)
    setSelectedCustomer(null)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const trimmedEmail = form.email.trim()

    if (!form.full_name || !form.email || !form.company || !form.customer_status) {
      setError('Full name, email, company and customer status are required.')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Please enter a valid email address.')
      return
    }

    try {
      setSaving(true)
      setError('')

      if (selectedCustomer) {
        await updateCustomer(selectedCustomer.id, {
          ...form,
          email: trimmedEmail,
        })
      } else {
        await createCustomer({
          ...form,
          email: trimmedEmail,
        })
      }

      resetForm()
      await loadCustomers()
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (customer) => {
    setSelectedCustomer(customer)
    setForm({
      full_name: customer.full_name || '',
      email: customer.email || '',
      phone_number: customer.phone_number || '',
      company: customer.company || '',
      job_title: customer.job_title || '',
      customer_status: customer.customer_status || 'Active',
      notes: customer.notes || '',
    })
  }

  const handleDelete = async (customerId) => {
    if (!window.confirm('Delete this customer record? This cannot be undone.')) {
      return
    }

    try {
      await deleteCustomer(customerId)
      await loadCustomers()
    } catch (deleteError) {
      setError(deleteError.message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.6fr,0.9fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Customer directory</h3>
            <div className="flex flex-col gap-2 md:flex-row">
              <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
                <Search size={15} />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search customers"
                  className="w-full border-0 bg-transparent text-sm outline-none placeholder:text-slate-400 md:w-40"
                />
              </label>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none"
              >
                <option value="All">All status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Prospect">Prospect</option>
              </select>
              <select
                value={companyFilter}
                onChange={(event) => setCompanyFilter(event.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none"
              >
                {companyOptions.map((company) => (
                  <option key={company} value={company}>{company === 'All' ? 'All companies' : company}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">Loading customers…</div>
          ) : filteredCustomers.length ? (
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 font-medium text-slate-600">Name</th>
                    <th className="px-4 py-3 font-medium text-slate-600">Company</th>
                    <th className="px-4 py-3 font-medium text-slate-600">Status</th>
                    <th className="px-4 py-3 font-medium text-slate-600">Email</th>
                    <th className="px-4 py-3 font-medium text-slate-600 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="align-top">
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-800">{customer.full_name}</p>
                        <p className="text-xs text-slate-500">{customer.job_title || 'Customer'}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{customer.company}</td>
                      <td className="px-4 py-3">
                        <StatusBadge label={customer.customer_status || 'Active'} tone={customer.customer_status === 'Inactive' ? 'warning' : 'success'} />
                      </td>
                      <td className="px-4 py-3 text-slate-600">{customer.email}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => handleEdit(customer)} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50">
                            <Pencil size={15} />
                          </button>
                          <button type="button" onClick={() => handleDelete(customer.id)} className="rounded-lg border border-rose-200 p-2 text-rose-600 hover:bg-rose-50">
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
            <EmptyState title="No customers found" message="Use the form to add the first customer record or change your filters." />
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">{selectedCustomer ? 'Edit customer' : 'Add customer'}</h3>
            {selectedCustomer ? (
              <button type="button" onClick={resetForm} className="text-sm font-medium text-slate-500">Cancel</button>
            ) : null}
          </div>

          {error ? <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div> : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Full name</label>
              <input name="full_name" value={form.full_name} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-slate-400" required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-slate-400" required />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Phone</label>
                <input name="phone_number" value={form.phone_number} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-slate-400" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Status</label>
                <select name="customer_status" value={form.customer_status} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-slate-400">
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Prospect">Prospect</option>
                </select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Company</label>
                <input name="company" value={form.company} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-slate-400" required />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Job title</label>
                <input name="job_title" value={form.job_title} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-slate-400" />
              </div>
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
              {saving ? 'Saving...' : selectedCustomer ? 'Update customer' : 'Add customer'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CustomersPage
