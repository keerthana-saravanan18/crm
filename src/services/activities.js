import { supabase } from '../lib/supabase.js'
import { createOrganizationRow, deleteOrganizationRow, getOrganizationRows } from './organization.js'

export async function getActivities() {
  if (!supabase) {
    return []
  }

  return getOrganizationRows('activities', 'activity_date')
}

export async function createActivity(activity) {
  return createOrganizationRow('activities', activity)
}

export async function deleteActivity(id) {
  return deleteOrganizationRow('activities', id)
}
