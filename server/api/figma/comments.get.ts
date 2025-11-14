/**
 * Fetch comments from Figma file
 * https://www.figma.com/developers/api#get-comments-endpoint
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const fileKey = query.fileKey as string

  if (!fileKey) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing fileKey parameter'
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

  try {
    console.log('[Figma API] Fetching comments for:', fileKey)
    
    // Fetch comments from Figma API
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
      console.error('[Figma API] Comments fetch failed:', response.status, errorText)
      throw new Error(`Figma API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log('[Figma API] Fetched', data.comments?.length || 0, 'comments')

    return {
      comments: data.comments || [],
      fileKey
    }
  } catch (error: any) {
    console.error('Error fetching Figma comments:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to fetch Figma comments'
    })
  }
})
