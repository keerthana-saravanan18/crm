import { supabase } from '../lib/supabase.js'
import { createOrganizationRow, deleteOrganizationRow, getOrganizationRows, updateOrganizationRow } from './organization.js'

export async function getCustomers() {
  if (!supabase) {
    return []
  }

  return getOrganizationRows('customers', 'created_at')
}

export async function createCustomer(customer) {
  return createOrganizationRow('customers', customer)
}

export async function updateCustomer(id, updates) {
  return updateOrganizationRow('customers', id, customerUpdates(updates))
}

export async function deleteCustomer(id) {
  return deleteOrganizationRow('customers', id)
}

function customerUpdates(updates) {
  const customerValues = { ...updates }
  delete customerValues.organization_id
  return customerValues
}
