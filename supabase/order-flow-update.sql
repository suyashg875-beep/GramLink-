-- Gramlink order flow update
-- Run this once in Supabase SQL Editor after the orders/seller_profiles columns already exist.

drop function if exists public.place_order(jsonb, text, text, text);

create or replace function public.place_order(
  _items jsonb,
  _name text,
  _phone text,
  _address text,
  _fulfillment_method text default 'delivery',
  _customer_lat double precision default null,
  _customer_lng double precision default null
)
returns uuid[]
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  it jsonb;
  p public.products%rowtype;
  q int;
  seller uuid;
  oid uuid;
  ids uuid[] := '{}';
begin
  if uid is null then raise exception 'Please log in'; end if;
  if coalesce(trim(_name),'') = '' or coalesce(trim(_phone),'') = '' then
    raise exception 'Name and phone are required';
  end if;
  if _fulfillment_method not in ('delivery','pickup') then
    raise exception 'Invalid fulfillment method';
  end if;
  if _fulfillment_method = 'delivery' and coalesce(trim(_address),'') = '' then
    raise exception 'Delivery address is required';
  end if;
  if jsonb_array_length(_items) = 0 then raise exception 'Cart is empty'; end if;

  for seller in
    select distinct pr.seller_id
    from jsonb_array_elements(_items) e
    join public.products pr on pr.id = (e->>'product_id')::uuid
  loop
    insert into public.orders (
      customer_id, seller_id, customer_name, phone, address, total,
      fulfillment_method, customer_lat, customer_lng
    )
    values (
      uid, seller, trim(_name), trim(_phone), trim(_address), 0,
      _fulfillment_method, _customer_lat, _customer_lng
    )
    returning id into oid;

    for it in select * from jsonb_array_elements(_items) loop
      select * into p
      from public.products
      where id = (it->>'product_id')::uuid
      for update;

      if not found or p.seller_id <> seller then continue; end if;
      q := (it->>'quantity')::int;
      if q is null or q < 1 then raise exception 'Invalid quantity'; end if;
      if not (p.is_published and p.is_available and public.is_verified_seller(p.seller_id)) then
        raise exception '% is not available', p.name;
      end if;
      if p.stock < q then raise exception 'Only % left for %', p.stock, p.name; end if;

      update public.products set stock = stock - q where id = p.id;
      insert into public.order_items (order_id, product_id, product_name, price, quantity)
      values (oid, p.id, p.name, p.price, q);
    end loop;

    update public.orders
    set total = (
      select coalesce(sum(price * quantity), 0)
      from public.order_items
      where order_id = oid
    )
    where id = oid;

    ids := ids || oid;
  end loop;

  if array_length(ids,1) is null then raise exception 'No valid products'; end if;
  return ids;
end $$;

revoke execute on function public.place_order(jsonb,text,text,text,text,double precision,double precision) from public, anon;
grant execute on function public.place_order(jsonb,text,text,text,text,double precision,double precision) to authenticated;
