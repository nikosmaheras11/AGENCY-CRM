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
    // Fetch file metadata to get name
    const fileResponse = await fetch(`https://api.figma.com/v1/files/${fileKey}`, {
      headers: {
        'X-Figma-Token': figmaToken
      }
    })

    if (!fileResponse.ok) {
      throw new Error(`Figma API error: ${fileResponse.statusText}`)
    }

    const fileData = await fileResponse.json()

    // Fetch thumbnail image
    const thumbnailResponse = await fetch(
      `https://api.figma.com/v1/images/${fileKey}?format=png&scale=2`,
      {
        headers: {
          'X-Figma-Token': figmaToken
        }
      }
    )

    if (!thumbnailResponse.ok) {
      throw new Error(`Figma thumbnail API error: ${thumbnailResponse.statusText}`)
    }

    const thumbnailData = await thumbnailResponse.json()

    // Get the first image URL from the response
    const imageUrl = Object.values(thumbnailData.images)[0] as string

    return {
      name: fileData.name,
      thumbnailUrl: imageUrl,
      lastModified: fileData.lastModified,
      version: fileData.version
    }
  } catch (error: any) {
    console.error('Error fetching Figma thumbnail:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to fetch Figma thumbnail'
    })
  }
})
