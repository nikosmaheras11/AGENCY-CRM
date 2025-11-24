-- Comments RLS + Realtime setup (idempotent)
-- Safe to run multiple times. Targets public.comments (polymorphic comments table).

-- 1) Ensure RLS is ON and grant basic privileges (policies still gate access)
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.comments TO anon, authenticated;

-- 2) Create permissive development policies if missing
-- Select
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='comments' AND policyname='comments_select_any'
  ) THEN
    EXECUTE 'CREATE POLICY "comments_select_any"
             ON public.comments
             FOR SELECT
             TO anon, authenticated
             USING (true)';
  END IF;
END $$ LANGUAGE plpgsql;

-- Insert
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='comments' AND policyname='comments_insert_any'
  ) THEN
    EXECUTE 'CREATE POLICY "comments_insert_any"
             ON public.comments
             FOR INSERT
             TO anon, authenticated
             WITH CHECK (true)';
  END IF;
END $$ LANGUAGE plpgsql;

-- Update (for resolve/unresolve, edits)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='comments' AND policyname='comments_update_any'
  ) THEN
    EXECUTE 'CREATE POLICY "comments_update_any"
             ON public.comments
             FOR UPDATE
             TO anon, authenticated
             USING (true)
             WITH CHECK (true)';
  END IF;
END $$ LANGUAGE plpgsql;

-- 3) Ensure table is in Realtime publication (idempotent)
DO $$
BEGIN
  BEGIN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.comments';
  EXCEPTION WHEN duplicate_object THEN
    -- already added
    NULL;
  END;
END $$ LANGUAGE plpgsql;

-- 4) Quick view to assist debugging (optional, created if not exists)
-- Shows latest comments with key routing fields.
CREATE OR REPLACE VIEW public.comments_debug AS
SELECT id, entity_type, entity_id, request_id, campaign_id, ad_set_id, creative_id,
       content, x_position, y_position, created_at
FROM public.comments
ORDER BY created_at DESC;
