-- Complete Auth Setup for Agency Dashboard
-- Run this in Supabase SQL Editor

-- 1. Create profiles table to extend Supabase Auth users
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('admin', 'designer', 'account_manager', 'client', 'member')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 3. Profiles policies
CREATE POLICY "Users can view all profiles" 
  ON profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- 4. Function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Trigger to create profile on new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Update comments table to properly reference auth users
-- First, drop existing foreign key if it exists
ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_author_id_fkey;

-- Add proper foreign key to auth.users
ALTER TABLE comments 
  ADD CONSTRAINT comments_author_id_fkey 
  FOREIGN KEY (author_id) 
  REFERENCES auth.users(id) 
  ON DELETE SET NULL;

-- 7. Function to get current user's profile
CREATE OR REPLACE FUNCTION get_current_user_profile()
RETURNS TABLE (
  id UUID,
  email VARCHAR(255),
  full_name VARCHAR(255),
  avatar_url TEXT,
  role VARCHAR(50)
) AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.email, p.full_name, p.avatar_url, p.role
  FROM profiles p
  WHERE p.id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Create admin user (run this after you've signed up via Supabase Auth)
-- This will be updated after first signup - just a placeholder
-- UPDATE profiles SET role = 'admin' WHERE email = 'nikos@hours.global';

-- 9. Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- 10. Verify setup
SELECT 
  'Profiles table created' as status,
  COUNT(*) as profile_count
FROM profiles;

-- Show table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND table_schema = 'public'
ORDER BY ordinal_position;
