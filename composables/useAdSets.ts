// composables/useAdSets.ts
export const useAdSets = () => {
    const { supabase, user } = useSupabase()

    const createAdSet = async (adSetData: any) => {
        // Get current max sort_order for this campaign
        const { data: maxSort } = await supabase
            .from('ad_sets')
            .select('sort_order')
            .eq('campaign_id', adSetData.campaign_id)
            .order('sort_order', { ascending: false })
            .limit(1)
            .single()

        const nextSortOrder = (maxSort?.sort_order || 0) + 1

        const { data, error } = await supabase
            .from('ad_sets')
            .insert({
                ...adSetData,
                sort_order: nextSortOrder,
                status: 'draft'
            })
            .select()
            .single()

        if (error) throw error

        return data
    }

    const updateAdSet = async (adSetId: string, updates: any) => {
        const { data, error } = await supabase
            .from('ad_sets')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', adSetId)
            .select()
            .single()

        if (error) throw error
        return data
    }

    const deleteAdSet = async (adSetId: string) => {
        const { error } = await supabase
            .from('ad_sets')
            .delete()
            .eq('id', adSetId)

        if (error) throw error
    }

    return {
        createAdSet,
        updateAdSet,
        deleteAdSet
    }
}
