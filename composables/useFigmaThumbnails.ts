/**
 * Composable for fetching Figma thumbnails dynamically
 * Extracts node ID from Figma URL and fetches screenshot
 */

export const useFigmaThumbnails = () => {
  const thumbnailCache = ref<Record<string, string>>({})
  const loading = ref<Record<string, boolean>>({})

  /**
   * Extract node ID from Figma URL
   * Example: https://www.figma.com/design/fileKey/fileName?node-id=383-3866
   * Returns: 383:3866
   */
  const extractNodeId = (figmaUrl: string): string | null => {
    try {
      const url = new URL(figmaUrl)
      const nodeIdParam = url.searchParams.get('node-id')
      if (nodeIdParam) {
        // Convert "383-3866" to "383:3866"
        return nodeIdParam.replace('-', ':')
      }
      return null
    } catch (e) {
      console.error('Failed to parse Figma URL:', e)
      return null
    }
  }

  /**
   * Generate Figma embed thumbnail URL
   * Uses Figma's embed API to get a thumbnail
   */
  const fetchFigmaThumbnail = async (figmaUrl: string): Promise<string | null> => {
    // Check cache first
    if (thumbnailCache.value[figmaUrl]) {
      return thumbnailCache.value[figmaUrl]
    }

    // Check if already loading
    if (loading.value[figmaUrl]) {
      return null
    }

    const nodeId = extractNodeId(figmaUrl)
    if (!nodeId) {
      return null
    }

    try {
      loading.value[figmaUrl] = true

      // Extract file key from URL
      const url = new URL(figmaUrl)
      const pathParts = url.pathname.split('/')
      const fileKey = pathParts[pathParts.length - 2] || pathParts[pathParts.length - 1]
      
      // Generate Figma embed thumbnail URL
      // Format: https://www.figma.com/embed?embed_host=astra&url={figmaUrl}
      const embedUrl = `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(figmaUrl)}`
      
      thumbnailCache.value[figmaUrl] = embedUrl
      return embedUrl
    } catch (e) {
      console.error('Error generating Figma thumbnail:', e)
      return null
    } finally {
      loading.value[figmaUrl] = false
    }
  }

  /**
   * Get thumbnail URL for an asset
   * Returns Figma screenshot if available, otherwise null
   */
  const getThumbnail = (asset: any): string | null => {
    if (asset.figmaUrl && thumbnailCache.value[asset.figmaUrl]) {
      return thumbnailCache.value[asset.figmaUrl]
    }
    return asset.thumbnail || null
  }

  return {
    fetchFigmaThumbnail,
    getThumbnail,
    thumbnailCache,
    loading
  }
}
