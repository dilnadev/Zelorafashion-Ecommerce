-- Admin order list (Step 13) filters/sorts by these columns; index them
-- now so the list stays fast as order volume grows.
create index if not exists idx_orders_created_at on orders (created_at desc);
create index if not exists idx_orders_payment_status on orders (payment_status);
create index if not exists idx_orders_fulfillment_status on orders (fulfillment_status);
