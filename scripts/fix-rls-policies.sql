-- ============================================
-- Fix RLS Policies for Public Read Access
-- ============================================
-- Run this in Supabase Dashboard > SQL Editor
-- This allows anonymous (unauthenticated) users to read data

-- REQUESTS table
DROP POLICY IF EXISTS "Enable read access for all users" ON public.requests;
CREATE POLICY "Enable read access for all users"
ON public.requests
FOR SELECT
USING (true);

-- CLIENTS table
DROP POLICY IF EXISTS "Enable read access for all users" ON public.clients;
CREATE POLICY "Enable read access for all users"
ON public.clients
FOR SELECT
USING (true);

-- ASSETS table
DROP POLICY IF EXISTS "Enable read access for all users" ON public.assets;
CREATE POLICY "Enable read access for all users"
ON public.assets
FOR SELECT
USING (true);

-- PROFILES table
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
CREATE POLICY "Enable read access for all users"
ON public.profiles
FOR SELECT
USING (true);

-- COMMENTS table
DROP POLICY IF EXISTS "Enable read access for all users" ON public.comments;
CREATE POLICY "Enable read access for all users"
ON public.comments
FOR SELECT
USING (true);

-- ASSET_VERSIONS table
DROP POLICY IF EXISTS "Enable read access for all users" ON public.asset_versions;
CREATE POLICY "Enable read access for all users"
ON public.asset_versions
FOR SELECT
USING (true);

-- SLACK_MESSAGES table
DROP POLICY IF EXISTS "Enable read access for all users" ON public.slack_messages;
CREATE POLICY "Enable read access for all users"
ON public.slack_messages
FOR SELECT
USING (true);

-- ACTIVITY_LOG table
DROP POLICY IF EXISTS "Enable read access for all users" ON public.activity_log;
CREATE POLICY "Enable read access for all users"
ON public.activity_log
FOR SELECT
USING (true);

-- MENTIONS table
DROP POLICY IF EXISTS "Enable read access for all users" ON public.mentions;
CREATE POLICY "Enable read access for all users"
ON public.mentions
FOR SELECT
USING (true);

-- SHARE_LINKS table
DROP POLICY IF EXISTS "Enable read access for all users" ON public.share_links;
CREATE POLICY "Enable read access for all users"
ON public.share_links
FOR SELECT
USING (true);

-- FORM_TEMPLATES table
DROP POLICY IF EXISTS "Enable read access for all users" ON public.form_templates;
CREATE POLICY "Enable read access for all users"
ON public.form_templates
FOR SELECT
USING (true);

-- Verify the policies were created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public'
AND policyname = 'Enable read access for all users'
ORDER BY tablename;
