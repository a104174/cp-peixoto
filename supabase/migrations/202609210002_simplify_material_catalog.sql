-- The active material catalogue is intentionally reduced to four business fields.
-- Legacy columns remain in place so existing data and integrations can be retired
-- safely in a later maintenance window. Quotes use their own snapshots and are
-- not changed by this migration.

alter table public.materials
  add column if not exists consumption_per_m2 numeric
    check (consumption_per_m2 is null or consumption_per_m2 >= 0),
  add column if not exists price_per_kg numeric
    check (price_per_kg is null or price_per_kg >= 0),
  add column if not exists price_per_container numeric
    check (price_per_container is null or price_per_container >= 0);

-- The catalogue already used the discounted values as its suggested prices.
-- Keep those exact numeric values; do not derive package prices from kg prices.
update public.materials
set
  consumption_per_m2 = coalesce(consumption_per_m2, consumption),
  price_per_kg = coalesce(price_per_kg, discounted_unit_price),
  price_per_container = coalesce(price_per_container, discounted_package_price);

-- Make package and variant distinctions visible in the single active name.
-- Do not repeat a suffix that is already part of the material name.
update public.materials
set name = concat_ws(
  ' - ',
  nullif(btrim(name), ''),
  case
    when nullif(btrim(variant), '') is not null
      and position(lower(btrim(variant)) in lower(btrim(name))) = 0
    then btrim(variant)
  end,
  case
    when nullif(btrim(package_label), '') is not null
      and position(lower(btrim(package_label)) in lower(btrim(name))) = 0
    then btrim(package_label)
  end
)
where nullif(btrim(variant), '') is not null
   or nullif(btrim(package_label), '') is not null;

create index if not exists materials_name_lower_idx
  on public.materials (lower(name));

comment on column public.materials.consumption_per_m2 is
  'Active catalogue reference consumption in kg/m². Legacy consumption columns are retained for compatibility.';
comment on column public.materials.price_per_kg is
  'Active suggested catalogue price in CHF/kg, migrated from discounted_unit_price.';
comment on column public.materials.price_per_container is
  'Active suggested catalogue price per container, migrated from discounted_package_price.';
