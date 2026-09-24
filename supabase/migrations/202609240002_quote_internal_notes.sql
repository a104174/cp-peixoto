alter table public.quotes
  add column if not exists internal_notes text;

comment on column public.quotes.internal_notes is
  'Private backoffice follow-up notes. Not part of either quote PDF or client views.';

-- Keep the established quote save transaction and append persistence for the
-- optional internal note in the same RPC call.
alter function public.save_quote(jsonb)
  rename to save_quote_before_internal_notes;

revoke all on function public.save_quote_before_internal_notes(jsonb)
  from public, authenticated;

create function public.save_quote(payload jsonb)
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

  saved_quote := public.save_quote_before_internal_notes(payload);

  if payload ? 'internal_notes' then
    update public.quotes
      set internal_notes = nullif(payload->>'internal_notes', '')
      where id = saved_quote.id
      returning * into saved_quote;
  end if;

  return saved_quote;
end;
$$;

revoke all on function public.save_quote(jsonb) from public;
grant execute on function public.save_quote(jsonb) to authenticated;
