import { supabase, normalizeError } from '../lib/supabase.js'
import { createOrganizationRow, deleteOrganizationRow, getOrganizationRows, updateOrganizationRow } from './organization.js'

export async function getLeads() {
  if (!supabase) {
    return []
  }

  return getOrganizationRows('leads', 'created_at')
}

export async function createLead(lead) {
  return createOrganizationRow('leads', lead)
}

export async function updateLead(id, updates) {
  const leadValues = { ...updates }
  delete leadValues.organization_id
  return updateOrganizationRow('leads', id, leadValues)
}

export async function deleteLead(id) {
  return deleteOrganizationRow('leads', id)
}

export async function convertLeadToCustomer(lead) {
  if (!supabase) {
    throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to continue.')
  }

  const { data: customerId, error } = await supabase.rpc('convert_lead_to_customer', { p_lead_id: lead.id })

  if (error) {
    throw new Error(normalizeError(error))
  }

  return customerId
}
