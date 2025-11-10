/**
 * API endpoint to fetch Figma screenshots via MCP
 */

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { nodeId } = body

    if (!nodeId) {
      throw createError({
        statusCode: 400,
        message: 'Missing nodeId parameter'
      })
    }

    // Call MCP get_screenshot tool
    // Note: This assumes MCP server is running and accessible
    const mcpResponse = await $fetch('http://localhost:3001/mcp/call', {
      method: 'POST',
      body: {
        tool: 'get_screenshot',
        input: {
          nodeId,
          clientLanguages: 'typescript',
          clientFrameworks: 'vue,nuxt'
        }
      }
    })

    // The MCP tool should return a base64 image or URL
    // Return it to the frontend
    return {
      screenshot: mcpResponse,
      nodeId
    }
  } catch (error: any) {
    console.error('Error fetching Figma screenshot:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to fetch Figma screenshot'
    })
  }
})
