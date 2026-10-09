create schema private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;

create function private.is_organization_member(p_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.organization_members as member
    where member.organization_id = p_organization_id
      and member.user_id = (select auth.uid())
  );
$$;

revoke all on function private.is_organization_member(uuid) from public, anon;
grant execute on function private.is_organization_member(uuid) to authenticated;

alter table public.profiles alter column email drop not null;

 drop policy organizations_select_member on public.organizations;
create policy organizations_select_member on public.organizations
  for select to authenticated
  using (private.is_organization_member(id));

drop policy organization_members_select_member on public.organization_members;
create policy organization_members_select_member on public.organization_members
  for select to authenticated
  using (private.is_organization_member(organization_id));

drop policy customers_select_member on public.customers;
create policy customers_select_member on public.customers
  for select to authenticated using (private.is_organization_member(organization_id));
drop policy customers_insert_member on public.customers;
create policy customers_insert_member on public.customers
  for insert to authenticated with check (private.is_organization_member(organization_id));
drop policy customers_update_member on public.customers;
create policy customers_update_member on public.customers
  for update to authenticated
  using (private.is_organization_member(organization_id))
  with check (private.is_organization_member(organization_id));
drop policy customers_delete_member on public.customers;
create policy customers_delete_member on public.customers
  for delete to authenticated using (private.is_organization_member(organization_id));

drop policy leads_select_member on public.leads;
create policy leads_select_member on public.leads
  for select to authenticated using (private.is_organization_member(organization_id));
drop policy leads_insert_member on public.leads;
create policy leads_insert_member on public.leads
  for insert to authenticated with check (private.is_organization_member(organization_id));
drop policy leads_update_member on public.leads;
create policy leads_update_member on public.leads
  for update to authenticated
  using (private.is_organization_member(organization_id))
  with check (private.is_organization_member(organization_id));
drop policy leads_delete_member on public.leads;
create policy leads_delete_member on public.leads
  for delete to authenticated using (private.is_organization_member(organization_id));

drop policy deals_select_member on public.deals;
create policy deals_select_member on public.deals
  for select to authenticated using (private.is_organization_member(organization_id));
drop policy deals_insert_member on public.deals;
create policy deals_insert_member on public.deals
  for insert to authenticated with check (private.is_organization_member(organization_id));
drop policy deals_update_member on public.deals;
create policy deals_update_member on public.deals
  for update to authenticated
  using (private.is_organization_member(organization_id))
  with check (private.is_organization_member(organization_id));
drop policy deals_delete_member on public.deals;
create policy deals_delete_member on public.deals
  for delete to authenticated using (private.is_organization_member(organization_id));

drop policy tasks_select_member on public.tasks;
create policy tasks_select_member on public.tasks
  for select to authenticated using (private.is_organization_member(organization_id));
drop policy tasks_insert_member on public.tasks;
create policy tasks_insert_member on public.tasks
  for insert to authenticated with check (private.is_organization_member(organization_id));
drop policy tasks_update_member on public.tasks;
create policy tasks_update_member on public.tasks
  for update to authenticated
  using (private.is_organization_member(organization_id))
  with check (private.is_organization_member(organization_id));
drop policy tasks_delete_member on public.tasks;
create policy tasks_delete_member on public.tasks
  for delete to authenticated using (private.is_organization_member(organization_id));

drop policy activities_select_member on public.activities;
create policy activities_select_member on public.activities
  for select to authenticated using (private.is_organization_member(organization_id));
drop policy activities_insert_member on public.activities;
create policy activities_insert_member on public.activities
  for insert to authenticated with check (private.is_organization_member(organization_id));
drop policy activities_update_member on public.activities;
create policy activities_update_member on public.activities
  for update to authenticated
  using (private.is_organization_member(organization_id))
  with check (private.is_organization_member(organization_id));
drop policy activities_delete_member on public.activities;
create policy activities_delete_member on public.activities
  for delete to authenticated using (private.is_organization_member(organization_id));

revoke all on function public.is_organization_member(uuid) from public, anon, authenticated;
revoke all on function public.get_current_organization_id() from public, anon, authenticated;
drop function public.is_organization_member(uuid);
drop function public.get_current_organization_id();
