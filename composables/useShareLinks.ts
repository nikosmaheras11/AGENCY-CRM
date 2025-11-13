/**
 * Share Links Composable
 * Generates shareable links for assets with optional expiration and permissions
 */

export interface ShareLinkOptions {
  assetId: string
  permissions?: {
    canComment?: boolean
    canDownload?: boolean
    expiresIn?: number // hours
  }
}

export interface ShareLink {
  id: string
  assetId: string
  token: string
  url: string
  canComment: boolean
  canDownload: boolean
  expiresAt: string | null
  createdAt: string
}

export const useShareLinks = () => {
  const { supabase } = useSupabase()
  const config = useRuntimeConfig()

  /**
   * Generate a shareable link for an asset
   */
  const generateShareLink = async (options: ShareLinkOptions): Promise<ShareLink | null> => {
    try {
      const {
        canComment = true,
        canDownload = true,
        expiresIn = 168 // 7 days default
      } = options.permissions || {}

      // Generate secure token
      const token = generateToken()
      const expiresAt = expiresIn > 0
        ? new Date(Date.now() + expiresIn * 60 * 60 * 1000).toISOString()
        : null

      // Save to database
      const { data, error } = await supabase
        .from('share_links')
        .insert({
          asset_id: options.assetId,
          token,
          can_comment: canComment,
          can_download: canDownload,
          expires_at: expiresAt
        })
        .select()
        .single()

      if (error) throw error

      const siteUrl = config.public.siteUrl || 'http://localhost:3000'
      const shareUrl = `${siteUrl}/share/${token}`

      return {
        id: data.id,
        assetId: data.asset_id,
        token: data.token,
        url: shareUrl,
        canComment: data.can_comment,
        canDownload: data.can_download,
        expiresAt: data.expires_at,
        createdAt: data.created_at
      }
    } catch (error) {
      console.error('Error generating share link:', error)
      return null
    }
  }

  /**
   * Validate a share token and get asset info
   */
  const validateShareToken = async (token: string) => {
    try {
      const { data, error } = await supabase
        .from('share_links')
        .select(`
          *,
          request:requests(*)
        `)
        .eq('token', token)
        .single()

      if (error) throw error

      // Check if expired
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        return {
          valid: false,
          error: 'Link has expired'
        }
      }

      return {
        valid: true,
        shareLink: data,
        asset: data.request
      }
    } catch (error) {
      return {
        valid: false,
        error: 'Invalid share link'
      }
    }
  }

  /**
   * Get all share links for an asset
   */
  const getShareLinks = async (assetId: string): Promise<ShareLink[]> => {
    try {
      const { data, error } = await supabase
        .from('share_links')
        .select('*')
        .eq('asset_id', assetId)
        .order('created_at', { ascending: false })

      if (error) throw error

      const siteUrl = config.public.siteUrl || 'http://localhost:3000'

      return (data || []).map(link => ({
        id: link.id,
        assetId: link.asset_id,
        token: link.token,
        url: `${siteUrl}/share/${link.token}`,
        canComment: link.can_comment,
        canDownload: link.can_download,
        expiresAt: link.expires_at,
        createdAt: link.created_at
      }))
    } catch (error) {
      console.error('Error fetching share links:', error)
      return []
    }
  }

  /**
   * Revoke a share link
   */
  const revokeShareLink = async (linkId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('share_links')
        .delete()
        .eq('id', linkId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error revoking share link:', error)
      return false
    }
  }

  /**
   * Copy link to clipboard
   */
  const copyToClipboard = async (url: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(url)
      return true
    } catch (error) {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = url
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      const success = document.execCommand('copy')
      document.body.removeChild(textarea)
      return success
    }
  }

  return {
    generateShareLink,
    validateShareToken,
    getShareLinks,
    revokeShareLink,
    copyToClipboard
  }
}

/**
 * Generate a cryptographically secure random token
 */
function generateToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}
