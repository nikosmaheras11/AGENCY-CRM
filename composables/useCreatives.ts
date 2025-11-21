// composables/useCreatives.ts
export const useCreatives = () => {
    const { supabase } = useSupabase()
    const { user } = useAuth()

    const createCreative = async (creativeData: any) => {
        // Get current max sort_order for this ad set
        const { data: maxSort } = await supabase
            .from('creatives')
            .select('sort_order')
            .eq('ad_set_id', creativeData.ad_set_id)
            .order('sort_order', { ascending: false })
            .limit(1)
            .single()

        const nextSortOrder = (maxSort?.sort_order || 0) + 1

        if (!user.value) throw new Error('User not authenticated')

        const { data, error } = await supabase
            .from('creatives')
            .insert({
                ...creativeData,
                sort_order: nextSortOrder,
                status: 'draft',
                // created_by: user.value.id // If needed in schema
            })
            .select(`
        *,
        asset:assets(*)
      `)
            .single()

        if (error) throw error

        return data
    }

    const updateCreative = async (creativeId: string, updates: any) => {
        const { data, error } = await supabase
            .from('creatives')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', creativeId)
            .select()
            .single()

        if (error) throw error
        return data
    }

    const submitForReview = async (creativeId: string, reviewerId: string) => {
        const { data, error } = await supabase
            .from('creatives')
            .update({
                status: 'ready_for_review',
                submitted_for_review_at: new Date().toISOString(),
                review_requested_from: reviewerId
            })
            .eq('id', creativeId)
            .select()
            .single()

        if (error) throw error
        return data
    }

    return {
        createCreative,
        updateCreative,
        submitForReview
    }
}
