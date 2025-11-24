import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
    const token = getRouterParam(event, 'token')
    const config = useRuntimeConfig()

    if (!token) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Token is required'
        })
    }

    // Initialize Supabase with Service Key to bypass RLS
    const supabase = createClient(
        config.public.supabaseUrl,
        config.supabaseServiceKey
    )

    try {
        // 1. Validate Token
        const { data: shareLink, error: linkError } = await supabase
            .from('share_links')
            .select('*')
            .eq('token', token)
            .single()

        if (linkError || !shareLink) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Invalid or expired link'
            })
        }

        // Check expiration
        if (shareLink.expires_at && new Date(shareLink.expires_at) < new Date()) {
            throw createError({
                statusCode: 410,
                statusMessage: 'Link has expired'
            })
        }

        // 2. Fetch Entity Data based on type
        let entityData = null

        if (shareLink.entity_type === 'ad_set') {
            // Fetch Ad Set with Creatives
            const { data: adSet, error: adSetError } = await supabase
                .from('ad_sets')
                .select(`
          *,
          creatives:creatives(
            *,
            comments(
              *,
              author_profile:profiles!comments_author_id_fkey(full_name, avatar_url)
            )
          )
        `)
                .eq('id', shareLink.entity_id)
                .single()

            if (adSetError) throw adSetError
            entityData = adSet
        } else if (shareLink.entity_type === 'campaign') {
            // Fetch Campaign
            const { data: campaign, error: campaignError } = await supabase
                .from('campaigns')
                .select('*')
                .eq('id', shareLink.entity_id)
                .single()

            if (campaignError) throw campaignError
            entityData = campaign
        }

        if (!entityData) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Content not found'
            })
        }

        return {
            valid: true,
            permissions: {
                canComment: shareLink.can_comment,
                canDownload: shareLink.can_download
            },
            data: entityData,
            type: shareLink.entity_type
        }

    } catch (error: any) {
        console.error('Share link error:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            statusMessage: error.statusMessage || 'Internal Server Error'
        })
    }
})
