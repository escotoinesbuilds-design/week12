create table if not exists public.providers (
  id text primary key,
  name text not null check (char_length(name) between 1 and 120),
  consultation_price_mxn numeric(10, 2)
    check (consultation_price_mxn is null or consultation_price_mxn >= 0),
  distance_km numeric(8, 2)
    check (distance_km is null or distance_km >= 0),
  schedules text[]
    check (
      schedules is null
      or (
        cardinality(schedules) > 0
        and schedules <@ array['manana', 'tarde', 'noche']::text[]
      )
    ),
  gender text check (gender is null or gender in ('mujer', 'hombre')),
  data_status text not null default 'simulated'
    check (data_status in ('simulated', 'unverified'))
);

alter table public.providers enable row level security;

drop policy if exists "Public can read provider records" on public.providers;
create policy "Public can read provider records"
  on public.providers
  for select
  to anon, authenticated
  using (true);

revoke all on table public.providers from anon, authenticated;
grant select on table public.providers to anon, authenticated;
