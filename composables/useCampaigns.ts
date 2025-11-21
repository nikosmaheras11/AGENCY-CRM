// composables/useCampaigns.ts
export const useCampaigns = () => {
    const { supabase, user } = useSupabase()

    const campaigns = ref([])
    const campaign = ref(null)
    const loading = ref(false)

    const fetchCampaignWithHierarchy = async (campaignId: string) => {
        try {
            loading.value = true

            const { data, error } = await supabase
                .from('campaigns')
                .select(`
          *,
          client:clients(id, name, logo_url),
          creator:auth.users!created_by(id, email, user_metadata),
          assigned_user:auth.users!assigned_to(id, email, user_metadata),
          ad_sets(
            *,
            creatives(
              *,
              asset:assets(
                id,
                file_name,
                file_type,
                thumbnail_url,
                storage_path
              )
            )
          )
        `)
                .eq('id', campaignId)
                .order('sort_order', { foreignTable: 'ad_sets', ascending: true })
                .order('sort_order', { foreignTable: 'ad_sets.creatives', ascending: true })
                .single()

            if (error) throw error

            campaign.value = data
            return data
        } catch (error) {
            console.error('Error fetching campaign hierarchy:', error)
            throw error
        } finally {
            loading.value = false
        }
    }

    const createCampaign = async (campaignData: any) => {
        const { data, error } = await supabase
            .from('campaigns')
            .insert({
                ...campaignData,
                status: 'planning',
                created_by: user.value.id
            })
            .select(`
        *,
        client:clients(id, name, logo_url)
      `)
            .single()

        if (error) throw error

        // Log activity
        await supabase.from('activity_log').insert({
            entity_type: 'campaign',
            entity_id: data.id,
            action: 'created',
            description: `Campaign created: ${data.name}`,
            user_id: user.value.id
        })

        return data
    }

    const updateCampaignStatus = async (campaignId: string, status: string) => {
        const { data, error } = await supabase
            .from('campaigns')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', campaignId)
            .select()
            .single()

        if (error) throw error

        campaign.value = data
        return data
    }

    return {
        campaigns: readonly(campaigns),
        campaign: readonly(campaign),
        loading: readonly(loading),
        fetchCampaignWithHierarchy,
        createCampaign,
        updateCampaignStatus
    }
}
