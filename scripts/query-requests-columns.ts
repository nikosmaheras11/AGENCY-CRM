import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function queryColumns() {
  console.log('🔍 Querying requests table columns...\n')
  
  try {
    // Use the admin client to query pg_catalog directly
    const { data, error } = await supabase
      .from('requests')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('❌ Error querying requests:', error)
      return
    }
    
    console.log('✅ Query successful!')
    
    if (!data || data.length === 0) {
      console.log('No data in table yet, but query structure reveals columns.')
      
      // Try inserting a test record to see what's required
      const testInsert = await supabase
        .from('requests')
        .insert({
          title: 'TEST - DELETE ME',
          request_type: 'creative',
          status: 'new_request'
        })
        .select()
      
      if (testInsert.error) {
        console.log('\n❌ Test insert failed:')
        console.log(testInsert.error)
      } else {
        console.log('\n✅ Test insert succeeded! Columns detected:')
        if (testInsert.data && testInsert.data[0]) {
          Object.keys(testInsert.data[0]).forEach(key => {
            console.log(`  - ${key}: ${typeof testInsert.data[0][key]}`)
          })
          
          // Delete the test record
          await supabase
            .from('requests')
            .delete()
            .eq('id', testInsert.data[0].id)
          console.log('\n🗑️  Test record deleted')
        }
      }
    } else {
      console.log('Columns found:')
      Object.keys(data[0]).forEach(key => {
        console.log(`  - ${key}`)
      })
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

queryColumns()
