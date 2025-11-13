import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL || process.env.NUXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.NUXT_SUPABASE_SERVICE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function setupStoragePolicies() {
  console.log('🔐 Setting up Storage RLS policies...\n')
  
  try {
    // Execute SQL to create storage policies
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Drop existing policies if they exist
        DROP POLICY IF EXISTS "Authenticated users can upload to assets" ON storage.objects;
        DROP POLICY IF EXISTS "Anyone can read assets" ON storage.objects;
        DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;
        DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;
        
        -- Allow authenticated users to upload files
        CREATE POLICY "Authenticated users can upload to assets"
        ON storage.objects FOR INSERT
        TO authenticated
        WITH CHECK (bucket_id = 'assets');
        
        -- Allow anyone to read files (public bucket)
        CREATE POLICY "Anyone can read assets"
        ON storage.objects FOR SELECT
        TO public
        USING (bucket_id = 'assets');
        
        -- Allow users to update their own files
        CREATE POLICY "Users can update their own files"
        ON storage.objects FOR UPDATE
        TO authenticated
        USING (bucket_id = 'assets' AND auth.uid() = owner);
        
        -- Allow users to delete their own files
        CREATE POLICY "Users can delete their own files"
        ON storage.objects FOR DELETE
        TO authenticated
        USING (bucket_id = 'assets' AND auth.uid() = owner);
      `
    })
    
    if (error) {
      // RPC might not exist, try direct SQL execution
      console.log('ℹ️  RPC method not available, using direct SQL...\n')
      
      // We'll create a SQL file instead
      console.log('📝 Please run this SQL in your Supabase SQL Editor:\n')
      console.log(`
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can upload to assets" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload to assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'assets');

-- Allow anyone to read files (public bucket)
CREATE POLICY "Anyone can read assets"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'assets');

-- Allow users to update their own files
CREATE POLICY "Users can update their own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'assets' AND auth.uid() = owner);

-- Allow users to delete their own files
CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'assets' AND auth.uid() = owner);
      `)
      
      console.log('\n💡 Or run: npx supabase db push')
    } else {
      console.log('✅ Storage policies created successfully!')
    }
    
  } catch (error: any) {
    console.error('❌ Error:', error.message)
  }
}

setupStoragePolicies()
