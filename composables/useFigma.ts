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
   * Fetch Figma file thumbnail and metadata
   */
  const fetchFigmaThumbnail = async (figmaUrl: string) => {
    const fileKey = extractFileKey(figmaUrl)
    
    if (!fileKey) {
      throw new Error('Invalid Figma URL')
    }

    try {
      const data = await $fetch(`/api/figma/thumbnail`, {
        params: { fileKey }
      })
      
      return data
    } catch (error: any) {
      console.error('Error fetching Figma thumbnail:', error)
      throw error
    }
  }

  return {
    extractFileKey,
    fetchFigmaThumbnail
  }
}
