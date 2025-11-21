
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || ''

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function verify() {
    console.log('Verifying ad_sets schema...')

    // Try to select specific new columns
    const { data, error } = await supabase
        .from('creatives')
        .select('id, name, format, dimensions, sort_order')
        .limit(1)

    if (error) {
        console.error('❌ Schema verification failed:', error.message)
        process.exit(1)
    }

    console.log('✅ Schema verification passed! Columns exist.')
}

verify()
