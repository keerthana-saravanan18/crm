import { supabase } from '../lib/supabase.js'
import { createOrganizationRow, deleteOrganizationRow, getOrganizationRows, updateOrganizationRow } from './organization.js'

export async function getDeals() {
  if (!supabase) {
    return []
  }

  return getOrganizationRows('deals', 'expected_closing_date', true)
}

export async function createDeal(deal) {
  return createOrganizationRow('deals', deal)
}

export async function updateDeal(id, updates) {
  const dealValues = { ...updates }
  delete dealValues.organization_id
  return updateOrganizationRow('deals', id, dealValues)
}

export async function deleteDeal(id) {
  return deleteOrganizationRow('deals', id)
}
