-- Migration đã được áp dụng tự động lên dự án Supabase: clarity-monthplan (wbsdswndzofvorsgszlv)

create table if not exists public.user_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  year integer not null,
  month integer not null,
  plan_data jsonb not null,
  updated_at timestamptz not null default now(),
  unique (user_id, year, month)
);

create index if not exists idx_user_plans_user_id on public.user_plans(user_id);

alter table public.user_plans enable row level security;

grant select, insert, update, delete on table public.user_plans to authenticated;

create policy "Users can view their own plans"
  on public.user_plans for select
  to authenticated
  using ( (select auth.uid()) = user_id );

create policy "Users can insert their own plans"
  on public.user_plans for insert
  to authenticated
  with check ( (select auth.uid()) = user_id );

create policy "Users can update their own plans"
  on public.user_plans for update
  to authenticated
  using ( (select auth.uid()) = user_id )
  with check ( (select auth.uid()) = user_id );

create policy "Users can delete their own plans"
  on public.user_plans for delete
  to authenticated
  using ( (select auth.uid()) = user_id );

-- Tự động xác thực tài khoản ngay khi đăng ký để người dùng đăng nhập bằng Username hoặc Email tức thì
create or replace function public.handle_auto_confirm_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.email_confirmed_at is null then
    new.email_confirmed_at := now();
  end if;
  return new;
end;
$$;

revoke execute on function public.handle_auto_confirm_user() from public, anon, authenticated;

create trigger on_auth_user_created_auto_confirm
  before insert on auth.users
  for each row execute function public.handle_auto_confirm_user();
