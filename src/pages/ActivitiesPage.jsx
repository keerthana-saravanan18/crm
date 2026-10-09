import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import EmptyState from '../components/common/EmptyState.jsx'
import { createActivity, deleteActivity, getActivities } from '../services/activities.js'

const emptyForm = {
  title: '',
  activity_type: 'Phone call',
  description: '',
  related_customer: '',
  related_lead: '',
  activity_date: '',
  created_by: 'Alex Morgan',
}

function ActivitiesPage() {
  const [activities, setActivities] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadActivities()
  }, [])

  async function loadActivities() {
    try {
      setLoading(true)
      const data = await getActivities()
      setActivities(data)
    } catch (loadError) {
      setError(loadError.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!form.title || !form.activity_date) {
      setError('Activity title and Date are required.')
      return
    }

    try {
      setSaving(true)
      setError('')
      await createActivity(form)
      setForm(emptyForm)
      await loadActivities()
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (activityId) => {
    if (!window.confirm('Delete this activity record?')) {
      return
    }

    try {
      await deleteActivity(activityId)
      await loadActivities()
    } catch (deleteError) {
      setError(deleteError.message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Recent interactions</h3>
          {loading ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">Loading activities…</div>
          ) : activities.length ? (
            <div className="space-y-3">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 p-4">
                  <div>
                    <p className="font-medium text-slate-800">{activity.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{activity.description}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                      <span className="rounded-full bg-slate-100 px-2 py-1">{activity.activity_type}</span>
                      <span className="rounded-full bg-slate-100 px-2 py-1">{activity.activity_date}</span>
                      <span className="rounded-full bg-slate-100 px-2 py-1">By {activity.created_by}</span>
                    </div>
                  </div>
                  <button type="button" onClick={() => handleDelete(activity.id)} className="rounded-lg border border-rose-200 p-2 text-rose-600 hover:bg-rose-50">
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No activities logged" message="Track calls, meetings, and follow-ups as they happen." />
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Log activity</h3>
          {error ? <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div> : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Activity title</label>
              <input name="title" value={form.title} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-slate-400" required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Activity type</label>
              <select name="activity_type" value={form.activity_type} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-slate-400">
                <option value="Phone call">Phone call</option>
                <option value="Email">Email</option>
                <option value="Meeting">Meeting</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Note">Note</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows="3" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-slate-400" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Related customer</label>
                <input name="related_customer" value={form.related_customer} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-slate-400" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Related lead</label>
                <input name="related_lead" value={form.related_lead} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-slate-400" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Activity date</label>
                <input type="date" name="activity_date" value={form.activity_date} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-slate-400" required />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Created by</label>
                <input name="created_by" value={form.created_by} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-slate-400" />
              </div>
            </div>

            <button type="submit" disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">
              <Plus size={16} />
              {saving ? 'Saving...' : 'Add activity'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ActivitiesPage
