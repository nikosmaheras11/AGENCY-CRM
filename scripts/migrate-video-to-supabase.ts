#!/usr/bin/env node
/**
 * Script to migrate RAMS video from local storage to Supabase
 * Run with: npx tsx scripts/migrate-video-to-supabase.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Load environment variables
import 'dotenv/config'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env file')
  console.error('Please add SUPABASE_URL and SUPABASE_SERVICE_KEY to your .env file')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function migrateVideo() {
  console.log('🚀 Starting video migration to Supabase...')
  
  const videoPath = path.join(process.cwd(), 'public/videos/rams-ugc-video.mp4')
  
  // Check if video exists
  if (!fs.existsSync(videoPath)) {
    console.error('❌ Video file not found:', videoPath)
    process.exit(1)
  }
  
  console.log('📹 Found video file')
  
  // Read video file
  const videoBuffer = fs.readFileSync(videoPath)
  const videoFile = new File([videoBuffer], 'rams-ugc-video.mp4', { type: 'video/mp4' })
  
  console.log(`📊 Video size: ${(videoBuffer.length / 1024 / 1024).toFixed(2)} MB`)
  
  // Upload to Supabase Storage
  console.log('⬆️  Uploading to Supabase Storage...')
  
  const filePath = `videos/rams-ugc-video-${Date.now()}.mp4`
  
  const { data, error } = await supabase.storage
    .from('creative-assets')
    .upload(filePath, videoBuffer, {
      contentType: 'video/mp4',
      cacheControl: '3600',
      upsert: false
    })
  
  if (error) {
    console.error('❌ Upload failed:', error.message)
    process.exit(1)
  }
  
  console.log('✅ Upload successful!')
  
  // Get public URL
  const { data: urlData } = supabase.storage
    .from('creative-assets')
    .getPublicUrl(filePath)
  
  console.log('\n🎉 Migration complete!')
  console.log('📍 Video URL:', urlData.publicUrl)
  console.log('\n📝 Update your requests.json with this URL:')
  console.log(`"videoUrl": "${urlData.publicUrl}"`)
  
  return urlData.publicUrl
}

migrateVideo().catch(console.error)
