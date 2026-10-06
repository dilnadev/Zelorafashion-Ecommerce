-- Step 16 (Search) queries products.title/description with ilike '%...%',
-- which can't use a plain btree index. pg_trgm + GIN lets Postgres use an
-- index for these substring searches instead of a full sequential scan.
create extension if not exists pg_trgm;

create index if not exists idx_products_title_trgm on products using gin (title gin_trgm_ops);
create index if not exists idx_products_description_trgm on products using gin (description gin_trgm_ops);
