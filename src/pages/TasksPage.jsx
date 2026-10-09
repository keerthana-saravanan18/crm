import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Pencil, Plus, Trash2 } from 'lucide-react'
import EmptyState from '../components/common/EmptyState.jsx'
import StatusBadge from '../components/common/StatusBadge.jsx'
import { createTask, deleteTask, getTasks, updateTask } from '../services/tasks.js'

const emptyForm = {
  title: '',
  description: '',
  due_date: '',
  priority: 'Medium',
  status: 'Pending',
  assigned_user: 'Alex Morgan',
  related_customer: '',
  related_lead: '',
}

function TasksPage() {
  const [tasks, setTasks] = useState([])
  const [selectedTask, setSelectedTask] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [statusFilter, setStatusFilter] = useState('All')
  const [priorityFilter, setPriorityFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadTasks()
  }, [])

  async function loadTasks() {
    try {
      setLoading(true)
      const data = await getTasks()
      setTasks(data)
    } catch (loadError) {
      setError(loadError.message)
    } finally {
      setLoading(false)
    }
  }

  const filteredTasks = useMemo(() => {
    return [...tasks].filter((task) => {
      const matchesStatus = statusFilter === 'All' || task.status === statusFilter
      const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter
      return matchesStatus && matchesPriority
    })
  }, [tasks, statusFilter, priorityFilter])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const resetForm = () => {
    setForm(emptyForm)
    setSelectedTask(null)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!form.title || !form.due_date) {
      setError('Task title and due date are required.')
      return
    }

    try {
      setSaving(true)
      setError('')

      if (selectedTask) {
        await updateTask(selectedTask.id, form)
      } else {
        await createTask(form)
      }

      resetForm()
      await loadTasks()
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (task) => {
    setSelectedTask(task)
    setForm({
      title: task.title || '',
      description: task.description || '',
      due_date: task.due_date || '',
      priority: task.priority || 'Medium',
      status: task.status || 'Pending',
      assigned_user: task.assigned_user || 'Alex Morgan',
      related_customer: task.related_customer || '',
      related_lead: task.related_lead || '',
    })
  }

  const handleDelete = async (taskId) => {
    if (!window.confirm('Delete this task?')) {
      return
    }

    try {
      await deleteTask(taskId)
      await loadTasks()
    } catch (deleteError) {
      setError(deleteError.message)
    }
  }

  const handleComplete = async (task) => {
    try {
      await updateTask(task.id, { ...task, status: 'Completed' })
      await loadTasks()
    } catch (updateError) {
      setError(updateError.message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.5fr,0.8fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Task queue</h3>
            <div className="flex gap-2">
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none">
                <option value="All">All status</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
              <select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none">
                <option value="All">All priority</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">Loading tasks…</div>
          ) : filteredTasks.length ? (
            <div className="space-y-3">
              {filteredTasks.map((task) => {
                const overdue = task.status !== 'Completed' && new Date(task.due_date) < new Date()
                return (
                  <div key={task.id} className={`rounded-xl border p-4 ${overdue ? 'border-rose-200 bg-rose-50' : 'border-slate-200 bg-slate-50'}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-800">{task.title}</p>
                        <p className="mt-1 text-sm text-slate-600">{task.description || 'No description provided.'}</p>
                      </div>
                      <StatusBadge label={task.status} tone={task.status === 'Completed' ? 'success' : task.priority === 'High' ? 'warning' : 'info'} />
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                      <span className="rounded-full bg-white px-2 py-1">Due {task.due_date}</span>
                      <span className="rounded-full bg-white px-2 py-1">Priority {task.priority}</span>
                      <span className="rounded-full bg-white px-2 py-1">Owner {task.assigned_user}</span>
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                      <button type="button" onClick={() => handleEdit(task)} className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-100"><Pencil size={15} /></button>
                      <button type="button" onClick={() => handleComplete(task)} className="rounded-lg border border-emerald-200 bg-white p-2 text-emerald-600 hover:bg-emerald-50"><CheckCircle2 size={15} /></button>
                      <button type="button" onClick={() => handleDelete(task.id)} className="rounded-lg border border-rose-200 bg-white p-2 text-rose-600 hover:bg-rose-50"><Trash2 size={15} /></button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <EmptyState title="No tasks found" message="Your upcoming and active tasks will appear here." />
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">{selectedTask ? 'Edit task' : 'Add task'}</h3>
            {selectedTask ? <button type="button" onClick={resetForm} className="text-sm font-medium text-slate-500">Cancel</button> : null}
          </div>

          {error ? <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div> : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Task title</label>
              <input name="title" value={form.title} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-slate-400" required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows="3" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-slate-400" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Due date</label>
                <input type="date" name="due_date" value={form.due_date} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-slate-400" required />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Priority</label>
                <select name="priority" value={form.priority} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-slate-400">
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Status</label>
                <select name="status" value={form.status} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-slate-400">
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Assigned user</label>
                <input name="assigned_user" value={form.assigned_user} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-slate-400" />
              </div>
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

            <button type="submit" disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">
              <Plus size={16} />
              {saving ? 'Saving...' : selectedTask ? 'Update task' : 'Add task'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default TasksPage
