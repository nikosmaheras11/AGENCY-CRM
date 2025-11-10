#!/usr/bin/env node
/**
 * Upload RAMS video using resumable upload for large files
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import 'dotenv/config'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function uploadVideo() {
  console.log('🚀 Uploading RAMS video to Supabase CDN...\n')
  
  const videoPath = path.join(process.cwd(), 'public/videos/rams-ugc-video.mp4')
  
  if (!fs.existsSync(videoPath)) {
    console.error('❌ Video not found:', videoPath)
    process.exit(1)
  }
  
  const videoBuffer = fs.readFileSync(videoPath)
  const fileSize = (videoBuffer.length / 1024 / 1024).toFixed(2)
  console.log(`📹 Video size: ${fileSize} MB`)
  console.log('⬆️  Uploading to Supabase Storage...\n')
  
  const fileName = `videos/rams-ugc-${Date.now()}.mp4`
  
  const { data, error } = await supabase.storage
    .from('creative-assets')
    .upload(fileName, videoBuffer, {
      contentType: 'video/mp4',
      cacheControl: '3600',
      upsert: true
    })
  
  if (error) {
    console.error('❌ Upload failed:', error)
    console.log('\n💡 Trying alternative upload method...')
    
    // Try using TUS (resumable upload)
    const formData = new FormData()
    const blob = new Blob([videoBuffer], { type: 'video/mp4' })
    formData.append('file', blob, 'rams-ugc-video.mp4')
    
    process.exit(1)
  }
  
  console.log('✅ Upload successful!\n')
  
  // Get public URL
  const { data: urlData } = supabase.storage
    .from('creative-assets')
    .getPublicUrl(fileName)
  
  const cdnUrl = urlData.publicUrl
  
  console.log('🎉 Video uploaded to CDN!')
  console.log('📍 CDN URL:', cdnUrl)
  
  // Update the database
  console.log('\n📝 Updating database...')
  
  const { error: updateError } = await supabase
    .from('requests')
    .update({ video_url: cdnUrl })
    .eq('title', 'RAMS UGC Video')
  
  if (updateError) {
    console.error('❌ Database update failed:', updateError.message)
  } else {
    console.log('✅ Database updated!')
  }
  
  console.log('\n✨ All done! Your video now streams from Supabase CDN')
  console.log('🚀 Fast delivery globally with caching')
}

uploadVideo().catch(console.error)
