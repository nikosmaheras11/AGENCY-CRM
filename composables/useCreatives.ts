// composables/useCreatives.ts
export const useCreatives = () => {
    const { supabase } = useSupabase()
    const loading = ref(false)

    const createCreative = async (creativeData: any) => {
        loading.value = true
        try {
            // Get current max sort_order for this ad set
            const { data: existingCreatives } = await supabase
                .from('creatives')
                .select('sort_order')
                .eq('ad_set_id', creativeData.ad_set_id)
                .order('sort_order', { ascending: false })
                .limit(1)
                .maybeSingle()

            const nextSortOrder = existingCreatives?.sort_order ? existingCreatives.sort_order + 1 : 0

            const { data, error } = await supabase
                .from('creatives')
                .insert({
                    ad_set_id: creativeData.ad_set_id,
                    name: creativeData.name,
                    asset_id: creativeData.asset_id,
                    format: creativeData.format,
                    status: creativeData.status || 'draft',
                    sort_order: nextSortOrder,
                })
                .select(`
            *,
            asset:assets(*)
          `)
                .single()

            if (error) throw error

            return data
        } finally {
            loading.value = false
        }
    }

    const updateCreative = async (creativeId: string, updates: any) => {
        loading.value = true
        try {
            const { data, error } = await supabase
                .from('creatives')
                .update({ ...updates, updated_at: new Date().toISOString() })
                .eq('id', creativeId)
                .select()
                .single()

            if (error) throw error
            return data
        } finally {
            loading.value = false
        }
    }

    const submitForReview = async (creativeId: string, reviewerId: string) => {
        loading.value = true
        try {
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
        } finally {
            loading.value = false
        }
    }

    return {
        createCreative,
        updateCreative,
        submitForReview,
        loading
    }
}
