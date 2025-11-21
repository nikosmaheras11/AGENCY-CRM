import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY // Use service key to bypass RLS for verification

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function verifySchema() {
    console.log('Verifying Campaigns Table...')
    const { data: campaigns, error: campaignError } = await supabase
        .from('campaigns')
        .select('*')
        .limit(5)
        .order('created_at', { ascending: false })

    if (campaignError) {
        console.error('Error fetching campaigns:', campaignError)
    } else {
        console.log(`Found ${campaigns.length} campaigns. Latest:`)
        console.log(JSON.stringify(campaigns, null, 2))
    }

    console.log('\nVerifying Ad Sets Table...')
    const { data: adSets, error: adSetError } = await supabase
        .from('ad_sets')
        .select('*')
        .limit(1)

    if (adSetError) {
        console.error('Error fetching ad_sets:', adSetError)
    } else {
        console.log('Ad Sets table exists.')
    }

    console.log('\nVerifying Creatives Table...')
    const { data: creatives, error: creativesError } = await supabase
        .from('creatives')
        .select('*')
        .limit(1)

    if (creativesError) {
        console.error('Error fetching creatives:', creativesError)
    } else {
        console.log('Creatives table exists.')
    }
}

verifySchema()
