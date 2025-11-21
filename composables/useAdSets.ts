// composables/useAdSets.ts
export const useAdSets = () => {
    const { supabase } = useSupabase()
    const { user } = useAuth()
    const loading = ref(false)

    const createAdSet = async (adSetData: any) => {
        loading.value = true
        try {
            // Get current max sort_order for this campaign
            const { data: existingAdSets } = await supabase
                .from('ad_sets')
                .select('sort_order')
                .eq('campaign_id', adSetData.campaign_id)
                .order('sort_order', { ascending: false })
                .limit(1)
                .maybeSingle()

            const nextSortOrder = existingAdSets?.sort_order ? existingAdSets.sort_order + 1 : 0

            if (!user.value) throw new Error('User not authenticated')

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
        } finally {
            loading.value = false
        }
    }

    const updateAdSet = async (adSetId: string, updates: any) => {
        loading.value = true
        try {
            const { data, error } = await supabase
                .from('ad_sets')
                .update({ ...updates, updated_at: new Date().toISOString() })
                .eq('id', adSetId)
                .select()
                .single()

            if (error) throw error
            return data
        } finally {
            loading.value = false
        }
    }

    const deleteAdSet = async (adSetId: string) => {
        loading.value = true
        try {
            const { error } = await supabase
                .from('ad_sets')
                .delete()
                .eq('id', adSetId)

            if (error) throw error
        } finally {
            loading.value = false
        }
    }

    return {
        createAdSet,
        updateAdSet,
        deleteAdSet,
        loading
    }
}
