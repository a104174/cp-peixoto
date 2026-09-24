alter table public.quotes
  add column if not exists client_pdf_work_description text;

comment on column public.quotes.client_pdf_work_description is
  'Last client-facing work description used for the client quote PDF; independent from internal quote notes.';

create or replace function public.save_client_pdf_work_description(
  target_quote_id uuid,
  work_description text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  if length(coalesce(work_description, '')) > 20000 then
    raise exception 'work description is too long';
  end if;

  update public.quotes
    set client_pdf_work_description = coalesce(work_description, '')
    where id = target_quote_id;

  return found;
end;
$$;

revoke all on function public.save_client_pdf_work_description(uuid, text) from public;
grant execute on function public.save_client_pdf_work_description(uuid, text) to authenticated;
