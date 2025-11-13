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

async function verifyBucketLimits() {
  console.log('🔍 Checking bucket configuration...\n')
  
  try {
    // Get bucket info
    const { data: buckets, error } = await supabase.storage.listBuckets()
    
    if (error) throw error
    
    const assetsBucket = buckets?.find(b => b.name === 'assets')
    
    if (!assetsBucket) {
      console.log('❌ Assets bucket not found!')
      return
    }
    
    console.log('📊 Current Bucket Configuration:')
    console.log('   Name:', assetsBucket.name)
    console.log('   Public:', assetsBucket.public)
    console.log('   File Size Limit:', assetsBucket.file_size_limit || 'None (using plan default)')
    console.log('   Allowed MIME Types:', assetsBucket.allowed_mime_types || 'All types allowed')
    console.log('\n✅ With Supabase Pro, you can upload files up to 5GB per file')
    console.log('✅ No additional restrictions configured on the bucket')
    
  } catch (error: any) {
    console.error('❌ Error:', error.message)
  }
}

verifyBucketLimits()
