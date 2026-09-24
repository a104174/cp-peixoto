alter table public.quotes
  add column if not exists deleted_at timestamptz;

comment on column public.quotes.deleted_at is
  'Soft-delete timestamp. Deleted quote data and its number remain preserved.';

create index if not exists quotes_active_created_idx
  on public.quotes (created_at desc)
  where deleted_at is null;

drop policy if exists quotes_authenticated_soft_delete on public.quotes;
create policy quotes_authenticated_soft_delete
on public.quotes for update to authenticated
using (auth.uid() is not null and deleted_at is null)
with check (auth.uid() is not null and deleted_at is not null);

grant update (deleted_at) on public.quotes to authenticated;

-- Keep the existing save transaction while rejecting stale edits to deleted
-- quotes. The row lock serializes saves with soft deletes.
alter function public.save_quote(jsonb)
  rename to save_quote_before_deleted_guard;

revoke all on function public.save_quote_before_deleted_guard(jsonb)
  from public, authenticated;

create function public.save_quote(payload jsonb)
returns public.quotes
language plpgsql
security definer
set search_path = public
as $$
declare
  quote_id_value uuid;
  locked_quote public.quotes%rowtype;
  saved_quote public.quotes%rowtype;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  quote_id_value := nullif(payload->>'id', '')::uuid;

  if quote_id_value is not null then
    select * into locked_quote
    from public.quotes
    where id = quote_id_value
    for update;

    if not found or locked_quote.deleted_at is not null then
      raise exception using errcode = 'P0002', message = 'quote not found';
    end if;
  end if;

  saved_quote := public.save_quote_before_deleted_guard(payload);
  return saved_quote;
end;
$$;

revoke all on function public.save_quote(jsonb) from public;
grant execute on function public.save_quote(jsonb) to authenticated;

create function public.soft_delete_quote(target_quote_id uuid)
returns boolean
language plpgsql
security invoker
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  update public.quotes
    set deleted_at = now()
    where id = target_quote_id
      and deleted_at is null;

  return found;
end;
$$;

revoke all on function public.soft_delete_quote(uuid) from public, anon;
grant execute on function public.soft_delete_quote(uuid) to authenticated;

-- A client PDF request that races with deletion must not persist its description
-- or receive a PDF after the quote has been soft-deleted.
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
    where id = target_quote_id
      and deleted_at is null;

  return found;
end;
$$;

revoke all on function public.save_client_pdf_work_description(uuid, text)
  from public;
grant execute on function public.save_client_pdf_work_description(uuid, text)
  to authenticated;
