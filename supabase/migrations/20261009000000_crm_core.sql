create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organization_members (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  full_name text not null,
  email text,
  phone_number text,
  company text not null,
  job_title text,
  customer_status text not null default 'Active' check (customer_status in ('Active', 'Inactive', 'Prospect')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id),
  unique (organization_id, email)
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  customer_id uuid,
  full_name text not null,
  email text not null,
  phone text,
  company text not null,
  lead_source text not null default 'Website' check (lead_source in ('Website', 'Referral', 'LinkedIn', 'Outbound')),
  status text not null default 'New' check (status in ('New', 'Contacted', 'Qualified', 'Converted', 'Lost')),
  assigned_user text,
  estimated_deal_value numeric(12,2) not null default 0 check (estimated_deal_value >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id),
  foreign key (organization_id, customer_id)
    references public.customers (organization_id, id) on delete set null (customer_id)
);

create table public.deals (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  customer_id uuid,
  lead_id uuid,
  title text not null,
  customer text not null,
  lead text,
  deal_value numeric(12,2) not null default 0 check (deal_value >= 0),
  deal_stage text not null default 'Qualification' check (deal_stage in ('Qualification', 'Proposal', 'Negotiation', 'Won', 'Lost')),
  expected_closing_date date,
  assigned_user text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id),
  foreign key (organization_id, customer_id)
    references public.customers (organization_id, id) on delete set null (customer_id),
  foreign key (organization_id, lead_id)
    references public.leads (organization_id, id) on delete set null (lead_id)
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  customer_id uuid,
  lead_id uuid,
  title text not null,
  description text,
  due_date date not null,
  priority text not null default 'Medium' check (priority in ('Low', 'Medium', 'High')),
  status text not null default 'Pending' check (status in ('Pending', 'In Progress', 'Completed')),
  assigned_user text,
  related_customer text,
  related_lead text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (organization_id, customer_id)
    references public.customers (organization_id, id) on delete set null (customer_id),
  foreign key (organization_id, lead_id)
    references public.leads (organization_id, id) on delete set null (lead_id)
);

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  customer_id uuid,
  lead_id uuid,
  user_id uuid,
  title text not null,
  activity_type text not null check (activity_type in ('Phone call', 'Email', 'Meeting', 'Follow-up', 'Note')),
  description text,
  related_customer text,
  related_lead text,
  activity_date date not null,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (organization_id, customer_id)
    references public.customers (organization_id, id) on delete set null (customer_id),
  foreign key (organization_id, lead_id)
    references public.leads (organization_id, id) on delete set null (lead_id),
  foreign key (organization_id, user_id)
    references public.organization_members (organization_id, user_id) on delete set null (user_id)
);

create function public.is_organization_member(p_organization_id uuid)
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

create function public.get_current_organization_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select member.organization_id
  from public.organization_members as member
  where member.user_id = (select auth.uid())
  order by member.created_at, member.organization_id
  limit 1;
$$;

create function public.ensure_auth_user_workspace(
  p_user_id uuid,
  p_email text,
  p_full_name text,
  p_organization_name text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  workspace_id uuid;
  display_name text := coalesce(
    nullif(trim(p_full_name), ''),
    nullif(split_part(coalesce(p_email, ''), '@', 1), ''),
    'CRM user'
  );
begin
  insert into public.profiles (id, full_name, email)
  values (p_user_id, display_name, p_email)
  on conflict (id) do nothing;

  if not exists (
    select 1 from public.organization_members as member where member.user_id = p_user_id
  ) then
    insert into public.organizations (name, slug)
    values (
      coalesce(nullif(trim(p_organization_name), ''), display_name || '''s Workspace'),
      'workspace-' || replace(p_user_id::text, '-', '')
    )
    returning id into workspace_id;

    insert into public.organization_members (organization_id, user_id, role)
    values (workspace_id, p_user_id, 'owner');
  end if;
end;
$$;

create function public.handle_auth_user_created()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.ensure_auth_user_workspace(
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'organization_name'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_auth_user_created();

do $$
declare
  existing_user record;
begin
  for existing_user in
    select
      users.id,
      users.email,
      users.raw_user_meta_data ->> 'full_name' as full_name,
      users.raw_user_meta_data ->> 'organization_name' as organization_name
    from auth.users as users
  loop
    perform public.ensure_auth_user_workspace(
      existing_user.id,
      existing_user.email,
      existing_user.full_name,
      existing_user.organization_name
    );
  end loop;
end;
$$;

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger organizations_updated_at before update on public.organizations
  for each row execute function public.set_updated_at();
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger customers_updated_at before update on public.customers
  for each row execute function public.set_updated_at();
create trigger leads_updated_at before update on public.leads
  for each row execute function public.set_updated_at();
create trigger deals_updated_at before update on public.deals
  for each row execute function public.set_updated_at();
create trigger tasks_updated_at before update on public.tasks
  for each row execute function public.set_updated_at();
create trigger activities_updated_at before update on public.activities
  for each row execute function public.set_updated_at();

create function public.convert_lead_to_customer(p_lead_id uuid)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  source_lead public.leads%rowtype;
  new_customer_id uuid;
begin
  select * into source_lead
  from public.leads
  where id = p_lead_id
  for update;

  if not found then
    raise exception 'Lead not found or access denied' using errcode = 'P0002';
  end if;

  if source_lead.status = 'Converted' then
    raise exception 'Lead has already been converted' using errcode = '22023';
  end if;

  insert into public.customers (
    organization_id,
    full_name,
    email,
    phone_number,
    company,
    job_title,
    customer_status,
    notes
  ) values (
    source_lead.organization_id,
    source_lead.full_name,
    source_lead.email,
    source_lead.phone,
    source_lead.company,
    'Prospect',
    'Active',
    'Converted from lead ' || source_lead.id::text
  )
  returning id into new_customer_id;

  update public.leads
  set status = 'Converted', customer_id = new_customer_id
  where id = source_lead.id;

  return new_customer_id;
end;
$$;

create index customers_organization_created_idx on public.customers (organization_id, created_at desc);
create index customers_organization_company_idx on public.customers (organization_id, company);
create index customers_organization_status_idx on public.customers (organization_id, customer_status);
create index leads_organization_created_idx on public.leads (organization_id, created_at desc);
create index leads_organization_status_idx on public.leads (organization_id, status);
create index leads_organization_customer_idx on public.leads (organization_id, customer_id);
create index deals_organization_stage_idx on public.deals (organization_id, deal_stage);
create index deals_organization_close_date_idx on public.deals (organization_id, expected_closing_date);
create index deals_organization_customer_idx on public.deals (organization_id, customer_id);
create index deals_organization_lead_idx on public.deals (organization_id, lead_id);
create index tasks_organization_due_date_idx on public.tasks (organization_id, due_date);
create index tasks_organization_status_priority_idx on public.tasks (organization_id, status, priority);
create index tasks_organization_customer_idx on public.tasks (organization_id, customer_id);
create index tasks_organization_lead_idx on public.tasks (organization_id, lead_id);
create index activities_organization_date_idx on public.activities (organization_id, activity_date desc);
create index activities_organization_customer_idx on public.activities (organization_id, customer_id);
create index activities_organization_lead_idx on public.activities (organization_id, lead_id);
create index activities_organization_user_idx on public.activities (organization_id, user_id);
create index organization_members_user_idx on public.organization_members (user_id, created_at);

alter table public.organizations enable row level security;
alter table public.organizations force row level security;
alter table public.profiles enable row level security;
alter table public.profiles force row level security;
alter table public.organization_members enable row level security;
alter table public.organization_members force row level security;
alter table public.customers enable row level security;
alter table public.customers force row level security;
alter table public.leads enable row level security;
alter table public.leads force row level security;
alter table public.deals enable row level security;
alter table public.deals force row level security;
alter table public.tasks enable row level security;
alter table public.tasks force row level security;
alter table public.activities enable row level security;
alter table public.activities force row level security;

create policy profiles_select_self on public.profiles
  for select to authenticated
  using (id = (select auth.uid()));

create policy organizations_select_member on public.organizations
  for select to authenticated
  using (public.is_organization_member(id));
create policy organization_members_select_member on public.organization_members
  for select to authenticated
  using (public.is_organization_member(organization_id));

create policy customers_select_member on public.customers
  for select to authenticated using (public.is_organization_member(organization_id));
create policy customers_insert_member on public.customers
  for insert to authenticated with check (public.is_organization_member(organization_id));
create policy customers_update_member on public.customers
  for update to authenticated
  using (public.is_organization_member(organization_id))
  with check (public.is_organization_member(organization_id));
create policy customers_delete_member on public.customers
  for delete to authenticated using (public.is_organization_member(organization_id));

create policy leads_select_member on public.leads
  for select to authenticated using (public.is_organization_member(organization_id));
create policy leads_insert_member on public.leads
  for insert to authenticated with check (public.is_organization_member(organization_id));
create policy leads_update_member on public.leads
  for update to authenticated
  using (public.is_organization_member(organization_id))
  with check (public.is_organization_member(organization_id));
create policy leads_delete_member on public.leads
  for delete to authenticated using (public.is_organization_member(organization_id));

create policy deals_select_member on public.deals
  for select to authenticated using (public.is_organization_member(organization_id));
create policy deals_insert_member on public.deals
  for insert to authenticated with check (public.is_organization_member(organization_id));
create policy deals_update_member on public.deals
  for update to authenticated
  using (public.is_organization_member(organization_id))
  with check (public.is_organization_member(organization_id));
create policy deals_delete_member on public.deals
  for delete to authenticated using (public.is_organization_member(organization_id));

create policy tasks_select_member on public.tasks
  for select to authenticated using (public.is_organization_member(organization_id));
create policy tasks_insert_member on public.tasks
  for insert to authenticated with check (public.is_organization_member(organization_id));
create policy tasks_update_member on public.tasks
  for update to authenticated
  using (public.is_organization_member(organization_id))
  with check (public.is_organization_member(organization_id));
create policy tasks_delete_member on public.tasks
  for delete to authenticated using (public.is_organization_member(organization_id));

create policy activities_select_member on public.activities
  for select to authenticated using (public.is_organization_member(organization_id));
create policy activities_insert_member on public.activities
  for insert to authenticated with check (public.is_organization_member(organization_id));
create policy activities_update_member on public.activities
  for update to authenticated
  using (public.is_organization_member(organization_id))
  with check (public.is_organization_member(organization_id));
create policy activities_delete_member on public.activities
  for delete to authenticated using (public.is_organization_member(organization_id));

revoke all on public.organizations, public.profiles, public.organization_members,
  public.customers, public.leads, public.deals, public.tasks, public.activities
  from anon, authenticated;
grant select on public.profiles, public.organizations, public.organization_members to authenticated;
grant select, insert, update, delete on public.customers, public.leads, public.deals,
  public.tasks, public.activities to authenticated;

revoke all on function public.is_organization_member(uuid) from public, anon;
revoke all on function public.get_current_organization_id() from public, anon;
revoke all on function public.ensure_auth_user_workspace(uuid, text, text, text) from public, anon, authenticated;
revoke all on function public.handle_auth_user_created() from public, anon, authenticated;
revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.convert_lead_to_customer(uuid) from public, anon;
grant execute on function public.is_organization_member(uuid) to authenticated;
grant execute on function public.get_current_organization_id() to authenticated;
grant execute on function public.convert_lead_to_customer(uuid) to authenticated;
