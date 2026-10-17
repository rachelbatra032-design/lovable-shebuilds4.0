
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  email text,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid not null,
  is_sample boolean not null default false,
  created_at timestamptz not null default now()
);
create table public.company_members (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null,
  member_role text not null default 'member' check (member_role in ('admin','member')),
  created_at timestamptz not null default now(),
  unique (company_id, user_id)
);
create table public.departments (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);
create table public.roles (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  department_id uuid not null references public.departments(id) on delete cascade,
  title text not null,
  holder_name text,
  holder_email text,
  successor_name text,
  status text not null default 'active' check (status in ('active','leaving','handed_over')),
  onboarding_plan jsonb,
  created_at timestamptz not null default now()
);
create table public.invites (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  email text not null,
  role_id uuid references public.roles(id) on delete set null,
  invited_by uuid not null,
  accepted boolean not null default false,
  created_at timestamptz not null default now()
);
create table public.inputs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete cascade,
  created_by uuid,
  kind text not null check (kind in ('voice','text','file','chat','recording')),
  title text,
  language text,
  original_text text,
  english_text text,
  storage_path text,
  mime_type text,
  frames jsonb not null default '[]'::jsonb,
  status text not null default 'queued' check (status in ('queued','transcribing','extracting','done','failed')),
  error text,
  is_sample boolean not null default false,
  created_at timestamptz not null default now()
);
create table public.knowledge_items (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete cascade,
  kind text not null check (kind in ('responsibility','recurring_task','decision','contact','tool','edge_case','guide')),
  title text not null,
  body text not null default '',
  original_quote text,
  cadence text,
  source_input_id uuid references public.inputs(id) on delete set null,
  mentions int not null default 1,
  status text not null default 'active' check (status in ('active','superseded')),
  media jsonb not null default '[]'::jsonb,
  translations jsonb not null default '{}'::jsonb,
  is_sample boolean not null default false,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create table public.knowledge_links (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete cascade,
  from_item uuid not null references public.knowledge_items(id) on delete cascade,
  to_item uuid not null references public.knowledge_items(id) on delete cascade,
  label text
);
create table public.change_requests (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete cascade,
  existing_item_id uuid references public.knowledge_items(id) on delete cascade,
  proposed_title text not null,
  proposed_body text not null,
  reason text,
  source_input_id uuid references public.inputs(id) on delete set null,
  status text not null default 'pending' check (status in ('pending','confirmed','rejected')),
  is_sample boolean not null default false,
  created_at timestamptz not null default now()
);

grant select, insert, update, delete on public.companies, public.company_members, public.departments, public.roles, public.invites, public.inputs, public.knowledge_items, public.knowledge_links, public.change_requests to authenticated;
grant all on public.companies, public.company_members, public.departments, public.roles, public.invites, public.inputs, public.knowledge_items, public.knowledge_links, public.change_requests to service_role;

alter table public.companies enable row level security;
alter table public.company_members enable row level security;
alter table public.departments enable row level security;
alter table public.roles enable row level security;
alter table public.invites enable row level security;
alter table public.inputs enable row level security;
alter table public.knowledge_items enable row level security;
alter table public.knowledge_links enable row level security;
alter table public.change_requests enable row level security;

create or replace function public.is_company_member(_company uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.company_members where company_id = _company and user_id = auth.uid())
$$;
create or replace function public.is_company_admin(_company uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.company_members where company_id = _company and user_id = auth.uid() and member_role = 'admin')
$$;

create policy "own profile read" on public.profiles for select to authenticated using (id = auth.uid() or exists (select 1 from public.company_members a join public.company_members b on a.company_id = b.company_id where a.user_id = auth.uid() and b.user_id = profiles.id));
create policy "own profile write" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "own profile update" on public.profiles for update to authenticated using (id = auth.uid());

create policy "members read company" on public.companies for select to authenticated using (public.is_company_member(id) or created_by = auth.uid());
create policy "create company" on public.companies for insert to authenticated with check (created_by = auth.uid());
create policy "admins update company" on public.companies for update to authenticated using (public.is_company_admin(id));
create policy "admins delete company" on public.companies for delete to authenticated using (public.is_company_admin(id));

create policy "members read members" on public.company_members for select to authenticated using (public.is_company_member(company_id));
create policy "creator becomes admin" on public.company_members for insert to authenticated with check (
  user_id = auth.uid() and (
    exists (select 1 from public.companies c where c.id = company_id and c.created_by = auth.uid())
    or exists (select 1 from public.invites i where i.company_id = company_members.company_id and lower(i.email) = lower(auth.jwt()->>'email') and member_role = 'member')
  ));
create policy "admins manage members" on public.company_members for delete to authenticated using (public.is_company_admin(company_id));

create policy "members all departments" on public.departments for all to authenticated using (public.is_company_member(company_id)) with check (public.is_company_member(company_id));
create policy "members all roles" on public.roles for all to authenticated using (public.is_company_member(company_id)) with check (public.is_company_member(company_id));
create policy "members read invites" on public.invites for select to authenticated using (public.is_company_member(company_id) or lower(email) = lower(auth.jwt()->>'email'));
create policy "admins create invites" on public.invites for insert to authenticated with check (public.is_company_admin(company_id) and invited_by = auth.uid());
create policy "invitee accepts" on public.invites for update to authenticated using (lower(email) = lower(auth.jwt()->>'email') or public.is_company_admin(company_id));
create policy "admins delete invites" on public.invites for delete to authenticated using (public.is_company_admin(company_id));
create policy "members all inputs" on public.inputs for all to authenticated using (public.is_company_member(company_id)) with check (public.is_company_member(company_id));
create policy "members all items" on public.knowledge_items for all to authenticated using (public.is_company_member(company_id)) with check (public.is_company_member(company_id));
create policy "members all links" on public.knowledge_links for all to authenticated using (public.is_company_member(company_id)) with check (public.is_company_member(company_id));
create policy "members all changes" on public.change_requests for all to authenticated using (public.is_company_member(company_id)) with check (public.is_company_member(company_id));

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email,'@',1)), new.email)
  on conflict (id) do nothing;
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create index on public.inputs(role_id, created_at desc);
create index on public.knowledge_items(role_id);
create index on public.change_requests(role_id, status);

create policy "members read files" on storage.objects for select to authenticated using (bucket_id = 'inputs' and public.is_company_member(((storage.foldername(name))[1])::uuid));
create policy "members upload files" on storage.objects for insert to authenticated with check (bucket_id = 'inputs' and public.is_company_member(((storage.foldername(name))[1])::uuid));
create policy "members delete files" on storage.objects for delete to authenticated using (bucket_id = 'inputs' and public.is_company_member(((storage.foldername(name))[1])::uuid));
