-- ============================================================================
-- E-commerce platform — initial schema
-- Run once via Supabase Dashboard → SQL Editor (or `supabase db push` once
-- the project is linked with the CLI).
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- Enums
-- ----------------------------------------------------------------------------
create type user_role as enum ('customer', 'admin');
create type product_status as enum ('draft', 'active');
create type payment_status as enum ('pending', 'paid', 'failed', 'refunded');
create type fulfillment_status as enum ('pending', 'processing', 'shipped', 'delivered', 'cancelled');
create type coupon_type as enum ('percentage', 'fixed');

create sequence if not exists order_number_seq start 1;

-- ----------------------------------------------------------------------------
-- Tables
-- ----------------------------------------------------------------------------

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  phone text,
  avatar_url text,
  role user_role not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table site_settings (
  id uuid primary key default gen_random_uuid(),
  site_name text not null default 'My Store',
  tagline text,
  logo_url text,
  logo_inverted_url text,
  favicon_url text,
  contact_email text,
  contact_phone text,
  business_address text,
  currency_code text not null default 'INR',
  currency_symbol text not null default '₹',
  tax_rate numeric(5, 2) not null default 0,
  tax_inclusive boolean not null default false,
  announcement_bar_active boolean not null default false,
  announcement_bar_text text,
  announcement_bar_link text,
  announcement_bar_color text,
  social_instagram text,
  social_facebook text,
  social_twitter text,
  social_tiktok text,
  social_youtube text,
  updated_at timestamptz not null default now()
);

create table seo_settings (
  id uuid primary key default gen_random_uuid(),
  meta_title_template text default '{Page Title} | {Site Name}',
  default_meta_description text,
  og_default_image_url text,
  ga_tracking_id text,
  fb_pixel_id text,
  search_console_meta text,
  robots_txt text,
  updated_at timestamptz not null default now()
);

create table page_seo (
  id uuid primary key default gen_random_uuid(),
  page_slug text not null unique,
  meta_title text,
  meta_description text,
  og_image_url text
);

create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  parent_id uuid references categories (id) on delete set null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  category_id uuid references categories (id) on delete set null,
  price numeric(12, 2) not null,
  sale_price numeric(12, 2),
  sale_start timestamptz,
  sale_end timestamptz,
  sku text not null unique,
  stock_quantity integer not null default 0,
  track_inventory boolean not null default true,
  allow_backorders boolean not null default false,
  status product_status not null default 'draft',
  meta_title text,
  meta_description text,
  og_image_url text,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  image_url text not null,
  sort_order integer not null default 0,
  alt_text text
);

create table product_options (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  name text not null,
  sort_order integer not null default 0
);

create table product_option_values (
  id uuid primary key default gen_random_uuid(),
  option_id uuid not null references product_options (id) on delete cascade,
  value text not null,
  sort_order integer not null default 0
);

create table product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  sku text not null unique,
  price numeric(12, 2),
  stock_quantity integer not null default 0,
  option_values jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create table addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  full_name text not null,
  phone text,
  address_line1 text not null,
  address_line2 text,
  city text not null,
  state text not null,
  zip text not null,
  country text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique,
  user_id uuid references profiles (id) on delete set null,
  email text not null,
  shipping_address jsonb not null,
  billing_address jsonb not null,
  shipping_method text,
  shipping_cost numeric(12, 2) not null default 0,
  subtotal numeric(12, 2) not null,
  discount_amount numeric(12, 2) not null default 0,
  tax_amount numeric(12, 2) not null default 0,
  total numeric(12, 2) not null,
  coupon_code text,
  payment_status payment_status not null default 'pending',
  fulfillment_status fulfillment_status not null default 'pending',
  -- Real Razorpay fields (Orders API + client-side Checkout.js response),
  -- not the Stripe-shaped "payment_intent" naming in the original spec.
  razorpay_order_id text,
  razorpay_payment_id text,
  razorpay_signature text,
  tracking_number text,
  tracking_carrier text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  product_id uuid references products (id) on delete set null,
  variant_id uuid references product_variants (id) on delete set null,
  title text not null,
  variant_info jsonb,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12, 2) not null,
  line_total numeric(12, 2) not null
);

create table order_timeline (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  status text not null,
  note text,
  created_by uuid references profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create table reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  user_id uuid not null references profiles (id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  title text,
  body text,
  is_verified boolean not null default false,
  created_at timestamptz not null default now()
);

create table coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  type coupon_type not null,
  value numeric(12, 2) not null,
  min_order_amount numeric(12, 2),
  usage_limit integer,
  per_customer_limit integer,
  times_used integer not null default 0,
  valid_from timestamptz,
  valid_to timestamptz,
  applicable_products uuid[],
  applicable_categories uuid[],
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

create table hero_slides (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  heading text not null,
  subheading text,
  cta_text text,
  cta_link text,
  sort_order integer not null default 0,
  is_active boolean not null default true
);

create table wishlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  product_id uuid not null references products (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create table media (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  filename text not null,
  size bigint,
  mime_type text,
  uploaded_by uuid references profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- Indexes
-- ----------------------------------------------------------------------------
create index idx_products_slug on products (slug);
create index idx_products_category_id on products (category_id);
create index idx_products_status on products (status);
create index idx_categories_slug on categories (slug);
create index idx_categories_parent_id on categories (parent_id);
create index idx_orders_user_id on orders (user_id);
create index idx_orders_order_number on orders (order_number);
create index idx_order_items_order_id on order_items (order_id);
create index idx_reviews_product_id on reviews (product_id);
create index idx_coupons_code on coupons (code);
create index idx_product_images_product_id on product_images (product_id);
create index idx_product_variants_product_id on product_variants (product_id);
create index idx_wishlist_user_id on wishlist (user_id);

-- ----------------------------------------------------------------------------
-- Helper: is the current user an admin?
-- ----------------------------------------------------------------------------
create or replace function is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- ----------------------------------------------------------------------------
-- Row Level Security
-- ----------------------------------------------------------------------------
alter table profiles enable row level security;
alter table site_settings enable row level security;
alter table seo_settings enable row level security;
alter table page_seo enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;
alter table product_options enable row level security;
alter table product_option_values enable row level security;
alter table product_variants enable row level security;
alter table addresses enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table order_timeline enable row level security;
alter table reviews enable row level security;
alter table coupons enable row level security;
alter table subscribers enable row level security;
alter table hero_slides enable row level security;
alter table wishlist enable row level security;
alter table media enable row level security;

-- profiles: own row read/update; admins read all
create policy "profiles_select_own_or_admin" on profiles
  for select using (auth.uid() = id or is_admin());
create policy "profiles_update_own" on profiles
  for update using (auth.uid() = id);
create policy "profiles_insert_own" on profiles
  for insert with check (auth.uid() = id);

-- site_settings / seo_settings / page_seo: public read, admin write
create policy "site_settings_public_read" on site_settings for select using (true);
create policy "site_settings_admin_write" on site_settings for insert with check (is_admin());
create policy "site_settings_admin_update" on site_settings for update using (is_admin());
create policy "site_settings_admin_delete" on site_settings for delete using (is_admin());

create policy "seo_settings_public_read" on seo_settings for select using (true);
create policy "seo_settings_admin_write" on seo_settings for insert with check (is_admin());
create policy "seo_settings_admin_update" on seo_settings for update using (is_admin());
create policy "seo_settings_admin_delete" on seo_settings for delete using (is_admin());

create policy "page_seo_public_read" on page_seo for select using (true);
create policy "page_seo_admin_write" on page_seo for insert with check (is_admin());
create policy "page_seo_admin_update" on page_seo for update using (is_admin());
create policy "page_seo_admin_delete" on page_seo for delete using (is_admin());

-- categories: public read, admin write
create policy "categories_public_read" on categories for select using (true);
create policy "categories_admin_write" on categories for insert with check (is_admin());
create policy "categories_admin_update" on categories for update using (is_admin());
create policy "categories_admin_delete" on categories for delete using (is_admin());

-- products: public read of active products, admins see/manage everything
create policy "products_public_read" on products
  for select using (status = 'active' or is_admin());
create policy "products_admin_write" on products for insert with check (is_admin());
create policy "products_admin_update" on products for update using (is_admin());
create policy "products_admin_delete" on products for delete using (is_admin());

-- product_images / options / option_values / variants: public read, admin write
create policy "product_images_public_read" on product_images for select using (true);
create policy "product_images_admin_write" on product_images for insert with check (is_admin());
create policy "product_images_admin_update" on product_images for update using (is_admin());
create policy "product_images_admin_delete" on product_images for delete using (is_admin());

create policy "product_options_public_read" on product_options for select using (true);
create policy "product_options_admin_write" on product_options for insert with check (is_admin());
create policy "product_options_admin_update" on product_options for update using (is_admin());
create policy "product_options_admin_delete" on product_options for delete using (is_admin());

create policy "product_option_values_public_read" on product_option_values for select using (true);
create policy "product_option_values_admin_write" on product_option_values for insert with check (is_admin());
create policy "product_option_values_admin_update" on product_option_values for update using (is_admin());
create policy "product_option_values_admin_delete" on product_option_values for delete using (is_admin());

create policy "product_variants_public_read" on product_variants for select using (true);
create policy "product_variants_admin_write" on product_variants for insert with check (is_admin());
create policy "product_variants_admin_update" on product_variants for update using (is_admin());
create policy "product_variants_admin_delete" on product_variants for delete using (is_admin());

-- addresses: owner only, admins can read all
create policy "addresses_select_own_or_admin" on addresses
  for select using (auth.uid() = user_id or is_admin());
create policy "addresses_insert_own" on addresses
  for insert with check (auth.uid() = user_id);
create policy "addresses_update_own" on addresses
  for update using (auth.uid() = user_id);
create policy "addresses_delete_own" on addresses
  for delete using (auth.uid() = user_id);

-- orders: owner reads own, admins read/manage all; inserts allowed for the
-- owning user (or anonymous checkout matching by email is handled at the API layer)
create policy "orders_select_own_or_admin" on orders
  for select using (auth.uid() = user_id or is_admin());
create policy "orders_insert_own" on orders
  for insert with check (auth.uid() = user_id or user_id is null);
create policy "orders_admin_update" on orders
  for update using (is_admin());

-- order_items: readable if the parent order is readable
create policy "order_items_select" on order_items
  for select using (
    exists (
      select 1 from orders
      where orders.id = order_items.order_id
        and (orders.user_id = auth.uid() or is_admin())
    )
  );
create policy "order_items_insert" on order_items
  for insert with check (
    exists (
      select 1 from orders
      where orders.id = order_items.order_id
        and (orders.user_id = auth.uid() or orders.user_id is null)
    )
  );
create policy "order_items_admin_update" on order_items for update using (is_admin());
create policy "order_items_admin_delete" on order_items for delete using (is_admin());

-- order_timeline: readable if the parent order is readable; admins add entries
create policy "order_timeline_select" on order_timeline
  for select using (
    exists (
      select 1 from orders
      where orders.id = order_timeline.order_id
        and (orders.user_id = auth.uid() or is_admin())
    )
  );
create policy "order_timeline_admin_insert" on order_timeline
  for insert with check (is_admin());

-- reviews: public read; customers can review products from their own paid orders; admins delete
create policy "reviews_public_read" on reviews for select using (true);
create policy "reviews_insert_own_verified_purchase" on reviews
  for insert with check (
    auth.uid() = user_id
    and exists (
      select 1
      from orders
      join order_items on order_items.order_id = orders.id
      where orders.user_id = auth.uid()
        and orders.payment_status = 'paid'
        and order_items.product_id = reviews.product_id
    )
  );
create policy "reviews_update_own" on reviews for update using (auth.uid() = user_id);
create policy "reviews_delete_own_or_admin" on reviews
  for delete using (auth.uid() = user_id or is_admin());

-- coupons: admin only (validated server-side during checkout)
create policy "coupons_admin_all" on coupons
  for select using (is_admin());
create policy "coupons_admin_write" on coupons for insert with check (is_admin());
create policy "coupons_admin_update" on coupons for update using (is_admin());
create policy "coupons_admin_delete" on coupons for delete using (is_admin());

-- subscribers: anyone can insert (newsletter signup); only admins read
create policy "subscribers_public_insert" on subscribers for insert with check (true);
create policy "subscribers_admin_select" on subscribers for select using (is_admin());

-- hero_slides: public read of active slides, admin manages all
create policy "hero_slides_public_read" on hero_slides
  for select using (is_active or is_admin());
create policy "hero_slides_admin_write" on hero_slides for insert with check (is_admin());
create policy "hero_slides_admin_update" on hero_slides for update using (is_admin());
create policy "hero_slides_admin_delete" on hero_slides for delete using (is_admin());

-- wishlist: owner only
create policy "wishlist_select_own" on wishlist for select using (auth.uid() = user_id);
create policy "wishlist_insert_own" on wishlist for insert with check (auth.uid() = user_id);
create policy "wishlist_delete_own" on wishlist for delete using (auth.uid() = user_id);

-- media: admin only
create policy "media_admin_select" on media for select using (is_admin());
create policy "media_admin_insert" on media for insert with check (is_admin());
create policy "media_admin_delete" on media for delete using (is_admin());

-- ----------------------------------------------------------------------------
-- Storage buckets
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values
  ('product-images', 'product-images', true),
  ('brand-assets', 'brand-assets', true),
  ('media-library', 'media-library', true),
  ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "product_images_bucket_public_read" on storage.objects
  for select using (bucket_id = 'product-images');
create policy "product_images_bucket_admin_write" on storage.objects
  for insert with check (bucket_id = 'product-images' and is_admin());
create policy "product_images_bucket_admin_update" on storage.objects
  for update using (bucket_id = 'product-images' and is_admin());
create policy "product_images_bucket_admin_delete" on storage.objects
  for delete using (bucket_id = 'product-images' and is_admin());

create policy "brand_assets_bucket_public_read" on storage.objects
  for select using (bucket_id = 'brand-assets');
create policy "brand_assets_bucket_admin_write" on storage.objects
  for insert with check (bucket_id = 'brand-assets' and is_admin());
create policy "brand_assets_bucket_admin_update" on storage.objects
  for update using (bucket_id = 'brand-assets' and is_admin());
create policy "brand_assets_bucket_admin_delete" on storage.objects
  for delete using (bucket_id = 'brand-assets' and is_admin());

create policy "media_library_bucket_public_read" on storage.objects
  for select using (bucket_id = 'media-library');
create policy "media_library_bucket_admin_write" on storage.objects
  for insert with check (bucket_id = 'media-library' and is_admin());
create policy "media_library_bucket_admin_update" on storage.objects
  for update using (bucket_id = 'media-library' and is_admin());
create policy "media_library_bucket_admin_delete" on storage.objects
  for delete using (bucket_id = 'media-library' and is_admin());

-- avatars: each user reads/writes only their own folder, e.g. avatars/<uid>/photo.png
create policy "avatars_public_read" on storage.objects
  for select using (bucket_id = 'avatars');
create policy "avatars_own_folder_insert" on storage.objects
  for insert with check (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "avatars_own_folder_update" on storage.objects
  for update using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "avatars_own_folder_delete" on storage.objects
  for delete using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ----------------------------------------------------------------------------
-- Functions & triggers
-- ----------------------------------------------------------------------------

-- Auto-generate a friendly order number like "ORD-10001"
create or replace function generate_order_number()
returns trigger
language plpgsql
as $$
begin
  if new.order_number is null then
    new.order_number := 'ORD-' || (10000 + nextval('order_number_seq'));
  end if;
  return new;
end;
$$;

create trigger trg_orders_order_number
  before insert on orders
  for each row execute function generate_order_number();

-- Generic updated_at maintainer
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at before update on profiles
  for each row execute function set_updated_at();
create trigger trg_site_settings_updated_at before update on site_settings
  for each row execute function set_updated_at();
create trigger trg_seo_settings_updated_at before update on seo_settings
  for each row execute function set_updated_at();
create trigger trg_products_updated_at before update on products
  for each row execute function set_updated_at();
create trigger trg_orders_updated_at before update on orders
  for each row execute function set_updated_at();

-- Decrement stock when an order item is created (only if the product/variant tracks inventory)
create or replace function decrement_stock()
returns trigger
language plpgsql
as $$
begin
  if new.variant_id is not null then
    update product_variants
      set stock_quantity = greatest(stock_quantity - new.quantity, 0)
      where id = new.variant_id;
  elsif new.product_id is not null then
    update products
      set stock_quantity = greatest(stock_quantity - new.quantity, 0)
      where id = new.product_id and track_inventory = true;
  end if;
  return new;
end;
$$;

create trigger trg_order_items_decrement_stock
  after insert on order_items
  for each row execute function decrement_stock();

-- Increment coupon usage when an order carrying a coupon_code is created
create or replace function increment_coupon_usage()
returns trigger
language plpgsql
as $$
begin
  if new.coupon_code is not null then
    update coupons
      set times_used = times_used + 1
      where code = new.coupon_code;
  end if;
  return new;
end;
$$;

create trigger trg_orders_increment_coupon_usage
  after insert on orders
  for each row execute function increment_coupon_usage();
