-- ============================================================================
-- Shipping methods — required for checkout, not defined in the original
-- schema (Section 3 of the spec describes admin CRUD for these, but Section 4
-- never defines a table). Seeded with two sensible defaults so checkout is
-- functional immediately; edit/replace via the admin panel once it exists.
-- ============================================================================

create table shipping_methods (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(12, 2) not null default 0,
  estimated_delivery text,
  free_shipping_threshold numeric(12, 2),
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table shipping_methods enable row level security;

create policy "shipping_methods_public_read" on shipping_methods
  for select using (is_active or is_admin());
create policy "shipping_methods_admin_write" on shipping_methods
  for insert with check (is_admin());
create policy "shipping_methods_admin_update" on shipping_methods
  for update using (is_admin());
create policy "shipping_methods_admin_delete" on shipping_methods
  for delete using (is_admin());

insert into shipping_methods (name, description, price, estimated_delivery, sort_order)
values
  ('Standard Shipping', 'Delivered in 5–7 business days', 99, '5–7 business days', 0),
  ('Express Shipping', 'Delivered in 2–3 business days', 249, '2–3 business days', 1);
