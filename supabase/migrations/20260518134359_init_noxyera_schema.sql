begin;

create extension if not exists pgcrypto with schema extensions;

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  role text not null check (role in ('client', 'technicien', 'admin')),
  nom text,
  prenom text,
  email text,
  telephone text,
  entreprise text,
  created_at timestamptz not null default now()
);

create table public.sites (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  nom text not null,
  adresse text not null,
  ville text not null,
  code_postal text not null,
  secteur text not null check (
    secteur in (
      'restaurant',
      'hotel',
      'entrepot',
      'agroalimentaire',
      'immeuble',
      'bureau'
    )
  ),
  superficie integer check (superficie > 0),
  statut text not null default 'en_attente' check (
    statut in ('actif', 'inactif', 'en_attente')
  ),
  created_at timestamptz not null default now()
);

create table public.contracts (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  formule text not null check (formule in ('essentiel', 'serenite')),
  frequence integer not null check (frequence in (4, 6, 12)),
  curatives_incluses boolean not null default false,
  prix_annuel numeric(10, 2) not null check (prix_annuel >= 0),
  date_debut date not null,
  date_fin date not null,
  statut text not null default 'actif' check (
    statut in ('actif', 'termine', 'suspendu')
  ),
  created_at timestamptz not null default now(),
  check (date_fin >= date_debut)
);

create table public.interventions (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  contract_id uuid references public.contracts(id) on delete set null,
  technicien_id uuid references public.profiles(id) on delete set null,
  type text not null check (type in ('preventif', 'curatif', 'urgence')),
  date_prevue timestamptz not null,
  date_reelle timestamptz,
  statut text not null default 'planifie' check (
    statut in ('planifie', 'en_cours', 'realise', 'annule')
  ),
  notes text,
  created_at timestamptz not null default now()
);

create table public.rapports (
  id uuid primary key default gen_random_uuid(),
  intervention_id uuid not null references public.interventions(id) on delete cascade,
  technicien_id uuid references public.profiles(id) on delete set null,
  pdf_url text,
  produits_utilises text[] not null default '{}',
  zones_traitees text[] not null default '{}',
  photos_url text[] not null default '{}',
  haccp_conforme boolean not null default true,
  signe_le timestamptz,
  created_at timestamptz not null default now()
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  secteur text not null check (
    secteur in (
      'restaurant',
      'hotel',
      'entrepot',
      'agroalimentaire',
      'immeuble',
      'bureau'
    )
  ),
  superficie integer not null check (superficie > 0),
  frequence integer not null check (frequence in (4, 6, 12)),
  curatives boolean not null,
  prix_estime numeric(10, 2) not null check (prix_estime >= 0),
  formule_suggeree text not null check (
    formule_suggeree in ('essentiel', 'serenite')
  ),
  created_at timestamptz not null default now()
);

create index profiles_user_id_idx on public.profiles(user_id);
create index profiles_role_idx on public.profiles(role);
create index sites_client_id_idx on public.sites(client_id);
create index sites_statut_idx on public.sites(statut);
create index contracts_site_id_idx on public.contracts(site_id);
create index contracts_statut_idx on public.contracts(statut);
create index interventions_site_id_idx on public.interventions(site_id);
create index interventions_contract_id_idx on public.interventions(contract_id);
create index interventions_technicien_id_idx on public.interventions(technicien_id);
create index interventions_date_prevue_idx on public.interventions(date_prevue);
create index interventions_statut_idx on public.interventions(statut);
create index rapports_intervention_id_idx on public.rapports(intervention_id);
create index rapports_technicien_id_idx on public.rapports(technicien_id);
create index leads_created_at_idx on public.leads(created_at desc);

alter table public.profiles enable row level security;
alter table public.sites enable row level security;
alter table public.contracts enable row level security;
alter table public.interventions enable row level security;
alter table public.rapports enable row level security;
alter table public.leads enable row level security;

grant usage on schema public to anon, authenticated;
grant all privileges on
  public.profiles,
  public.sites,
  public.contracts,
  public.interventions,
  public.rapports,
  public.leads
to service_role;
grant select on
  public.profiles,
  public.sites,
  public.contracts,
  public.interventions,
  public.rapports
to authenticated;
grant update (statut, date_reelle, notes) on public.interventions to authenticated;
grant insert on public.rapports to authenticated;
grant update (
  pdf_url,
  produits_utilises,
  zones_traitees,
  photos_url,
  haccp_conforme,
  signe_le
) on public.rapports to authenticated;
grant select, update, delete on public.leads to authenticated;
grant insert on public.leads to authenticated;
grant insert on public.leads to anon;

create policy "profiles_self_select" on public.profiles
  for select to authenticated
  using (user_id = auth.uid());

create policy "sites_client_select_own" on public.sites
  for select to authenticated
  using (
    exists (
      select 1
      from public.profiles client_profile
      where client_profile.id = sites.client_id
        and client_profile.user_id = auth.uid()
        and client_profile.role = 'client'
    )
  );

create policy "sites_admin_all" on public.sites
  for all to authenticated
  using (
    exists (
      select 1
      from public.profiles admin_profile
      where admin_profile.user_id = auth.uid()
        and admin_profile.role = 'admin'
    )
  )
  with check (
    exists (
      select 1
      from public.profiles admin_profile
      where admin_profile.user_id = auth.uid()
        and admin_profile.role = 'admin'
    )
  );

create policy "contracts_client_select_own" on public.contracts
  for select to authenticated
  using (
    exists (
      select 1
      from public.sites
      join public.profiles client_profile on client_profile.id = sites.client_id
      where sites.id = contracts.site_id
        and client_profile.user_id = auth.uid()
        and client_profile.role = 'client'
    )
  );

create policy "contracts_admin_all" on public.contracts
  for all to authenticated
  using (
    exists (
      select 1
      from public.profiles admin_profile
      where admin_profile.user_id = auth.uid()
        and admin_profile.role = 'admin'
    )
  )
  with check (
    exists (
      select 1
      from public.profiles admin_profile
      where admin_profile.user_id = auth.uid()
        and admin_profile.role = 'admin'
    )
  );

create policy "interventions_client_select_own" on public.interventions
  for select to authenticated
  using (
    exists (
      select 1
      from public.sites
      join public.profiles client_profile on client_profile.id = sites.client_id
      where sites.id = interventions.site_id
        and client_profile.user_id = auth.uid()
        and client_profile.role = 'client'
    )
  );

create policy "interventions_technicien_select_own" on public.interventions
  for select to authenticated
  using (
    exists (
      select 1
      from public.profiles technicien_profile
      where technicien_profile.id = interventions.technicien_id
        and technicien_profile.user_id = auth.uid()
        and technicien_profile.role = 'technicien'
    )
  );

create policy "interventions_technicien_update_own" on public.interventions
  for update to authenticated
  using (
    exists (
      select 1
      from public.profiles technicien_profile
      where technicien_profile.id = interventions.technicien_id
        and technicien_profile.user_id = auth.uid()
        and technicien_profile.role = 'technicien'
    )
  )
  with check (
    exists (
      select 1
      from public.profiles technicien_profile
      where technicien_profile.id = interventions.technicien_id
        and technicien_profile.user_id = auth.uid()
        and technicien_profile.role = 'technicien'
    )
  );

create policy "interventions_admin_all" on public.interventions
  for all to authenticated
  using (
    exists (
      select 1
      from public.profiles admin_profile
      where admin_profile.user_id = auth.uid()
        and admin_profile.role = 'admin'
    )
  )
  with check (
    exists (
      select 1
      from public.profiles admin_profile
      where admin_profile.user_id = auth.uid()
        and admin_profile.role = 'admin'
    )
  );

create policy "rapports_client_select_own" on public.rapports
  for select to authenticated
  using (
    exists (
      select 1
      from public.interventions
      join public.sites on sites.id = interventions.site_id
      join public.profiles client_profile on client_profile.id = sites.client_id
      where interventions.id = rapports.intervention_id
        and client_profile.user_id = auth.uid()
        and client_profile.role = 'client'
    )
  );

create policy "rapports_technicien_select_own" on public.rapports
  for select to authenticated
  using (
    exists (
      select 1
      from public.profiles technicien_profile
      where technicien_profile.id = rapports.technicien_id
        and technicien_profile.user_id = auth.uid()
        and technicien_profile.role = 'technicien'
    )
  );

create policy "rapports_technicien_insert_own" on public.rapports
  for insert to authenticated
  with check (
    exists (
      select 1
      from public.profiles technicien_profile
      join public.interventions on interventions.technicien_id = technicien_profile.id
      where technicien_profile.id = rapports.technicien_id
        and technicien_profile.user_id = auth.uid()
        and technicien_profile.role = 'technicien'
        and interventions.id = rapports.intervention_id
    )
  );

create policy "rapports_technicien_update_own" on public.rapports
  for update to authenticated
  using (
    exists (
      select 1
      from public.profiles technicien_profile
      where technicien_profile.id = rapports.technicien_id
        and technicien_profile.user_id = auth.uid()
        and technicien_profile.role = 'technicien'
    )
  )
  with check (
    exists (
      select 1
      from public.profiles technicien_profile
      join public.interventions on interventions.technicien_id = technicien_profile.id
      where technicien_profile.id = rapports.technicien_id
        and technicien_profile.user_id = auth.uid()
        and technicien_profile.role = 'technicien'
        and interventions.id = rapports.intervention_id
    )
  );

create policy "rapports_admin_all" on public.rapports
  for all to authenticated
  using (
    exists (
      select 1
      from public.profiles admin_profile
      where admin_profile.user_id = auth.uid()
        and admin_profile.role = 'admin'
    )
  )
  with check (
    exists (
      select 1
      from public.profiles admin_profile
      where admin_profile.user_id = auth.uid()
        and admin_profile.role = 'admin'
    )
  );

create policy "leads_public_insert" on public.leads
  for insert to anon, authenticated
  with check (true);

create policy "leads_admin_all" on public.leads
  for all to authenticated
  using (
    exists (
      select 1
      from public.profiles admin_profile
      where admin_profile.user_id = auth.uid()
        and admin_profile.role = 'admin'
    )
  )
  with check (
    exists (
      select 1
      from public.profiles admin_profile
      where admin_profile.user_id = auth.uid()
        and admin_profile.role = 'admin'
    )
  );

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'haccp-reports',
    'haccp-reports',
    false,
    10485760,
    array['application/pdf']
  ),
  (
    'intervention-photos',
    'intervention-photos',
    false,
    10485760,
    array['image/jpeg', 'image/png', 'image/webp']
  )
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "storage_admin_all_noxyera" on storage.objects
  for all to authenticated
  using (
    bucket_id in ('haccp-reports', 'intervention-photos')
    and exists (
      select 1
      from public.profiles admin_profile
      where admin_profile.user_id = auth.uid()
        and admin_profile.role = 'admin'
    )
  )
  with check (
    bucket_id in ('haccp-reports', 'intervention-photos')
    and exists (
      select 1
      from public.profiles admin_profile
      where admin_profile.user_id = auth.uid()
        and admin_profile.role = 'admin'
    )
  );

create policy "storage_technicien_insert_noxyera" on storage.objects
  for insert to authenticated
  with check (
    bucket_id in ('haccp-reports', 'intervention-photos')
    and exists (
      select 1
      from public.profiles technicien_profile
      where technicien_profile.user_id = auth.uid()
        and technicien_profile.role = 'technicien'
    )
  );

create policy "storage_technicien_select_noxyera" on storage.objects
  for select to authenticated
  using (
    bucket_id in ('haccp-reports', 'intervention-photos')
    and exists (
      select 1
      from public.profiles technicien_profile
      where technicien_profile.user_id = auth.uid()
        and technicien_profile.role = 'technicien'
    )
  );

commit;
