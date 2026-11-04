-- Apply to the same database as the existing Gremlib books catalog.
alter type public.app_role add value if not exists 'employee';

create table public.restock_requests (
  actor uuid not null references auth.users(id),
  request_id uuid not null,
  items jsonb not null,
  created_at timestamptz not null default now(),
  primary key (actor, request_id)
);
alter table public.restock_requests enable row level security;
revoke all on public.restock_requests from public, anon, authenticated;

create function public.confirm_restock(request_id uuid, items jsonb)
returns void language plpgsql security definer set search_path = '' as $$
declare
  actor_id uuid := auth.uid();
  row_item record;
  prior jsonb;
begin
  if actor_id is null or not exists (
    select 1 from public.user_roles r where r.user_id = actor_id and r.role::text in ('admin','employee')
  ) then raise exception 'Acceso restringido' using errcode = '42501'; end if;
  if request_id is null or jsonb_typeof(items) is distinct from 'array' then
    raise exception 'Solicitud no válida';
  end if;
  if jsonb_array_length(items) not between 1 and 100 then raise exception 'Revisa la selección'; end if;
  if exists (select 1 from jsonb_array_elements(items) e where
    jsonb_typeof(e->'quantity') is distinct from 'number' or
    (e->>'quantity') !~ '^[1-9][0-9]{0,3}$' or e->>'id' is null)
    or (select count(distinct (e->>'id')::uuid) from jsonb_array_elements(items) e) <> jsonb_array_length(items)
    then raise exception 'Libros o cantidades no válidos'; end if;

  insert into public.restock_requests(actor,request_id,items) values(actor_id,$1,$2)
    on conflict on constraint restock_requests_pkey do nothing;
  if not found then
    select r.items into prior from public.restock_requests r where r.actor=actor_id and r.request_id=$1;
    if prior is distinct from items then raise exception 'Solicitud ya utilizada'; end if;
    return;
  end if;
  -- Deterministic lock order for overlapping orders; increments never overwrite each other.
  for row_item in select * from jsonb_to_recordset(items) as x(id uuid,quantity integer) order by id loop
    update public.books set stock = stock + row_item.quantity where id = row_item.id;
    if not found then raise exception 'Un libro ya no pertenece al catálogo'; end if;
  end loop;
end; $$;
revoke all on function public.confirm_restock(uuid,jsonb) from public, anon;
grant execute on function public.confirm_restock(uuid,jsonb) to authenticated;
