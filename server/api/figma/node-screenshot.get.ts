/**
 * Fetch screenshot of specific Figma node
 * https://www.figma.com/developers/api#get-images-endpoint
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const fileKey = query.fileKey as string
  const nodeId = query.nodeId as string

  if (!fileKey || !nodeId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing fileKey or nodeId parameter'
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
    console.log('[Figma API] Fetching node screenshot:', { fileKey, nodeId })
    
    // Fetch node-specific image from Figma API
    const response = await fetch(
      `https://api.figma.com/v1/images/${fileKey}?ids=${encodeURIComponent(nodeId)}&format=png&scale=2`,
      {
        headers: {
          'X-Figma-Token': figmaToken
        }
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[Figma API] Node screenshot fetch failed:', response.status, errorText)
      throw new Error(`Figma API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    // Get the image URL for the requested node
    const imageUrl = data.images?.[nodeId]

    if (!imageUrl) {
      throw new Error('Node screenshot not found in response')
    }

    console.log('[Figma API] Node screenshot fetched:', imageUrl)

    // Also fetch file metadata for name
    const fileResponse = await fetch(`https://api.figma.com/v1/files/${fileKey}`, {
      headers: {
        'X-Figma-Token': figmaToken
      }
    })

    let fileName = 'Figma Design'
    if (fileResponse.ok) {
      const fileData = await fileResponse.json()
      fileName = fileData.name
    }

    return {
      name: fileName,
      thumbnailUrl: imageUrl,
      nodeId,
      fileKey
    }
  } catch (error: any) {
    console.error('Error fetching node screenshot:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to fetch node screenshot'
    })
  }
})
