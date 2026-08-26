-- =========================================================
-- FolioMeca — Migration v2
-- À exécuter UNIQUEMENT si vous avez déjà exécuté schema.sql
-- (projet Supabase existant). Si vous démarrez un nouveau
-- projet, schema.sql contient déjà tout : inutile d'exécuter
-- ce fichier séparément.
-- =========================================================

-- 1. Devise du profil (EUR / CHF)
alter table public.profiles
  add column if not exists currency text not null default 'EUR' check (currency in ('EUR', 'CHF'));

-- 2. Table vehicle_documents (coffre-fort documents)
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

drop policy if exists "Un utilisateur voit les documents de ses véhicules" on public.vehicle_documents;
create policy "Un utilisateur voit les documents de ses véhicules"
  on public.vehicle_documents for select
  using (exists (select 1 from public.vehicles v where v.id = vehicle_id and v.user_id = auth.uid()));

drop policy if exists "Un utilisateur ajoute des documents à ses véhicules" on public.vehicle_documents;
create policy "Un utilisateur ajoute des documents à ses véhicules"
  on public.vehicle_documents for insert
  with check (exists (select 1 from public.vehicles v where v.id = vehicle_id and v.user_id = auth.uid()));

drop policy if exists "Un utilisateur supprime les documents de ses véhicules" on public.vehicle_documents;
create policy "Un utilisateur supprime les documents de ses véhicules"
  on public.vehicle_documents for delete
  using (exists (select 1 from public.vehicles v where v.id = vehicle_id and v.user_id = auth.uid()));

-- 3. Bucket Storage "documents"
-- Créez-le manuellement depuis le dashboard (Storage > New bucket > "documents", Public : OFF)
-- puis exécutez les policies ci-dessous.

drop policy if exists "Lecture des documents par le propriétaire du véhicule" on storage.objects;
create policy "Lecture des documents par le propriétaire du véhicule"
  on storage.objects for select
  using (
    bucket_id = 'documents'
    and exists (select 1 from public.vehicles v where v.id::text = (storage.foldername(name))[1] and v.user_id = auth.uid())
  );

drop policy if exists "Upload de documents par le propriétaire du véhicule" on storage.objects;
create policy "Upload de documents par le propriétaire du véhicule"
  on storage.objects for insert
  with check (
    bucket_id = 'documents'
    and exists (select 1 from public.vehicles v where v.id::text = (storage.foldername(name))[1] and v.user_id = auth.uid())
  );

drop policy if exists "Suppression de documents par le propriétaire du véhicule" on storage.objects;
create policy "Suppression de documents par le propriétaire du véhicule"
  on storage.objects for delete
  using (
    bucket_id = 'documents'
    and exists (select 1 from public.vehicles v where v.id::text = (storage.foldername(name))[1] and v.user_id = auth.uid())
  );

-- =========================================================
-- Fin de la migration
-- =========================================================
