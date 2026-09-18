-- Material units are descriptive metadata in a quote and may be left blank.
-- material_id was already nullable in the original backoffice migration.

alter table public.quote_materials
  alter column unit drop not null;

alter table public.quote_materials
  drop constraint if exists quote_materials_unit_check;

alter table public.quote_materials
  add constraint quote_materials_unit_check
  check (unit is null or char_length(btrim(unit)) between 1 and 32);

-- The original save function uses "un." as a database fallback for legacy
-- payloads. Preserve an explicitly blank unit as NULL after that compatibility
-- function has persisted the quote.
create or replace function public.save_quote(payload jsonb)
returns public.quotes
language plpgsql
security definer
set search_path = public
as $$
declare
  saved_quote public.quotes%rowtype;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  saved_quote := public.save_quote_legacy(payload);

  update public.quote_materials as quote_material
  set unit = nullif(btrim(items.item->>'unit'), '')
  from jsonb_array_elements(coalesce(payload->'materials', '[]'::jsonb))
    with ordinality as items(item, ordinal)
  where quote_material.quote_id = saved_quote.id
    and quote_material.position = coalesce(
      nullif(items.item->>'position', '')::integer,
      (items.ordinal - 1)::integer
    );

  update public.quotes
  set hourly_rate = nullif(payload->>'hourly_rate', '')::numeric,
      desired_margin = nullif(payload->>'desired_margin', '')::numeric,
      commercial_discount = nullif(payload->>'commercial_discount', '')::numeric,
      skonto = nullif(payload->>'skonto', '')::numeric,
      fixed_deduction = nullif(payload->>'fixed_deduction', '')::numeric
  where id = saved_quote.id;

  update public.quote_labor
  set hourly_rate = nullif(payload->>'hourly_rate', '')::numeric
  where quote_id = saved_quote.id;

  select * into saved_quote
  from public.quotes
  where id = saved_quote.id;

  return saved_quote;
end;
$$;

revoke all on function public.save_quote(jsonb) from public;
grant execute on function public.save_quote(jsonb) to authenticated;
