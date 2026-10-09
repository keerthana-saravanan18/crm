import { supabase } from '../lib/supabase.js'
import { createOrganizationRow, deleteOrganizationRow, getOrganizationRows, updateOrganizationRow } from './organization.js'

export async function getTasks() {
  if (!supabase) {
    return []
  }

  return getOrganizationRows('tasks', 'due_date', true)
}

export async function createTask(task) {
  return createOrganizationRow('tasks', task)
}

export async function updateTask(id, updates) {
  const taskValues = { ...updates }
  delete taskValues.organization_id
  return updateOrganizationRow('tasks', id, taskValues)
}

export async function deleteTask(id) {
  return deleteOrganizationRow('tasks', id)
}
