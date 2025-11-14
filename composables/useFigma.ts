export const useFigma = () => {
  /**
   * Extract Figma file key from URL
   */
  const extractFileKey = (url: string): string | null => {
    try {
      const match = url.match(/figma\.com\/(?:file|design)\/([a-zA-Z0-9]+)/)
      return match ? match[1] : null
    } catch {
      return null
    }
  }

  /**
   * Extract node ID from Figma URL
   * Example: ?node-id=123-456 or ?node-id=123%3A456
   */
  const extractNodeId = (url: string): string | null => {
    try {
      const urlObj = new URL(url)
      const nodeId = urlObj.searchParams.get('node-id')
      if (nodeId) {
        // Decode URL encoding and replace : with - for Figma API format
        return nodeId.replace('%3A', ':').replace('-', ':')
      }
      return null
    } catch {
      return null
    }
  }

  /**
   * Parse Figma URL to get file key and node ID
   */
  const parseFigmaUrl = (url: string) => {
    return {
      fileKey: extractFileKey(url),
      nodeId: extractNodeId(url)
    }
  }

  /**
   * Fetch Figma file thumbnail and metadata
   */
  const fetchFigmaThumbnail = async (figmaUrl: string) => {
    const { fileKey, nodeId } = parseFigmaUrl(figmaUrl)
    
    if (!fileKey) {
      throw new Error('Invalid Figma URL')
    }

    try {
      // If node ID exists, fetch node-specific screenshot
      if (nodeId) {
        return await fetchNodeScreenshot(fileKey, nodeId)
      }
      
      // Otherwise fetch full file thumbnail
      const data = await $fetch(`/api/figma/thumbnail`, {
        params: { fileKey }
      })
      
      return data
    } catch (error: any) {
      console.error('Error fetching Figma thumbnail:', error)
      throw error
    }
  }

  /**
   * Fetch screenshot of specific Figma node
   */
  const fetchNodeScreenshot = async (fileKey: string, nodeId: string) => {
    try {
      const data = await $fetch(`/api/figma/node-screenshot`, {
        params: { fileKey, nodeId }
      })
      return data
    } catch (error: any) {
      console.error('Error fetching node screenshot:', error)
      throw error
    }
  }

  /**
   * Fetch comments from Figma file
   */
  const fetchFigmaComments = async (figmaUrl: string) => {
    const { fileKey } = parseFigmaUrl(figmaUrl)
    
    if (!fileKey) {
      throw new Error('Invalid Figma URL')
    }

    try {
      const data = await $fetch(`/api/figma/comments`, {
        params: { fileKey }
      })
      return data
    } catch (error: any) {
      console.error('Error fetching Figma comments:', error)
      throw error
    }
  }

  /**
   * Import Figma comments to database
   */
  const importFigmaComments = async (requestId: string, figmaUrl: string) => {
    try {
      const data = await $fetch(`/api/figma/import-comments`, {
        method: 'POST',
        body: { requestId, figmaUrl }
      })
      return data
    } catch (error: any) {
      console.error('Error importing Figma comments:', error)
      throw error
    }
  }

  return {
    extractFileKey,
    extractNodeId,
    parseFigmaUrl,
    fetchFigmaThumbnail,
    fetchNodeScreenshot,
    fetchFigmaComments,
    importFigmaComments
  }
}
