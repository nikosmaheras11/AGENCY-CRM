// composables/useCreatives.ts
export const useCreatives = () => {
    const { supabase } = useSupabase()
    const { user } = useAuth()
    const loading = ref(false)

    const createCreative = async (creativeData: any) => {
        loading.value = true
        try {
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
                    ad_set_id: creativeData.ad_set_id,
                    name: creativeData.name,
                    asset_id: creativeData.asset_id,
                    format: creativeData.format,
                    status: creativeData.status || 'draft',
                    daily_budget: creativeData.daily_budget,
                    total_budget: creativeData.total_budget,
                    created_by: user.value.id,
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
