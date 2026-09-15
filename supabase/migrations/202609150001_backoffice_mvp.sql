create extension if not exists "pgcrypto";

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 160),
  email text,
  phone text,
  address text,
  postal_code text,
  locality text,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint clients_email_length check (email is null or char_length(email) <= 320),
  constraint clients_phone_length check (phone is null or char_length(phone) <= 60)
);

create table if not exists public.materials (
  id uuid primary key default gen_random_uuid(),
  brand text not null default 'WestWood' check (char_length(btrim(brand)) between 1 and 120),
  name text not null check (char_length(btrim(name)) between 1 and 160),
  variant text,
  category text,
  package_label text,
  package_quantity numeric check (package_quantity is null or package_quantity >= 0),
  package_unit text,
  calculation_type text not null check (calculation_type in ('per_m2', 'fixed')),
  consumption numeric check (consumption is null or consumption >= 0),
  consumption_unit text,
  unit text not null check (char_length(btrim(unit)) between 1 and 32),
  base_unit_price numeric check (base_unit_price is null or base_unit_price >= 0),
  discounted_unit_price numeric check (discounted_unit_price is null or discounted_unit_price >= 0),
  base_package_price numeric check (base_package_price is null or base_package_price >= 0),
  discounted_package_price numeric check (discounted_package_price is null or discounted_package_price >= 0),
  discount_rate numeric check (discount_rate is null or discount_rate between 0 and 1),
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  quote_number text unique not null check (quote_number ~ '^CP-[0-9]{4}-[0-9]{4,}$'),
  client_id uuid references public.clients(id) on delete set null,
  client_name_snapshot text,
  client_email_snapshot text,
  client_phone_snapshot text,
  client_address_snapshot text,
  project_location text,
  quote_date date not null default current_date,
  description text,
  area numeric check (area is null or area >= 0),
  area_unit text not null default 'm²',
  hourly_rate numeric not null default 52 check (hourly_rate >= 0),
  desired_margin numeric not null default 0.1069 check (desired_margin >= 0 and desired_margin < 1),
  commercial_discount numeric not null default 0.02 check (commercial_discount >= 0 and commercial_discount < 1),
  skonto numeric not null default 0.02 check (skonto >= 0 and skonto < 1),
  fixed_deduction numeric not null default 0 check (fixed_deduction >= 0),
  materials_total numeric not null default 0 check (materials_total >= 0),
  labor_total numeric not null default 0 check (labor_total >= 0),
  subcontracts_total numeric not null default 0 check (subcontracts_total >= 0),
  equipment_total numeric not null default 0 check (equipment_total >= 0),
  direct_costs_total numeric not null default 0 check (direct_costs_total >= 0),
  surcharges_total numeric not null default 0 check (surcharges_total >= 0),
  total_cost numeric not null default 0 check (total_cost >= 0),
  recommended_gross numeric not null default 0 check (recommended_gross >= 0),
  manual_gross numeric check (manual_gross is null or manual_gross >= 0),
  gross_used numeric not null default 0 check (gross_used >= 0),
  net_value numeric not null default 0,
  profit numeric not null default 0,
  real_margin numeric not null default 0,
  total_hours numeric not null default 0 check (total_hours >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quote_materials (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quotes(id) on delete cascade,
  material_id uuid references public.materials(id) on delete set null,
  position integer not null check (position >= 0),
  stage text,
  material_name_snapshot text not null check (char_length(btrim(material_name_snapshot)) between 1 and 200),
  variant_snapshot text,
  package_snapshot text,
  calculation_type text not null check (calculation_type in ('per_m2', 'fixed')),
  consumption_or_quantity numeric not null check (consumption_or_quantity >= 0),
  unit text not null check (char_length(btrim(unit)) between 1 and 32),
  unit_price numeric not null check (unit_price >= 0),
  area_factor numeric not null check (area_factor >= 0),
  cost_total numeric not null check (cost_total >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quote_labor (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quotes(id) on delete cascade,
  position integer not null check (position >= 0),
  label text not null default '',
  people numeric not null default 0 check (people >= 0),
  work_hours_per_person numeric not null default 0 check (work_hours_per_person >= 0),
  travel_hours_per_person numeric not null default 0 check (travel_hours_per_person >= 0),
  total_hours numeric not null default 0 check (total_hours >= 0),
  hourly_rate numeric not null default 0 check (hourly_rate >= 0),
  cost_total numeric not null default 0 check (cost_total >= 0),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quote_subcontracts (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quotes(id) on delete cascade,
  position integer not null check (position >= 0),
  description text not null default '',
  quantity numeric not null default 0 check (quantity >= 0),
  unit text not null default 'un.',
  unit_price numeric not null default 0 check (unit_price >= 0),
  total_amount numeric not null default 0 check (total_amount >= 0),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quote_equipment (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quotes(id) on delete cascade,
  position integer not null check (position >= 0),
  description text not null default '',
  quantity numeric not null default 0 check (quantity >= 0),
  unit text not null default 'un.',
  unit_price numeric not null default 0 check (unit_price >= 0),
  total_amount numeric not null default 0 check (total_amount >= 0),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quote_surcharges (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quotes(id) on delete cascade,
  position integer not null check (position >= 0),
  name text not null default '',
  base_type text not null check (base_type in (
    'subcontracts',
    'materials',
    'labor',
    'equipment',
    'labor_plus_equipment',
    'direct_costs',
    'direct_costs_plus_previous'
  )),
  rate numeric not null default 0 check (rate >= 0 and rate < 1),
  base_amount numeric not null default 0 check (base_amount >= 0),
  amount numeric not null default 0 check (amount >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quote_counters (
  year integer primary key check (year between 2000 and 2200),
  last_value integer not null default 0 check (last_value >= 0),
  updated_at timestamptz not null default now()
);

create unique index if not exists materials_catalog_identity_idx
  on public.materials (
    lower(brand),
    lower(name),
    lower(coalesce(variant, '')),
    lower(coalesce(package_label, ''))
  );

create index if not exists materials_name_idx on public.materials (name);
create index if not exists materials_active_idx on public.materials (is_active);
create index if not exists clients_name_idx on public.clients (name);
create index if not exists clients_active_idx on public.clients (is_active);
create index if not exists quotes_number_idx on public.quotes (quote_number);
create index if not exists quotes_client_idx on public.quotes (client_id);
create index if not exists quotes_created_idx on public.quotes (created_at desc);
create index if not exists quote_materials_quote_idx on public.quote_materials (quote_id);
create index if not exists quote_labor_quote_idx on public.quote_labor (quote_id);
create index if not exists quote_subcontracts_quote_idx on public.quote_subcontracts (quote_id);
create index if not exists quote_equipment_quote_idx on public.quote_equipment (quote_id);
create index if not exists quote_surcharges_quote_idx on public.quote_surcharges (quote_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists clients_set_updated_at on public.clients;
create trigger clients_set_updated_at
before update on public.clients
for each row execute function public.set_updated_at();

drop trigger if exists materials_set_updated_at on public.materials;
create trigger materials_set_updated_at
before update on public.materials
for each row execute function public.set_updated_at();

drop trigger if exists quotes_set_updated_at on public.quotes;
create trigger quotes_set_updated_at
before update on public.quotes
for each row execute function public.set_updated_at();

drop trigger if exists quote_materials_set_updated_at on public.quote_materials;
create trigger quote_materials_set_updated_at
before update on public.quote_materials
for each row execute function public.set_updated_at();

drop trigger if exists quote_labor_set_updated_at on public.quote_labor;
create trigger quote_labor_set_updated_at
before update on public.quote_labor
for each row execute function public.set_updated_at();

drop trigger if exists quote_subcontracts_set_updated_at on public.quote_subcontracts;
create trigger quote_subcontracts_set_updated_at
before update on public.quote_subcontracts
for each row execute function public.set_updated_at();

drop trigger if exists quote_equipment_set_updated_at on public.quote_equipment;
create trigger quote_equipment_set_updated_at
before update on public.quote_equipment
for each row execute function public.set_updated_at();

drop trigger if exists quote_surcharges_set_updated_at on public.quote_surcharges;
create trigger quote_surcharges_set_updated_at
before update on public.quote_surcharges
for each row execute function public.set_updated_at();

alter table public.clients enable row level security;
alter table public.materials enable row level security;
alter table public.quotes enable row level security;
alter table public.quote_materials enable row level security;
alter table public.quote_labor enable row level security;
alter table public.quote_subcontracts enable row level security;
alter table public.quote_equipment enable row level security;
alter table public.quote_surcharges enable row level security;
alter table public.quote_counters enable row level security;

drop policy if exists clients_authenticated_all on public.clients;
create policy clients_authenticated_all
on public.clients for all to authenticated
using (auth.uid() is not null)
with check (auth.uid() is not null);

drop policy if exists materials_authenticated_all on public.materials;
create policy materials_authenticated_all
on public.materials for all to authenticated
using (auth.uid() is not null)
with check (auth.uid() is not null);

drop policy if exists quotes_authenticated_select on public.quotes;
create policy quotes_authenticated_select
on public.quotes for select to authenticated
using (auth.uid() is not null);

drop policy if exists quote_materials_authenticated_select on public.quote_materials;
create policy quote_materials_authenticated_select
on public.quote_materials for select to authenticated
using (auth.uid() is not null);

drop policy if exists quote_labor_authenticated_select on public.quote_labor;
create policy quote_labor_authenticated_select
on public.quote_labor for select to authenticated
using (auth.uid() is not null);

drop policy if exists quote_subcontracts_authenticated_select on public.quote_subcontracts;
create policy quote_subcontracts_authenticated_select
on public.quote_subcontracts for select to authenticated
using (auth.uid() is not null);

drop policy if exists quote_equipment_authenticated_select on public.quote_equipment;
create policy quote_equipment_authenticated_select
on public.quote_equipment for select to authenticated
using (auth.uid() is not null);

drop policy if exists quote_surcharges_authenticated_select on public.quote_surcharges;
create policy quote_surcharges_authenticated_select
on public.quote_surcharges for select to authenticated
using (auth.uid() is not null);

create or replace function public.next_quote_number()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  current_year integer := extract(year from current_date)::integer;
  next_value integer;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  insert into public.quote_counters (year, last_value)
  values (current_year, 1)
  on conflict (year) do update
    set last_value = public.quote_counters.last_value + 1,
        updated_at = now()
  returning last_value into next_value;

  return format('CP-%s-%s', current_year, lpad(next_value::text, 4, '0'));
end;
$$;

create or replace function public.save_quote(payload jsonb)
returns public.quotes
language plpgsql
security definer
set search_path = public
as $$
declare
  quote_id_value uuid := nullif(payload->>'id', '')::uuid;
  quote_number_value text;
  client_id_value uuid := nullif(payload->>'client_id', '')::uuid;
  client_name_value text;
  client_email_value text;
  client_phone_value text;
  client_address_value text;
  client_postal_code_value text;
  client_locality_value text;
  saved_quote public.quotes%rowtype;
  item jsonb;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  if client_id_value is not null then
    select name, email, phone, address, postal_code, locality
      into client_name_value, client_email_value, client_phone_value,
           client_address_value, client_postal_code_value, client_locality_value
    from public.clients
    where id = client_id_value;

    if not found then
      raise exception 'client not found';
    end if;
  end if;

  if quote_id_value is null then
    quote_number_value := public.next_quote_number();

    insert into public.quotes (
      quote_number, client_id,
      client_name_snapshot, client_email_snapshot, client_phone_snapshot,
      client_address_snapshot, project_location, quote_date, description,
      area, area_unit, hourly_rate, desired_margin, commercial_discount,
      skonto, fixed_deduction, materials_total, labor_total,
      subcontracts_total, equipment_total, direct_costs_total,
      surcharges_total, total_cost, recommended_gross, manual_gross,
      gross_used, net_value, profit, real_margin, total_hours
    )
    values (
      quote_number_value, client_id_value,
      client_name_value, client_email_value, client_phone_value,
      nullif(concat_ws(', ', nullif(client_address_value, ''), nullif(client_postal_code_value || ' ' || client_locality_value, '')), ''),
      nullif(payload->>'project_location', ''),
      case when nullif(payload->>'quote_date', '') is null
        then current_date else (payload->>'quote_date')::date end,
      nullif(payload->>'description', ''),
      nullif(payload->>'area', '')::numeric,
      coalesce(nullif(payload->>'area_unit', ''), 'm²'),
      coalesce(nullif(payload->>'hourly_rate', ''), '0')::numeric,
      coalesce(nullif(payload->>'desired_margin', ''), '0')::numeric,
      coalesce(nullif(payload->>'commercial_discount', ''), '0')::numeric,
      coalesce(nullif(payload->>'skonto', ''), '0')::numeric,
      coalesce(nullif(payload->>'fixed_deduction', ''), '0')::numeric,
      coalesce(nullif(payload->>'materials_total', ''), '0')::numeric,
      coalesce(nullif(payload->>'labor_total', ''), '0')::numeric,
      coalesce(nullif(payload->>'subcontracts_total', ''), '0')::numeric,
      coalesce(nullif(payload->>'equipment_total', ''), '0')::numeric,
      coalesce(nullif(payload->>'direct_costs_total', ''), '0')::numeric,
      coalesce(nullif(payload->>'surcharges_total', ''), '0')::numeric,
      coalesce(nullif(payload->>'total_cost', ''), '0')::numeric,
      coalesce(nullif(payload->>'recommended_gross', ''), '0')::numeric,
      nullif(payload->>'manual_gross', '')::numeric,
      coalesce(nullif(payload->>'gross_used', ''), '0')::numeric,
      coalesce(nullif(payload->>'net_value', ''), '0')::numeric,
      coalesce(nullif(payload->>'profit', ''), '0')::numeric,
      coalesce(nullif(payload->>'real_margin', ''), '0')::numeric,
      coalesce(nullif(payload->>'total_hours', ''), '0')::numeric
    )
    returning * into saved_quote;
  else
    update public.quotes
    set client_id = client_id_value,
        client_name_snapshot = client_name_value,
        client_email_snapshot = client_email_value,
        client_phone_snapshot = client_phone_value,
        client_address_snapshot = nullif(concat_ws(', ', nullif(client_address_value, ''), nullif(client_postal_code_value || ' ' || client_locality_value, '')), ''),
        project_location = nullif(payload->>'project_location', ''),
        quote_date = case when nullif(payload->>'quote_date', '') is null
          then quote_date else (payload->>'quote_date')::date end,
        description = nullif(payload->>'description', ''),
        area = nullif(payload->>'area', '')::numeric,
        area_unit = coalesce(nullif(payload->>'area_unit', ''), 'm²'),
        hourly_rate = coalesce(nullif(payload->>'hourly_rate', ''), '0')::numeric,
        desired_margin = coalesce(nullif(payload->>'desired_margin', ''), '0')::numeric,
        commercial_discount = coalesce(nullif(payload->>'commercial_discount', ''), '0')::numeric,
        skonto = coalesce(nullif(payload->>'skonto', ''), '0')::numeric,
        fixed_deduction = coalesce(nullif(payload->>'fixed_deduction', ''), '0')::numeric,
        materials_total = coalesce(nullif(payload->>'materials_total', ''), '0')::numeric,
        labor_total = coalesce(nullif(payload->>'labor_total', ''), '0')::numeric,
        subcontracts_total = coalesce(nullif(payload->>'subcontracts_total', ''), '0')::numeric,
        equipment_total = coalesce(nullif(payload->>'equipment_total', ''), '0')::numeric,
        direct_costs_total = coalesce(nullif(payload->>'direct_costs_total', ''), '0')::numeric,
        surcharges_total = coalesce(nullif(payload->>'surcharges_total', ''), '0')::numeric,
        total_cost = coalesce(nullif(payload->>'total_cost', ''), '0')::numeric,
        recommended_gross = coalesce(nullif(payload->>'recommended_gross', ''), '0')::numeric,
        manual_gross = nullif(payload->>'manual_gross', '')::numeric,
        gross_used = coalesce(nullif(payload->>'gross_used', ''), '0')::numeric,
        net_value = coalesce(nullif(payload->>'net_value', ''), '0')::numeric,
        profit = coalesce(nullif(payload->>'profit', ''), '0')::numeric,
        real_margin = coalesce(nullif(payload->>'real_margin', ''), '0')::numeric,
        total_hours = coalesce(nullif(payload->>'total_hours', ''), '0')::numeric
    where id = quote_id_value
    returning * into saved_quote;

    if not found then
      raise exception 'quote not found';
    end if;
  end if;

  delete from public.quote_materials where quote_id = saved_quote.id;
  delete from public.quote_labor where quote_id = saved_quote.id;
  delete from public.quote_subcontracts where quote_id = saved_quote.id;
  delete from public.quote_equipment where quote_id = saved_quote.id;
  delete from public.quote_surcharges where quote_id = saved_quote.id;

  for item in select value from jsonb_array_elements(coalesce(payload->'materials', '[]'::jsonb))
  loop
    insert into public.quote_materials (
      quote_id, material_id, position, stage, material_name_snapshot,
      variant_snapshot, package_snapshot, calculation_type,
      consumption_or_quantity, unit, unit_price, area_factor, cost_total, notes
    )
    values (
      saved_quote.id, nullif(item->>'material_id', '')::uuid,
      coalesce(nullif(item->>'position', ''), '0')::integer,
      nullif(item->>'stage', ''),
      coalesce(nullif(item->>'material_name_snapshot', ''), 'Material manual'),
      nullif(item->>'variant_snapshot', ''),
      nullif(item->>'package_snapshot', ''),
      coalesce(nullif(item->>'calculation_type', ''), 'fixed'),
      coalesce(nullif(item->>'consumption_or_quantity', ''), '0')::numeric,
      coalesce(nullif(item->>'unit', ''), 'un.'),
      coalesce(nullif(item->>'unit_price', ''), '0')::numeric,
      coalesce(nullif(item->>'area_factor', ''), '1')::numeric,
      coalesce(nullif(item->>'cost_total', ''), '0')::numeric,
      nullif(item->>'notes', '')
    );
  end loop;

  for item in select value from jsonb_array_elements(coalesce(payload->'labor', '[]'::jsonb))
  loop
    insert into public.quote_labor (
      quote_id, position, label, people, work_hours_per_person,
      travel_hours_per_person, total_hours, hourly_rate, cost_total, note
    )
    values (
      saved_quote.id,
      coalesce(nullif(item->>'position', ''), '0')::integer,
      coalesce(item->>'label', ''),
      coalesce(nullif(item->>'people', ''), '0')::numeric,
      coalesce(nullif(item->>'work_hours_per_person', ''), '0')::numeric,
      coalesce(nullif(item->>'travel_hours_per_person', ''), '0')::numeric,
      coalesce(nullif(item->>'total_hours', ''), '0')::numeric,
      coalesce(nullif(item->>'hourly_rate', ''), '0')::numeric,
      coalesce(nullif(item->>'cost_total', ''), '0')::numeric,
      nullif(item->>'note', '')
    );
  end loop;

  for item in select value from jsonb_array_elements(coalesce(payload->'subcontracts', '[]'::jsonb))
  loop
    insert into public.quote_subcontracts (
      quote_id, position, description, quantity, unit, unit_price, total_amount, note
    )
    values (
      saved_quote.id,
      coalesce(nullif(item->>'position', ''), '0')::integer,
      coalesce(item->>'description', ''),
      coalesce(nullif(item->>'quantity', ''), '0')::numeric,
      coalesce(nullif(item->>'unit', ''), 'un.'),
      coalesce(nullif(item->>'unit_price', ''), '0')::numeric,
      coalesce(nullif(item->>'total_amount', ''), '0')::numeric,
      nullif(item->>'note', '')
    );
  end loop;

  for item in select value from jsonb_array_elements(coalesce(payload->'equipment', '[]'::jsonb))
  loop
    insert into public.quote_equipment (
      quote_id, position, description, quantity, unit, unit_price, total_amount, note
    )
    values (
      saved_quote.id,
      coalesce(nullif(item->>'position', ''), '0')::integer,
      coalesce(item->>'description', ''),
      coalesce(nullif(item->>'quantity', ''), '0')::numeric,
      coalesce(nullif(item->>'unit', ''), 'un.'),
      coalesce(nullif(item->>'unit_price', ''), '0')::numeric,
      coalesce(nullif(item->>'total_amount', ''), '0')::numeric,
      nullif(item->>'note', '')
    );
  end loop;

  for item in select value from jsonb_array_elements(coalesce(payload->'surcharges', '[]'::jsonb))
  loop
    insert into public.quote_surcharges (
      quote_id, position, name, base_type, rate, base_amount, amount
    )
    values (
      saved_quote.id,
      coalesce(nullif(item->>'position', ''), '0')::integer,
      coalesce(item->>'name', ''),
      coalesce(nullif(item->>'base_type', ''), 'direct_costs'),
      coalesce(nullif(item->>'rate', ''), '0')::numeric,
      coalesce(nullif(item->>'base_amount', ''), '0')::numeric,
      coalesce(nullif(item->>'amount', ''), '0')::numeric
    );
  end loop;

  return saved_quote;
end;
$$;

revoke all on function public.next_quote_number() from public;
grant execute on function public.next_quote_number() to authenticated;

revoke all on function public.save_quote(jsonb) from public;
grant execute on function public.save_quote(jsonb) to authenticated;

grant select, insert, update, delete on public.clients to authenticated;
grant select, insert, update, delete on public.materials to authenticated;
grant select on public.quotes to authenticated;
grant select on public.quote_materials to authenticated;
grant select on public.quote_labor to authenticated;
grant select on public.quote_subcontracts to authenticated;
grant select on public.quote_equipment to authenticated;
grant select on public.quote_surcharges to authenticated;
