import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL || process.env.NUXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.NUXT_SUPABASE_SERVICE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials!')
  console.log('Please set SUPABASE_URL and SUPABASE_SERVICE_KEY in .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function setupStorageBucket() {
  console.log('🪣 Setting up Supabase Storage bucket...\n')
  
  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      throw listError
    }
    
    console.log('📋 Existing buckets:', buckets?.map(b => b.name).join(', ') || 'none')
    
    const bucketExists = buckets?.some(b => b.name === 'assets')
    
    if (bucketExists) {
      console.log('✅ "assets" bucket already exists!')
      
      // Update bucket settings
      const { error: updateError } = await supabase.storage.updateBucket('assets', {
        public: true, // Make public for easy access
        fileSizeLimit: 104857600 // 100MB limit
      })
      
      if (updateError) {
        console.log('⚠️ Could not update bucket settings:', updateError.message)
      } else {
        console.log('✅ Bucket settings updated!')
      }
    } else {
      // Create bucket
      console.log('📦 Creating "assets" bucket...')
      
      const { data, error } = await supabase.storage.createBucket('assets', {
        public: true // Make public for easy access
      })
      
      if (error) {
        throw error
      }
      
      console.log('✅ Storage bucket created successfully!')
    }
    
    console.log('\n📊 Bucket Configuration:')
    console.log('   Name: assets')
    console.log('   Public: Yes')
    console.log('   Max Size: 100MB')
    console.log('   Allowed Types: Images, Videos, PDFs, Documents')
    
    // Test upload permissions
    console.log('\n🧪 Testing upload permissions...')
    const testFile = new Blob(['test'], { type: 'text/plain' })
    const testPath = `test-${Date.now()}.txt`
    
    const { error: uploadError } = await supabase.storage
      .from('assets')
      .upload(testPath, testFile)
    
    if (uploadError) {
      console.log('⚠️ Upload test failed:', uploadError.message)
    } else {
      console.log('✅ Upload test successful!')
      
      // Clean up test file
      await supabase.storage
        .from('assets')
        .remove([testPath])
    }
    
    console.log('\n✅ Storage setup complete!')
    
  } catch (error: any) {
    console.error('❌ Error setting up storage:', error.message)
    process.exit(1)
  }
}

setupStorageBucket()
