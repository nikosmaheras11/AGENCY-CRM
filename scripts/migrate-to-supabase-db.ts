#!/usr/bin/env node
/**
 * Migrate existing requests from JSON to Supabase database
 * and upload video assets to Supabase Storage
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import 'dotenv/config'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function migrateRequests() {
  console.log('🚀 Starting migration to Supabase database...\n')
  
  // Read existing requests.json
  const requestsPath = path.join(process.cwd(), 'public/data/requests/requests.json')
  const requestsData = JSON.parse(fs.readFileSync(requestsPath, 'utf-8'))
  
  console.log(`📄 Found ${requestsData.requests.length} requests in JSON file\n`)
  
  for (const req of requestsData.requests) {
    console.log(`📦 Processing: ${req.title}`)
    
    let videoUrl = req.videoUrl
    let thumbnailUrl = req.thumbnail
    let figmaUrl = req.figmaUrl
    
    // Determine asset type
    if (figmaUrl) {
      console.log('  🎨 Figma embed detected')
    } else if (videoUrl && videoUrl.startsWith('/videos/')) {
      // Local video file - upload to Supabase Storage CDN
      console.log('  ⬆️  Uploading video to Supabase Storage CDN...')
      
      const videoPath = path.join(process.cwd(), 'public', videoUrl)
      if (fs.existsSync(videoPath)) {
        const videoBuffer = fs.readFileSync(videoPath)
        const fileName = `videos/${Date.now()}-${path.basename(videoUrl)}`
        
        const { data, error } = await supabase.storage
          .from('creative-assets')
          .upload(fileName, videoBuffer, {
            contentType: 'video/mp4',
            cacheControl: '3600',
            upsert: true
          })
        
        if (error) {
          console.error('  ❌ Video upload failed:', error.message)
        } else {
          const { data: urlData } = supabase.storage
            .from('creative-assets')
            .getPublicUrl(fileName)
          videoUrl = urlData.publicUrl
          console.log('  ✅ Video uploaded to CDN!')
          console.log(`  📍 CDN URL: ${videoUrl}`)
        }
      }
    } else if (videoUrl) {
      console.log('  🔗 External video URL detected')
    }
    
    // Insert into Supabase database (let Supabase generate UUID)
    const { data, error } = await supabase
      .from('requests')
      .insert({
        project_type: req.projectType,
        status: req.status,
        title: req.title,
        format: req.format,
        size: req.size,
        dimensions: req.dimensions,
        duration: req.duration,
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl,
        figma_url: figmaUrl,
        assignee: req.metadata.assignee,
        due_date: req.metadata.dueDate,
        tags: req.metadata.tags,
        priority: req.metadata.priority,
        client: req.metadata.client,
        campaign: req.metadata.campaign,
        category: req.metadata.category,
        created_at: req.createdAt,
        updated_at: req.updatedAt
      })
      .select()
    
    if (error) {
      console.error(`  ❌ Database insert failed:`, error.message)
    } else {
      console.log(`  ✅ Added to database!\n`)
    }
  }
  
  console.log('🎉 Migration complete!')
  console.log('\n📝 Next steps:')
  console.log('1. Update useRequests composable to fetch from Supabase')
  console.log('2. Test the creative kanban board')
  console.log('3. Remove old JSON files once confirmed working')
}

migrateRequests().catch(console.error)
