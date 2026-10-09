import { supabase, normalizeError } from '../lib/supabase.js'

export async function getCurrentOrganizationId() {
  if (!supabase) {
    throw new Error('Supabase is not configured.')
  }

  const { data: userResult, error: userError } = await supabase.auth.getUser()

  if (userError) {
    throw new Error(normalizeError(userError))
  }

  if (!userResult.user) {
    throw new Error('Sign in to access your CRM organization.')
  }

  const { data: membership, error } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', userResult.user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw new Error(normalizeError(error))
  }

  if (!membership) {
    throw new Error('Your account is not a member of a CRM organization.')
  }

  return membership.organization_id
}

export async function getOrganizationRows(table, orderBy, ascending = false) {
  if (!supabase) {
    return []
  }

  const organizationId = await getCurrentOrganizationId()
  let query = supabase.from(table).select('*').eq('organization_id', organizationId)

  if (orderBy) {
    query = query.order(orderBy, { ascending })
  }

  const { data, error } = await query

  if (error) {
    throw new Error(normalizeError(error))
  }

  return data || []
}

export async function createOrganizationRow(table, values) {
  if (!supabase) {
    throw new Error('Supabase is not configured.')
  }

  const organizationId = await getCurrentOrganizationId()
  const { data, error } = await supabase
    .from(table)
    .insert([{ ...values, organization_id: organizationId }])
    .select()
    .single()

  if (error) {
    throw new Error(normalizeError(error))
  }

  return data
}

export async function updateOrganizationRow(table, id, values) {
  if (!supabase) {
    throw new Error('Supabase is not configured.')
  }

  const organizationId = await getCurrentOrganizationId()
  const { data, error } = await supabase
    .from(table)
    .update({ ...values, organization_id: organizationId })
    .eq('id', id)
    .eq('organization_id', organizationId)
    .select()
    .single()

  if (error) {
    throw new Error(normalizeError(error))
  }

  return data
}

export async function deleteOrganizationRow(table, id) {
  if (!supabase) {
    throw new Error('Supabase is not configured.')
  }

  const organizationId = await getCurrentOrganizationId()
  const { error } = await supabase
    .from(table)
    .delete()
    .eq('id', id)
    .eq('organization_id', organizationId)

  if (error) {
    throw new Error(normalizeError(error))
  }
}