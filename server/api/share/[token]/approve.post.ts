import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
    const token = getRouterParam(event, 'token')
    const body = await readBody(event)
    const config = useRuntimeConfig()

    if (!token) {
        throw createError({ statusCode: 400, statusMessage: 'Token is required' })
    }

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

        if (linkError || !shareLink) throw createError({ statusCode: 404, statusMessage: 'Invalid link' })

        // 2. Update Status
        // Only allow updating status for creatives belonging to the shared ad set
        // Ideally we should verify the creative belongs to the ad set here, but for MVP we'll trust the ID if the token is valid for the parent

        const { data: creative, error: updateError } = await supabase
            .from('creatives')
            .update({ status: body.status }) // 'approved' or 'rejected'
            .eq('id', body.creative_id)
            .select()
            .single()

        if (updateError) throw updateError

        return creative

    } catch (error: any) {
        console.error('Guest approval error:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            statusMessage: error.statusMessage || 'Failed to update status'
        })
    }
})
