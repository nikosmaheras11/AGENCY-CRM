import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createStorageBucket() {
  console.log('🪣 Creating creative-assets storage bucket...')
  
  try {
    // Create bucket
    const { data, error } = await supabase.storage.createBucket('creative-assets', {
      public: false, // Private bucket - requires authentication
      fileSizeLimit: 52428800, // 50MB limit
      allowedMimeTypes: [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'video/mp4',
        'video/quicktime',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ]
    })
    
    if (error) {
      if (error.message.includes('already exists')) {
        console.log('✅ Bucket already exists!')
        return
      }
      throw error
    }
    
    console.log('✅ Storage bucket created successfully!')
    
  } catch (error) {
    console.error('❌ Error creating bucket:', error)
    process.exit(1)
  }
}

createStorageBucket()
