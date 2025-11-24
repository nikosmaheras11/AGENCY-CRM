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
                .select(`
                    *,
                    ad_sets(id, name, platform, status)
                `)
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
          client:clients!campaigns_client_id_fkey(id, name, logo_url),
          ad_sets(
            *,
            creatives(
              *,
              asset:assets(*)
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

    const fetchLiveCreatives = async () => {
        try {
            loading.value = true
            console.log('Fetching live creatives...')

            // Helper to get case-insensitive status filter
            // Supabase doesn't support ILIKE on joined tables easily in one go without raw SQL or multiple queries
            // So we'll fetch broadly and filter in memory if needed, or use 'in' with both cases

            const liveStatuses = ['live', 'Live', 'LIVE']
            const approvedStatuses = ['approved', 'Approved', 'APPROVED']

            // 1. Fetch creatives explicitly marked as live
            const { data: liveCreatives, error: error1 } = await supabase
                .from('creatives')
                .select(`
                    *,
                    ad_set:ad_sets!inner(platform, campaign_id, status),
                    asset:assets(*)
                `)
                .in('status', liveStatuses)

            if (error1) throw error1
            console.log('Explicitly live creatives:', liveCreatives?.length)

            // 2. Fetch approved creatives in live ad sets
            const { data: approvedInLiveAdSets, error: error2 } = await supabase
                .from('creatives')
                .select(`
                    *,
                    ad_set:ad_sets!inner(platform, campaign_id, status),
                    asset:assets(*)
                `)
                .in('status', approvedStatuses)
                .in('ad_set.status', liveStatuses)

            if (error2) throw error2
            console.log('Approved in live ad sets:', approvedInLiveAdSets?.length)

            // 3. Fetch approved creatives in live campaigns
            // First get IDs of live campaigns
            const { data: liveCampaigns, error: campaignError } = await supabase
                .from('campaigns')
                .select('id')
                .in('status', liveStatuses)

            if (campaignError) throw campaignError

            let approvedInLiveCampaigns: any[] = []

            if (liveCampaigns && liveCampaigns.length > 0) {
                const liveCampaignIds = liveCampaigns.map(c => c.id)
                console.log('Live campaign IDs:', liveCampaignIds)

                const { data: creativesInLiveCampaigns, error: error3 } = await supabase
                    .from('creatives')
                    .select(`
                        *,
                        ad_set:ad_sets!inner(platform, campaign_id, status),
                        asset:assets(*)
                    `)
                    .in('status', approvedStatuses)
                    .in('ad_set.campaign_id', liveCampaignIds)

                if (error3) throw error3
                approvedInLiveCampaigns = creativesInLiveCampaigns || []
            }
            console.log('Approved in live campaigns:', approvedInLiveCampaigns?.length)

            // Merge and deduplicate
            const allCreatives = [
                ...(liveCreatives || []),
                ...(approvedInLiveAdSets || []),
                ...(approvedInLiveCampaigns || [])
            ]

            // Deduplicate by ID
            const uniqueCreativesMap = new Map()
            allCreatives.forEach(c => uniqueCreativesMap.set(c.id, c))
            const uniqueCreatives = Array.from(uniqueCreativesMap.values())

            console.log('Total unique live creatives:', uniqueCreatives.length)

            // Sort by created_at desc
            return uniqueCreatives.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        } catch (error) {
            console.error('Error fetching live creatives:', error)
            throw error
        } finally {
            loading.value = false
        }
    }

    // Realtime subscription for campaigns
    const setupRealtimeSubscription = () => {
        console.log('🔄 Setting up realtime subscription for campaigns')

        const channel = supabase
            .channel('campaigns-changes')
            .on(
                'postgres_changes',
                {
                    event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
                    schema: 'public',
                    table: 'campaigns'
                },
                (payload) => {
                    console.log('📡 Realtime event received:', payload.eventType, payload)

                    // Refresh campaigns list when any change occurs
                    fetchCampaigns()
                }
            )
            .subscribe((status) => {
                console.log('📡 Subscription status:', status)
            })

        return channel
    }

    // Set up subscription on composable initialization
    const realtimeChannel = setupRealtimeSubscription()

    // Cleanup function
    const cleanup = () => {
        console.log('🧹 Cleaning up realtime subscription')
        realtimeChannel.unsubscribe()
    }

    return {
        campaigns: readonly(campaigns),
        campaign: readonly(campaign),
        loading: readonly(loading),
        fetchCampaigns,
        fetchCampaignWithHierarchy,
        createCampaign,
        updateCampaignStatus,
        fetchLiveCreatives,
        cleanup
    }
}
