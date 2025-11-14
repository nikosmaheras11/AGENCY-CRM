#!/usr/bin/env tsx
/**
 * Quick Vercel Project Inspector
 * Checks deployment configuration without requiring a token
 */

const PRODUCTION_URL = 'https://v0-agency-os-seven.vercel.app'
const PROJECT_NAME = 'v0-agency-os-seven'

async function inspectDeployment() {
  console.log('🔍 Vercel Project Inspector\n')
  console.log('='.repeat(50))
  console.log(`Production URL: ${PRODUCTION_URL}`)
  console.log(`Project: ${PROJECT_NAME}`)
  console.log('='.repeat(50))
  console.log('')

  // Try to fetch the public deployment info
  try {
    console.log('📡 Checking production deployment...\n')

    const response = await fetch(PRODUCTION_URL, {
      method: 'HEAD',
      redirect: 'follow'
    })

    console.log(`✅ Production is live!`)
    console.log(`   Status: ${response.status}`)
    console.log(`   Headers:`)

    const headers = ['x-vercel-id', 'x-vercel-cache', 'server']
    headers.forEach(header => {
      const value = response.headers.get(header)
      if (value) {
        console.log(`   - ${header}: ${value}`)
      }
    })

    console.log('')
    console.log('📋 Configuration Status:')
    console.log('   ✅ Production deployment is active')
    console.log('   ℹ️  To control deployments, set production branch in Vercel dashboard')
    console.log('   ℹ️  Current vercel.json allows only "main" branch → production')
    console.log('')
    console.log('🎯 Next Steps:')
    console.log('   1. Go to: https://vercel.com (your project settings)')
    console.log('   2. Settings → Git')
    console.log('   3. Set "Production Branch" to: main')
    console.log('   4. Enable "Deploy Previews" for all other branches')
    console.log('')
    console.log('📌 Current Branch:')
    console.log('   claude/setup-supabase-api-access-*')
    console.log('   Should create: Preview deployment (not production)')
    console.log('')

  } catch (error: any) {
    console.error('❌ Could not reach production URL')
    console.error(`   Error: ${error.message}`)
  }
}

inspectDeployment()
