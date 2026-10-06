-- ============================================================================
-- Base table grants for anon/authenticated roles.
--
-- Every write so far (subscribers newsletter signup, guest order creation)
-- was blocked with "new row violates row-level security policy" even for
-- policies as permissive as `with check (true)`. That message is misleading:
-- Postgres checks base GRANT privileges before RLS policies ever run, and
-- these tables — created via the SQL Editor rather than through Supabase's
-- normal provisioning flow — never received the standard anon/authenticated
-- grants Supabase projects ship with by default.
--
-- This does not weaken security: RLS policies (already defined per table)
-- remain the real access boundary. A table grant with no matching RLS policy
-- for a command still allows zero rows for that command.
-- ============================================================================

grant usage on schema public to anon, authenticated;

grant select, insert, update, delete on all tables in schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to anon;

grant usage, select on all sequences in schema public to anon, authenticated;

alter default privileges in schema public
  grant select, insert, update, delete on tables to anon, authenticated;
alter default privileges in schema public
  grant usage, select on sequences to anon, authenticated;
