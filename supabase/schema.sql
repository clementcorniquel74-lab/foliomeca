-- =========================================================
-- FolioMeca — Schéma Supabase
-- À exécuter dans l'éditeur SQL de votre projet Supabase
-- (Dashboard > SQL Editor > New query)
-- =========================================================

-- Extension pour les UUID
create extension if not exists "uuid-ossp";

-- =========================================================
-- 1. TABLE profiles
-- =========================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  currency text not null default 'EUR' check (currency in ('EUR', 'CHF')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Un utilisateur voit son propre profil"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Un utilisateur modifie son propre profil"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Un utilisateur crée son propre profil"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Création automatique du profil à l'inscription
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =========================================================
-- 2. TABLE vehicles
-- =========================================================
create table if not exists public.vehicles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('auto', 'moto')),
  make text not null,
  model text not null,
  year int,
  vin text,
  license_plate text,
  current_mileage int not null default 0,
  image_url text,
  created_at timestamptz not null default now()
);

create index if not exists idx_vehicles_user_id on public.vehicles(user_id);

alter table public.vehicles enable row level security;

create policy "Un utilisateur voit ses propres véhicules"
  on public.vehicles for select
  using (auth.uid() = user_id);

create policy "Un utilisateur ajoute ses propres véhicules"
  on public.vehicles for insert
  with check (auth.uid() = user_id);

create policy "Un utilisateur modifie ses propres véhicules"
  on public.vehicles for update
  using (auth.uid() = user_id);

create policy "Un utilisateur supprime ses propres véhicules"
  on public.vehicles for delete
  using (auth.uid() = user_id);

-- =========================================================
-- 3. TABLE maintenance_records
-- =========================================================
create table if not exists public.maintenance_records (
  id uuid primary key default uuid_generate_v4(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  date date not null default current_date,
  mileage int,
  category text not null default 'autre'
    check (category in ('vidange','pneus','freins','distribution','bougies/bobines','fluides','autre')),
  title text not null,
  description text,
  cost numeric(10,2) default 0,
  workshop_name text default 'Fait maison',
  invoice_url text,
  created_at timestamptz not null default now()
);

create index if not exists idx_maintenance_vehicle_id on public.maintenance_records(vehicle_id);
create index if not exists idx_maintenance_date on public.maintenance_records(date);

alter table public.maintenance_records enable row level security;

-- Les policies s'appuient sur la relation vehicle_id -> vehicles.user_id
create policy "Un utilisateur voit les entretiens de ses véhicules"
  on public.maintenance_records for select
  using (
    exists (select 1 from public.vehicles v where v.id = vehicle_id and v.user_id = auth.uid())
  );

create policy "Un utilisateur ajoute des entretiens à ses véhicules"
  on public.maintenance_records for insert
  with check (
    exists (select 1 from public.vehicles v where v.id = vehicle_id and v.user_id = auth.uid())
  );

create policy "Un utilisateur modifie les entretiens de ses véhicules"
  on public.maintenance_records for update
  using (
    exists (select 1 from public.vehicles v where v.id = vehicle_id and v.user_id = auth.uid())
  );

create policy "Un utilisateur supprime les entretiens de ses véhicules"
  on public.maintenance_records for delete
  using (
    exists (select 1 from public.vehicles v where v.id = vehicle_id and v.user_id = auth.uid())
  );

-- =========================================================
-- 4. TABLE reminders
-- =========================================================
create table if not exists public.reminders (
  id uuid primary key default uuid_generate_v4(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  title text not null,
  due_date date,
  due_mileage int,
  is_completed boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_reminders_vehicle_id on public.reminders(vehicle_id);

alter table public.reminders enable row level security;

create policy "Un utilisateur voit les rappels de ses véhicules"
  on public.reminders for select
  using (
    exists (select 1 from public.vehicles v where v.id = vehicle_id and v.user_id = auth.uid())
  );

create policy "Un utilisateur ajoute des rappels à ses véhicules"
  on public.reminders for insert
  with check (
    exists (select 1 from public.vehicles v where v.id = vehicle_id and v.user_id = auth.uid())
  );

create policy "Un utilisateur modifie les rappels de ses véhicules"
  on public.reminders for update
  using (
    exists (select 1 from public.vehicles v where v.id = vehicle_id and v.user_id = auth.uid())
  );

create policy "Un utilisateur supprime les rappels de ses véhicules"
  on public.reminders for delete
  using (
    exists (select 1 from public.vehicles v where v.id = vehicle_id and v.user_id = auth.uid())
  );

-- =========================================================
-- 5. TABLE vehicle_documents (coffre-fort documents : carte grise, CT, factures d'achat...)
-- =========================================================
create table if not exists public.vehicle_documents (
  id uuid primary key default uuid_generate_v4(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  name text not null,
  mime_type text,
  file_url text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_vehicle_documents_vehicle_id on public.vehicle_documents(vehicle_id);

alter table public.vehicle_documents enable row level security;

create policy "Un utilisateur voit les documents de ses véhicules"
  on public.vehicle_documents for select
  using (
    exists (select 1 from public.vehicles v where v.id = vehicle_id and v.user_id = auth.uid())
  );

create policy "Un utilisateur ajoute des documents à ses véhicules"
  on public.vehicle_documents for insert
  with check (
    exists (select 1 from public.vehicles v where v.id = vehicle_id and v.user_id = auth.uid())
  );

create policy "Un utilisateur supprime les documents de ses véhicules"
  on public.vehicle_documents for delete
  using (
    exists (select 1 from public.vehicles v where v.id = vehicle_id and v.user_id = auth.uid())
  );

-- =========================================================
-- 6. STORAGE BUCKETS
-- Créez les buckets suivants depuis le dashboard (Storage > New bucket) :
--   - "vehicle-photos"  (Public bucket : ON)
--   - "invoices"        (Public bucket : OFF)
--   - "documents"       (Public bucket : OFF) — coffre-fort (carte grise, CT, factures d'achat...)
-- Puis exécutez les policies ci-dessous.
-- =========================================================

-- vehicle-photos : lecture publique, écriture réservée au propriétaire
-- (convention de chemin : {user_id}/nom-fichier.ext)
create policy "Lecture publique des photos véhicules"
  on storage.objects for select
  using (bucket_id = 'vehicle-photos');

create policy "Upload photos véhicules par le propriétaire"
  on storage.objects for insert
  with check (
    bucket_id = 'vehicle-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Suppression photos véhicules par le propriétaire"
  on storage.objects for delete
  using (
    bucket_id = 'vehicle-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- invoices : accès restreint aux entretiens des véhicules du propriétaire
-- (convention de chemin : {vehicle_id}/nom-fichier.ext)
create policy "Lecture des factures par le propriétaire du véhicule"
  on storage.objects for select
  using (
    bucket_id = 'invoices'
    and exists (
      select 1 from public.vehicles v
      where v.id::text = (storage.foldername(name))[1]
      and v.user_id = auth.uid()
    )
  );

create policy "Upload de factures par le propriétaire du véhicule"
  on storage.objects for insert
  with check (
    bucket_id = 'invoices'
    and exists (
      select 1 from public.vehicles v
      where v.id::text = (storage.foldername(name))[1]
      and v.user_id = auth.uid()
    )
  );

create policy "Suppression de factures par le propriétaire du véhicule"
  on storage.objects for delete
  using (
    bucket_id = 'invoices'
    and exists (
      select 1 from public.vehicles v
      where v.id::text = (storage.foldername(name))[1]
      and v.user_id = auth.uid()
    )
  );

-- documents : coffre-fort, accès restreint au propriétaire du véhicule
-- (convention de chemin : {vehicle_id}/nom-fichier.ext)
create policy "Lecture des documents par le propriétaire du véhicule"
  on storage.objects for select
  using (
    bucket_id = 'documents'
    and exists (
      select 1 from public.vehicles v
      where v.id::text = (storage.foldername(name))[1]
      and v.user_id = auth.uid()
    )
  );

create policy "Upload de documents par le propriétaire du véhicule"
  on storage.objects for insert
  with check (
    bucket_id = 'documents'
    and exists (
      select 1 from public.vehicles v
      where v.id::text = (storage.foldername(name))[1]
      and v.user_id = auth.uid()
    )
  );

create policy "Suppression de documents par le propriétaire du véhicule"
  on storage.objects for delete
  using (
    bucket_id = 'documents'
    and exists (
      select 1 from public.vehicles v
      where v.id::text = (storage.foldername(name))[1]
      and v.user_id = auth.uid()
    )
  );

-- feedback : avis / suggestions des utilisateurs (espace "Avis & suggestions")
create table if not exists public.feedback (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  user_email text,
  type text not null check (type in ('suggestion', 'bug', 'compliment')),
  message text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_feedback_user_id on public.feedback(user_id);

alter table public.feedback enable row level security;

create policy "Un utilisateur voit ses propres avis"
  on public.feedback for select
  using (user_id = auth.uid());

create policy "Un utilisateur ajoute ses propres avis"
  on public.feedback for insert
  with check (user_id = auth.uid());

-- support_requests : espace "Contact & support" (souci client, bug, compte...)
create table if not exists public.support_requests (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  user_email text,
  subject text not null check (subject in ('client', 'bug', 'account', 'other')),
  message text not null,
  status text not null default 'open' check (status in ('open', 'in_progress', 'closed')),
  created_at timestamptz not null default now()
);

create index if not exists idx_support_requests_user_id on public.support_requests(user_id);

alter table public.support_requests enable row level security;

create policy "Un utilisateur voit ses propres demandes"
  on public.support_requests for select
  using (user_id = auth.uid());

create policy "Un utilisateur crée ses propres demandes"
  on public.support_requests for insert
  with check (user_id = auth.uid());

-- =========================================================
-- Fin du schéma
-- =========================================================
