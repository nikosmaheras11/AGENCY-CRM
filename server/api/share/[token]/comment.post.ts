import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
    const token = getRouterParam(event, 'token')
    const body = await readBody(event)
    const config = useRuntimeConfig()

    if (!token) {
        throw createError({ statusCode: 400, statusMessage: 'Token is required' })
    }

    if (!body.text || !body.author_name) {
        throw createError({ statusCode: 400, statusMessage: 'Text and Author Name are required' })
    }

    const supabase = createClient(
        config.public.supabaseUrl,
        config.supabaseServiceKey
    )

    try {
        // 1. Validate Token & Permissions
        const { data: shareLink, error: linkError } = await supabase
            .from('share_links')
            .select('*')
            .eq('token', token)
            .single()

        if (linkError || !shareLink) throw createError({ statusCode: 404, statusMessage: 'Invalid link' })

        if (!shareLink.can_comment) {
            throw createError({ statusCode: 403, statusMessage: 'Commenting is disabled for this link' })
        }

        // 2. Insert Comment
        // Note: author_id is NULL for guests, author field contains the name
        const { data: comment, error: commentError } = await supabase
            .from('comments')
            .insert({
                entity_type: body.entity_type, // e.g., 'creative'
                entity_id: body.entity_id,
                text: body.text,
                author: body.author_name, // Guest name
                author_id: null, // Explicitly null for guests
                resolved: false
            })
            .select()
            .single()

        if (commentError) throw commentError

        return comment

    } catch (error: any) {
        console.error('Guest comment error:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            statusMessage: error.statusMessage || 'Failed to post comment'
        })
    }
})
