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

async function checkSchema() {
  console.log('🔍 Checking requests table schema...\n')
  
  try {
    // Query the information_schema to get column details
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default
        FROM information_schema.columns
        WHERE table_name = 'requests'
        ORDER BY ordinal_position;
      `
    })
    
    if (error) {
      // Try direct query instead
      console.log('Trying alternative method...')
      const { data: testData, error: testError } = await supabase
        .from('requests')
        .select('*')
        .limit(0)
      
      if (testError) {
        console.error('❌ Error:', testError)
        return
      }
      
      console.log('✅ Table exists but cannot query schema directly')
      console.log('Try running this SQL in Supabase SQL Editor:')
      console.log(`
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'requests'
ORDER BY ordinal_position;
      `)
      return
    }
    
    console.log('Columns in requests table:')
    console.log('─'.repeat(80))
    data.forEach((col: any) => {
      console.log(`${col.column_name.padEnd(25)} ${col.data_type.padEnd(20)} ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`)
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

checkSchema()
