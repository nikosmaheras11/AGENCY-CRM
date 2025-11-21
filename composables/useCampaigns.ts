// composables/useCampaigns.ts
export const useCampaigns = () => {
    const { supabase } = useSupabase()
    const { user } = useAuth()

    const campaigns = ref([])
    const campaign = ref(null)
    const loading = ref(false)

    const fetchCampaigns = async () => {
        try {
            loading.value = true
            const { data, error } = await supabase
                .from('campaigns')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error

            campaigns.value = data
            return data
        } catch (error) {
            console.error('Error fetching campaigns:', error)
            throw error
        } finally {
            loading.value = false
        }
    }

    const fetchCampaignWithHierarchy = async (campaignId: string) => {
        try {
            loading.value = true

            const { data, error } = await supabase
                .from('campaigns')
                .select(`
          *,
          client:clients(id, name, logo_url),
          ad_sets(
            *,
            creatives(
              *,
              asset:assets(
                id,
                file_name,
                file_type,
                thumbnail_url,
                preview_url,
                public_url,
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
        if (!user.value) {
            console.error('User not authenticated')
            throw new Error('User not authenticated')
        }

        console.log('Creating campaign with user:', user.value.id)
        console.log('Supabase client:', !!supabase, typeof supabase.from)

        const { data, error } = await supabase
            .from('campaigns')
            .insert({
                ...campaignData,
                status: 'planning',
                created_by: user.value.id
            })
            .select()
            .single()

        if (error) throw error
        if (!data) throw new Error('Campaign created but no data returned. Possible RLS issue.')

        // Log activity
        console.log('Logging activity for campaign creation...')
        const { error: logError } = await supabase.from('activity_log').insert({
            entity_type: 'campaign',
            entity_id: data.id,
            action: 'created',
            description: `Campaign created: ${data.name}`,
            user_id: user.value.id
        })
        if (logError) console.error('Error logging activity:', logError)
        else console.log('Activity logged successfully')

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
        fetchCampaigns,
        fetchCampaignWithHierarchy,
        createCampaign,
        updateCampaignStatus
    }
}
