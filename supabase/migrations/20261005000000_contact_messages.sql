create table contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  created_at timestamptz not null default now()
);

alter table contact_messages enable row level security;

-- contact_messages: anyone can insert (contact form); only admins read
create policy "contact_messages_public_insert" on contact_messages for insert with check (true);
create policy "contact_messages_admin_select" on contact_messages for select using (is_admin());
