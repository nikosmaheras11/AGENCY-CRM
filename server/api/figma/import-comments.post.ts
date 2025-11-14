/**
 * Import Figma comments into database
 * Fetches comments from Figma and creates them in our comments table
 */
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { requestId, figmaUrl } = body

  if (!requestId || !figmaUrl) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing requestId or figmaUrl'
    })
  }

  const config = useRuntimeConfig()
  const figmaToken = config.figmaAccessToken

  if (!figmaToken) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Figma access token not configured'
    })
  }

  // Extract file key from URL
  const fileKeyMatch = figmaUrl.match(/figma\.com\/(?:file|design)\/([a-zA-Z0-9]+)/)
  const fileKey = fileKeyMatch ? fileKeyMatch[1] : null

  if (!fileKey) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid Figma URL'
    })
  }

  try {
    console.log('[Figma Import] Fetching comments for request:', requestId)
    
    // Fetch comments from Figma
    const response = await fetch(
      `https://api.figma.com/v1/files/${fileKey}/comments`,
      {
        headers: {
          'X-Figma-Token': figmaToken
        }
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[Figma Import] Failed to fetch comments:', response.status, errorText)
      throw new Error(`Figma API error: ${response.status}`)
    }

    const data = await response.json()
    const figmaComments = data.comments || []

    console.log('[Figma Import] Found', figmaComments.length, 'Figma comments')

    if (figmaComments.length === 0) {
      return {
        success: true,
        imported: 0,
        message: 'No comments found in Figma file'
      }
    }

    // Initialize Supabase client with service key
    const supabase = createClient(
      config.public.supabaseUrl,
      config.supabaseServiceKey
    )

    // Transform Figma comments to our schema
    const commentsToInsert = figmaComments.map((figmaComment: any) => ({
      request_id: requestId,
      author: figmaComment.user?.handle || figmaComment.user?.email || 'Figma User',
      author_id: null, // Can't map Figma users to our users without additional logic
      text: figmaComment.message,
      // Figma comments have client_meta with x,y positions relative to the canvas
      x_position: figmaComment.client_meta?.x ? (figmaComment.client_meta.x / 100) : null,
      y_position: figmaComment.client_meta?.y ? (figmaComment.client_meta.y / 100) : null,
      resolved: figmaComment.resolved_at !== null,
      created_at: figmaComment.created_at,
      parent_comment_id: null // Figma uses parent_id, but we'd need to map it
    }))

    // Insert comments into database
    const { data: insertedComments, error: insertError } = await supabase
      .from('comments')
      .insert(commentsToInsert)
      .select()

    if (insertError) {
      console.error('[Figma Import] Database insert error:', insertError)
      throw insertError
    }

    console.log('[Figma Import] Imported', insertedComments?.length || 0, 'comments')

    return {
      success: true,
      imported: insertedComments?.length || 0,
      comments: insertedComments
    }
  } catch (error: any) {
    console.error('Error importing Figma comments:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to import Figma comments'
    })
  }
})
