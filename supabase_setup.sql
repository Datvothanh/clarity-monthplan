-- Chạy đoạn SQL này trong mục "SQL Editor" trên trang quản trị Supabase của bạn:

create table if not exists public.user_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  year integer not null,
  month integer not null,
  plan_data jsonb not null,
  updated_at timestamptz not null default now(),
  unique (user_id, year, month)
);

-- Bật bảo mật Row Level Security (RLS) để mỗi tài khoản chỉ xem và sửa được lịch trình của chính mình
alter table public.user_plans enable row level security;

create policy "Users can view their own plans"
  on public.user_plans for select
  using (auth.uid() = user_id);

create policy "Users can insert their own plans"
  on public.user_plans for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own plans"
  on public.user_plans for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own plans"
  on public.user_plans for delete
  using (auth.uid() = user_id);
