/**
 * Share Links Composable
 * Generates shareable links for assets with optional expiration and permissions
 */

export interface ShareLinkOptions {
  entityType: 'request' | 'campaign' | 'ad_set' | 'creative'
  entityId: string
  permissions?: {
    canComment?: boolean
    canDownload?: boolean
    expiresIn?: number // hours
  }
}

export interface ShareLink {
  id: string
  entityType: string
  entityId: string
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
   * Generate a shareable link for an entity
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
          entity_type: options.entityType,
          entity_id: options.entityId,
          token,
          can_comment: canComment,
          can_download: canDownload,
          expires_at: expiresAt
        })
        .select()
        .single()

      if (error) throw error

      const siteUrl = config.public.siteUrl || window.location.origin
      const shareUrl = `${siteUrl}/share/${token}`

      return {
        id: data.id,
        entityType: data.entity_type,
        entityId: data.entity_id,
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
   * Fetch shared data (Public/Guest)
   */
  const fetchSharedData = async (token: string) => {
    return await $fetch(`/api/share/${token}`)
  }

  /**
   * Post a guest comment
   */
  const postGuestComment = async (token: string, entityType: string, entityId: string, text: string, authorName: string) => {
    return await $fetch(`/api/share/${token}/comment`, {
      method: 'POST',
      body: {
        entity_type: entityType,
        entity_id: entityId,
        text,
        author_name: authorName
      }
    })
  }

  /**
   * Submit guest approval
   */
  const submitGuestApproval = async (token: string, creativeId: string, status: 'approved' | 'rejected') => {
    return await $fetch(`/api/share/${token}/approve`, {
      method: 'POST',
      body: {
        creative_id: creativeId,
        status
      }
    })
  }

  /**
   * Get all share links for an entity
   */
  const getShareLinks = async (entityType: string, entityId: string): Promise<ShareLink[]> => {
    try {
      const { data, error } = await supabase
        .from('share_links')
        .select('*')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .order('created_at', { ascending: false })

      if (error) throw error

      const siteUrl = config.public.siteUrl || window.location.origin

      return (data || []).map(link => ({
        id: link.id,
        entityType: link.entity_type,
        entityId: link.entity_id,
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
      console.error('Failed to copy:', error)
      return false
    }
  }

  return {
    generateShareLink,
    fetchSharedData,
    postGuestComment,
    submitGuestApproval,
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
