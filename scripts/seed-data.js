#!/usr/bin/env node

/**
 * Seed initial data into Supabase
 * Run: node scripts/seed-data.js
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'https://vzhthefdgumjkhnjpydt.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_KEY // Need service key for inserts

if (!supabaseKey) {
  console.error('❌ SUPABASE_SERVICE_KEY environment variable is required')
  console.error('💡 This is the service_role key from Supabase dashboard')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function seedData() {
  console.log('🌱 Seeding initial data...\n')
  
  // 1. Create client (your agency's client - Polymarket)
  console.log('📋 Creating client (Polymarket)...')
  const { data: clients, error: clientError } = await supabase
    .from('clients')
    .insert([
      {
        name: 'Polymarket',
        primary_contact_name: 'Shayne Coplan',
        primary_contact_email: 'contact@polymarket.com',
        status: 'active'
      }
    ])
    .select()
  
  if (clientError) {
    console.error('❌ Error creating client:', clientError.message)
    return
  }
  
  const polymarket = clients[0]
  console.log(`✅ Created client: ${polymarket.name}`)
  
  // 2. Create internal team members (your agency's staff)
  console.log('\n🧑 Creating team member accounts...')
  
  const users = [
    { email: 'nikos@agency.com', password: 'demo123', metadata: { first_name: 'Nikos', last_name: 'Maheras', role: 'admin' } },
    { email: 'creative@agency.com', password: 'demo123', metadata: { first_name: 'Creative', last_name: 'Lead', role: 'user' } },
    { email: 'performance@agency.com', password: 'demo123', metadata: { first_name: 'Performance', last_name: 'Manager', role: 'user' } },
    { email: 'designer@agency.com', password: 'demo123', metadata: { first_name: 'Design', last_name: 'Lead', role: 'user' } }
  ]
  
  const createdUsers = []
  
  for (const userData of users) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
      user_metadata: userData.metadata
    })
    
    if (error) {
      console.error(`❌ Error creating user ${userData.email}:`, error.message)
    } else {
      console.log(`✅ Created user: ${userData.email}`)
      createdUsers.push(data.user)
      
      // Create corresponding profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          first_name: userData.metadata.first_name,
          last_name: userData.metadata.last_name,
          role: userData.metadata.role
        })
      
      if (profileError) {
        console.error(`❌ Error creating profile for ${userData.email}:`, profileError.message)
      }
    }
  }
  
  console.log(`✅ Created ${createdUsers.length} internal team member profiles`)
  
  // 3. Create client guest users for Polymarket
  console.log('\n👥 Creating client guest users for Polymarket...')
  
  const clientGuests = [
    { email: 'shayne@polymarket.com', password: 'client123', metadata: { first_name: 'Shayne', last_name: 'Coplan', role: 'client_guest' } },
    { email: 'marketing@polymarket.com', password: 'client123', metadata: { first_name: 'Marketing', last_name: 'Manager', role: 'client_guest' } },
    { email: 'creative@polymarket.com', password: 'client123', metadata: { first_name: 'Creative', last_name: 'Director', role: 'client_guest' } }
  ]
  
  const createdClientGuests = []
  
  for (const guestData of clientGuests) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: guestData.email,
      password: guestData.password,
      email_confirm: true,
      user_metadata: guestData.metadata
    })
    
    if (error) {
      console.error(`❌ Error creating client guest ${guestData.email}:`, error.message)
    } else {
      console.log(`✅ Created client guest: ${guestData.email}`)
      createdClientGuests.push(data.user)
      
      // Create corresponding profile linked to Polymarket
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          first_name: guestData.metadata.first_name,
          last_name: guestData.metadata.last_name,
          role: 'client_guest',
          client_id: polymarket.id, // Link to Polymarket
          company: 'Polymarket'
        })
      
      if (profileError) {
        console.error(`❌ Error creating profile for ${guestData.email}:`, profileError.message)
      }
    }
  }
  
  console.log(`✅ Created ${createdClientGuests.length} client guest accounts for Polymarket`)
  
  // 4. Update existing requests with Polymarket as client
  console.log('\n📝 Updating existing requests with client relationships...')
  
  const { data: existingRequests } = await supabase
    .from('requests')
    .select('*')
  
  if (existingRequests && existingRequests.length > 0) {
    // Assign Polymarket as client for all existing requests
    for (const request of existingRequests) {
      await supabase
        .from('requests')
        .update({
          client_id: polymarket.id,
          assigned_to: createdUsers[0]?.id,
          request_type: 'creative' // Set missing request_type
        })
        .eq('id', request.id)
    }
    console.log(`✅ Updated ${existingRequests.length} existing requests → assigned to Polymarket`)
  }
  
  // 4. Create additional sample requests for Polymarket
  console.log('\n📋 Creating sample requests for Polymarket...')
  
  const { data: newRequests, error: requestError } = await supabase
    .from('requests')
    .insert([
      {
        title: 'Q1 2025 Social Media Campaign',
        description: 'Creative assets for Q1 social media push across Twitter, Instagram',
        client_id: polymarket.id,
        request_type: 'creative',
        status: 'in_progress',
        priority: 'high',
        created_by: createdUsers[0]?.id,
        assigned_to: createdUsers[1]?.id
      },
      {
        title: 'Presidential Election Market Analytics',
        description: 'Performance dashboard for election prediction markets',
        client_id: polymarket.id,
        request_type: 'performance',
        status: 'needs_review',
        priority: 'medium',
        created_by: createdUsers[0]?.id,
        assigned_to: createdUsers[2]?.id
      },
      {
        title: 'Brand Refresh Project',
        description: 'Updated brand guidelines and design system',
        client_id: polymarket.id,
        request_type: 'project',
        status: 'new_request',
        priority: 'urgent',
        created_by: createdUsers[0]?.id,
        assigned_to: createdUsers[3]?.id
      }
    ])
    .select()
  
  if (requestError) {
    console.error('❌ Error creating requests:', requestError.message)
  } else {
    console.log(`✅ Created ${newRequests.length} new requests`)
  }
  
  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('🎉 Seeding completed successfully!')
  console.log('='.repeat(60))
  console.log('\n📊 Summary:')
  console.log(`  Client: Polymarket (1)`)
  console.log(`  Internal Team Members: ${createdUsers.length}`)
  console.log(`  Client Guests (Polymarket): ${createdClientGuests.length}`)
  console.log(`  Total Requests: ${(newRequests?.length || 0) + (existingRequests?.length || 0)}`)
  console.log('\n📝 Login Credentials:')
  console.log('\n  Internal Team (full access):')
  console.log('    Nikos (Admin): nikos@agency.com / demo123')
  console.log('    Creative Lead: creative@agency.com / demo123')
  console.log('    Performance Manager: performance@agency.com / demo123')
  console.log('    Design Lead: designer@agency.com / demo123')
  console.log('\n  Client Guests (Polymarket only):')
  console.log('    Shayne Coplan: shayne@polymarket.com / client123')
  console.log('    Marketing Manager: marketing@polymarket.com / client123')
  console.log('    Creative Director: creative@polymarket.com / client123')
  console.log('\n💡 Next: Run `node scripts/check-data.js` to verify')
}

seedData().catch(console.error)
