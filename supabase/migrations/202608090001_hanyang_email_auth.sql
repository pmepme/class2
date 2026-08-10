-- Library Learn: 한양대학교 이메일 OTP 인증과 profiles/RLS
--
-- 적용 후 Supabase Dashboard에서
-- Authentication -> Hooks -> Before User Created에
-- public.restrict_hanyang_email을 등록해야 한다.
-- 이 함수는 프론트엔드 검사를 우회한 직접 Auth API 요청도 차단한다.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  display_name text,
  onboarding_completed boolean not null default false,
  role text not null default 'student' check (role in ('student', 'admin')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_email text := lower(trim(coalesce(new.email, '')));
begin
  insert into public.profiles (id, email, display_name, role)
  values (
    new.id,
    normalized_email,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(normalized_email, '@', 1)),
    case when normalized_email = 'belief@hanyang.ac.kr' then 'admin' else 'student' end
  )
  on conflict (id) do update
  set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
after insert on auth.users
for each row execute function public.handle_new_user_profile();

create or replace function public.prevent_profile_identity_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.id <> old.id
    or lower(new.email) <> lower(old.email)
    or new.role <> old.role
    or new.active <> old.active then
    raise exception 'profile identity fields cannot be changed by the user';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_protect_identity on public.profiles;
create trigger profiles_protect_identity
before update on public.profiles
for each row execute function public.prevent_profile_identity_change();

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles for select
to authenticated
using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create or replace function public.restrict_hanyang_email(event jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_email text := lower(trim(coalesce(event -> 'user' ->> 'email', '')));
  email_domain text := split_part(normalized_email, '@', 2);
begin
  if normalized_email = ''
    or position('@' in normalized_email) < 2
    or email_domain <> 'hanyang.ac.kr' then
    return jsonb_build_object(
      'error', jsonb_build_object(
        'http_code', 400,
        'message', 'Only @hanyang.ac.kr email addresses are allowed.',
        'code', 'hanyang_email_required'
      )
    );
  end if;

  return jsonb_build_object('user', event -> 'user');
end;
$$;

revoke all on function public.restrict_hanyang_email(jsonb) from public;
revoke all on function public.restrict_hanyang_email(jsonb) from anon;
revoke all on function public.restrict_hanyang_email(jsonb) from authenticated;
grant execute on function public.restrict_hanyang_email(jsonb) to supabase_auth_admin;

comment on function public.restrict_hanyang_email(jsonb) is
'Register this function in Supabase Authentication -> Hooks -> Before User Created. It restricts new users to the exact hanyang.ac.kr domain.';

