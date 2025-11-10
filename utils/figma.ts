/**
 * Utility functions for Figma URL handling
 */

/**
 * Convert a regular Figma URL to embed URL format
 * 
 * Input: https://www.figma.com/design/oNc959dRXzFRbRdWbDkW0R/Polymarket-Ad-Master-Doc?node-id=383-3866&t=AO2exoexFrM7drs2-4
 * Output: https://embed.figma.com/design/oNc959dRXzFRbRdWbDkW0R/Polymarket-Ad-Master-Doc?node-id=383-3866&embed-host=share
 */
export function convertToFigmaEmbedUrl(figmaUrl: string): string {
  try {
    const url = new URL(figmaUrl)
    
    // Replace www.figma.com with embed.figma.com
    const embedUrl = figmaUrl.replace('www.figma.com', 'embed.figma.com')
    
    // Parse as URL to manipulate query params
    const embedUrlObj = new URL(embedUrl)
    
    // Remove the 't' parameter if present (not needed for embed)
    embedUrlObj.searchParams.delete('t')
    
    // Add embed-host parameter
    embedUrlObj.searchParams.set('embed-host', 'share')
    
    return embedUrlObj.toString()
  } catch (e) {
    console.error('Failed to convert Figma URL to embed format:', e)
    return figmaUrl
  }
}
