import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL || process.env.NUXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.NUXT_SUPABASE_SERVICE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkPolicies() {
  console.log('🔍 Checking storage policies...\n')
  
  try {
    const { data, error } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'objects')
    
    if (error) {
      console.log('⚠️  Cannot query policies directly via API')
      console.log('\n📋 To check manually:')
      console.log('1. Go to Supabase Dashboard → SQL Editor')
      console.log('2. Run this query:\n')
      console.log(`SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';`)
      console.log('\n✅ You should see 4 policies for the "assets" bucket')
      return
    }
    
    console.log('📊 Found policies:', data?.length || 0)
    data?.forEach(policy => {
      console.log(`   ✓ ${policy.policyname}`)
    })
    
  } catch (error: any) {
    console.log('⚠️  Cannot access policy information')
    console.log('\n✅ If file uploads work without RLS errors, policies are correctly set up!')
  }
}

checkPolicies()
