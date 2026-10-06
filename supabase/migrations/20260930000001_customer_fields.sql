-- Step 15 (Admin Customer Management) needs an internal-notes field and an
-- account status flag, neither of which existed on profiles.
alter table profiles add column if not exists internal_notes text;
alter table profiles add column if not exists is_active boolean not null default true;

-- profiles had no admin-write policy at all (only own-row read/update/insert),
-- so an admin session couldn't update another customer's profile.
create policy "profiles_admin_update" on profiles for update using (is_admin());
