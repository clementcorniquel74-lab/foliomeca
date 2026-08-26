-- =========================================================
-- FolioMeca — Migration v3
-- À exécuter si vous avez déjà schema.sql (+ éventuellement
-- schema_update_v2.sql) sur un projet Supabase existant.
-- Ajoute les tables nécessaires aux espaces "Avis & suggestions"
-- et "Contact & support".
-- =========================================================

-- 1. Table feedback (avis / suggestions des utilisateurs)
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

drop policy if exists "Un utilisateur voit ses propres avis" on public.feedback;
create policy "Un utilisateur voit ses propres avis"
  on public.feedback for select
  using (user_id = auth.uid());

drop policy if exists "Un utilisateur ajoute ses propres avis" on public.feedback;
create policy "Un utilisateur ajoute ses propres avis"
  on public.feedback for insert
  with check (user_id = auth.uid());

-- 2. Table support_requests (contact / support : souci client, bug, compte...)
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

drop policy if exists "Un utilisateur voit ses propres demandes" on public.support_requests;
create policy "Un utilisateur voit ses propres demandes"
  on public.support_requests for select
  using (user_id = auth.uid());

drop policy if exists "Un utilisateur crée ses propres demandes" on public.support_requests;
create policy "Un utilisateur crée ses propres demandes"
  on public.support_requests for insert
  with check (user_id = auth.uid());

-- Note : la mise à jour du statut ("in_progress"/"closed") et la lecture
-- inter-utilisateurs sont réservées à l'équipe support, via le dashboard
-- Supabase ou un rôle "service_role" — aucune policy UPDATE/SELECT globale
-- n'est ouverte aux utilisateurs ici, par sécurité.

-- =========================================================
-- Fin de la migration
-- =========================================================
