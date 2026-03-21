-- ═══════════════════════════════════════════════════════════════
-- VCT PLATFORM — Baseline Rollback (DANGEROUS)
-- Drops ALL tables, types, functions created by the baseline.
-- Only use this to completely reset a database.
-- ═══════════════════════════════════════════════════════════════

DO $$
DECLARE
    r RECORD;
BEGIN
    -- Drop all tables in public schema
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename != 'schema_migrations')
    LOOP
        EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;

    -- Drop all custom types
    FOR r IN (SELECT typname FROM pg_type WHERE typnamespace = 'public'::regnamespace AND typtype = 'e')
    LOOP
        EXECUTE 'DROP TYPE IF EXISTS public.' || quote_ident(r.typname) || ' CASCADE';
    END LOOP;

    -- Drop all functions
    FOR r IN (SELECT proname, oidvectortypes(proargtypes) as args
              FROM pg_proc WHERE pronamespace = 'public'::regnamespace)
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS public.' || quote_ident(r.proname) || '(' || r.args || ') CASCADE';
    END LOOP;
END $$;
