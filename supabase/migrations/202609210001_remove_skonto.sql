-- Remove the legacy second-discount concept without changing the financial
-- outcome of quotes that were already saved with it.
--
-- For every historical quote:
--   effective_discount = 1 - (1 - commercial_discount) * (1 - legacy_discount)
--
-- PostgreSQL numeric arithmetic is exact here. Stored totals are deliberately
-- not recalculated: after this merge, the active formula reproduces them.

update public.quotes
set commercial_discount =
  1
  - (1 - coalesce(commercial_discount, 0))
  * (1 - coalesce(skonto, 0));

-- Remove the latest wrapper and its legacy delegate before dropping the column.
-- The replacement keeps the same atomic delete-and-reinsert behavior for quote
-- lines, but no longer accepts or writes the removed field.
drop function if exists public.save_quote(jsonb);
drop function if exists public.save_quote_legacy(jsonb);

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
      fixed_deduction, materials_total, labor_total,
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
      nullif(payload->>'hourly_rate', '')::numeric,
      nullif(payload->>'desired_margin', '')::numeric,
      nullif(payload->>'commercial_discount', '')::numeric,
      nullif(payload->>'fixed_deduction', '')::numeric,
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
        hourly_rate = nullif(payload->>'hourly_rate', '')::numeric,
        desired_margin = nullif(payload->>'desired_margin', '')::numeric,
        commercial_discount = nullif(payload->>'commercial_discount', '')::numeric,
        fixed_deduction = nullif(payload->>'fixed_deduction', '')::numeric,
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
      nullif(item->>'unit', ''),
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
      nullif(item->>'hourly_rate', '')::numeric,
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

alter table public.quotes
  drop column skonto;

revoke all on function public.save_quote(jsonb) from public;
grant execute on function public.save_quote(jsonb) to authenticated;
