-- Keep blank optional quote inputs blank when saving a new or partial quote.
-- This migration changes schema/function behavior only; it does not rewrite existing quotes.

alter table public.quotes
  alter column hourly_rate drop default,
  alter column hourly_rate drop not null,
  alter column desired_margin drop default,
  alter column desired_margin drop not null,
  alter column commercial_discount drop default,
  alter column commercial_discount drop not null,
  alter column skonto drop default,
  alter column skonto drop not null,
  alter column fixed_deduction drop default,
  alter column fixed_deduction drop not null;

alter table public.quote_labor
  alter column hourly_rate drop default,
  alter column hourly_rate drop not null;

-- Keep the public function name used by the application while retaining the
-- previously deployed implementation as an internal compatibility delegate.
alter function public.save_quote(jsonb) rename to save_quote_legacy;

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

revoke all on function public.save_quote_legacy(jsonb) from public, authenticated;
revoke all on function public.save_quote(jsonb) from public;
grant execute on function public.save_quote(jsonb) to authenticated;
