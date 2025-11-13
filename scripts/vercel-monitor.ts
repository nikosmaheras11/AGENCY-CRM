#!/usr/bin/env tsx
/**
 * Vercel Deployment Monitor
 * Monitors Vercel deployments and fetches build logs
 */

import * as dotenv from 'dotenv'

dotenv.config()

const VERCEL_TOKEN = process.env.VERCEL_TOKEN
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID

interface VercelDeployment {
  uid: string
  name: string
  url: string
  state: 'BUILDING' | 'READY' | 'ERROR' | 'CANCELED'
  createdAt: number
  buildingAt?: number
  ready?: number
  creator: {
    username: string
  }
  target?: string
  inspectorUrl?: string
}

interface BuildLog {
  type: string
  created: number
  payload: {
    text?: string
    deploymentId?: string
    info?: any
  }
}

class VercelMonitor {
  private token: string
  private projectId?: string
  private teamId?: string
  private baseUrl = 'https://api.vercel.com'

  constructor(token: string, projectId?: string, teamId?: string) {
    this.token = token
    this.projectId = projectId
    this.teamId = teamId
  }

  private async fetch(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`
    const headers = {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
      ...options.headers
    }

    const response = await fetch(url, { ...options, headers })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Vercel API Error: ${response.status} - ${error}`)
    }

    return response.json()
  }

  /**
   * Get latest deployments
   */
  async getDeployments(limit = 10): Promise<VercelDeployment[]> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      ...(this.projectId && { projectId: this.projectId }),
      ...(this.teamId && { teamId: this.teamId })
    })

    const data = await this.fetch(`/v6/deployments?${params}`)
    return data.deployments || []
  }

  /**
   * Get specific deployment
   */
  async getDeployment(deploymentId: string): Promise<VercelDeployment> {
    const params = new URLSearchParams({
      ...(this.teamId && { teamId: this.teamId })
    })

    return await this.fetch(`/v13/deployments/${deploymentId}?${params}`)
  }

  /**
   * Get build logs for a deployment
   */
  async getBuildLogs(deploymentId: string): Promise<BuildLog[]> {
    const params = new URLSearchParams({
      ...(this.teamId && { teamId: this.teamId })
    })

    const data = await this.fetch(`/v2/deployments/${deploymentId}/events?${params}`)
    return data || []
  }

  /**
   * Get project information
   */
  async getProject(projectId?: string): Promise<any> {
    const id = projectId || this.projectId
    if (!id) throw new Error('Project ID required')

    const params = new URLSearchParams({
      ...(this.teamId && { teamId: this.teamId })
    })

    return await this.fetch(`/v9/projects/${id}?${params}`)
  }

  /**
   * Parse build logs for errors
   */
  parseBuildErrors(logs: BuildLog[]): string[] {
    const errors: string[] = []

    for (const log of logs) {
      const text = log.payload?.text || ''

      // TypeScript errors
      if (text.includes('TS') && text.includes('error')) {
        errors.push(text)
      }

      // Build errors
      if (text.includes('Error:') || text.includes('ERROR')) {
        errors.push(text)
      }

      // Failed commands
      if (text.includes('Command failed') || text.includes('exit code')) {
        errors.push(text)
      }
    }

    return errors
  }

  /**
   * Format deployment status
   */
  formatDeployment(deployment: VercelDeployment): string {
    const statusEmoji = {
      BUILDING: '🔨',
      READY: '✅',
      ERROR: '❌',
      CANCELED: '⭕'
    }

    const emoji = statusEmoji[deployment.state] || '❓'
    const date = new Date(deployment.createdAt).toLocaleString()

    return `
${emoji} Deployment: ${deployment.name}
   URL: https://${deployment.url}
   State: ${deployment.state}
   Created: ${date}
   By: ${deployment.creator?.username || 'Unknown'}
   Target: ${deployment.target || 'preview'}
   Inspector: ${deployment.inspectorUrl || 'N/A'}
`
  }
}

/**
 * CLI Commands
 */
async function main() {
  const args = process.argv.slice(2)
  const command = args[0]

  if (!VERCEL_TOKEN) {
    console.error('❌ VERCEL_TOKEN not set in .env file')
    console.error('\nGet token from: https://vercel.com/account/tokens')
    console.error('Then add to .env: VERCEL_TOKEN=your-token\n')
    process.exit(1)
  }

  const monitor = new VercelMonitor(VERCEL_TOKEN, VERCEL_PROJECT_ID, VERCEL_TEAM_ID)

  try {
    switch (command) {
      case 'status':
      case 'deployments':
        await showDeployments(monitor)
        break

      case 'logs':
        await showLogs(monitor, args[1])
        break

      case 'errors':
        await showErrors(monitor, args[1])
        break

      case 'watch':
        await watchDeployment(monitor, args[1])
        break

      case 'project':
        await showProject(monitor)
        break

      case 'test':
        await testConnection(monitor)
        break

      default:
        showHelp()
    }
  } catch (error: any) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

async function showDeployments(monitor: VercelMonitor) {
  console.log('🚀 Fetching latest deployments...\n')

  const deployments = await monitor.getDeployments(5)

  if (deployments.length === 0) {
    console.log('No deployments found.')
    return
  }

  console.log(`Found ${deployments.length} deployments:\n`)
  deployments.forEach(d => console.log(monitor.formatDeployment(d)))
}

async function showLogs(monitor: VercelMonitor, deploymentId?: string) {
  if (!deploymentId) {
    const deployments = await monitor.getDeployments(1)
    if (deployments.length === 0) {
      console.log('No deployments found.')
      return
    }
    deploymentId = deployments[0].uid
  }

  console.log(`📋 Fetching logs for deployment: ${deploymentId}\n`)

  const logs = await monitor.getBuildLogs(deploymentId)

  if (logs.length === 0) {
    console.log('No logs available yet.')
    return
  }

  console.log(`Found ${logs.length} log entries:\n`)

  logs.forEach((log, i) => {
    const text = log.payload?.text || JSON.stringify(log.payload)
    const time = new Date(log.created).toLocaleTimeString()
    console.log(`[${time}] ${text}`)
  })
}

async function showErrors(monitor: VercelMonitor, deploymentId?: string) {
  if (!deploymentId) {
    const deployments = await monitor.getDeployments(1)
    if (deployments.length === 0) {
      console.log('No deployments found.')
      return
    }
    deploymentId = deployments[0].uid
  }

  console.log(`🔍 Checking for errors in deployment: ${deploymentId}\n`)

  const logs = await monitor.getBuildLogs(deploymentId)
  const errors = monitor.parseBuildErrors(logs)

  if (errors.length === 0) {
    console.log('✅ No errors found!')
    return
  }

  console.log(`❌ Found ${errors.length} errors:\n`)
  errors.forEach((error, i) => {
    console.log(`${i + 1}. ${error}`)
    console.log('')
  })
}

async function watchDeployment(monitor: VercelMonitor, deploymentId?: string) {
  if (!deploymentId) {
    const deployments = await monitor.getDeployments(1)
    if (deployments.length === 0) {
      console.log('No deployments found.')
      return
    }
    deploymentId = deployments[0].uid
  }

  console.log(`👀 Watching deployment: ${deploymentId}`)
  console.log('Press Ctrl+C to stop\n')

  let lastLogCount = 0

  const interval = setInterval(async () => {
    try {
      const deployment = await monitor.getDeployment(deploymentId!)
      const logs = await monitor.getBuildLogs(deploymentId!)

      // Show new logs
      if (logs.length > lastLogCount) {
        const newLogs = logs.slice(lastLogCount)
        newLogs.forEach(log => {
          const text = log.payload?.text || ''
          if (text) console.log(text)
        })
        lastLogCount = logs.length
      }

      // Check if deployment is done
      if (deployment.state === 'READY') {
        console.log('\n✅ Deployment completed successfully!')
        console.log(`URL: https://${deployment.url}`)
        clearInterval(interval)
        process.exit(0)
      } else if (deployment.state === 'ERROR') {
        console.log('\n❌ Deployment failed!')
        const errors = monitor.parseBuildErrors(logs)
        if (errors.length > 0) {
          console.log('\nErrors found:')
          errors.forEach(e => console.log(`  - ${e}`))
        }
        clearInterval(interval)
        process.exit(1)
      }
    } catch (error: any) {
      console.error('Error watching deployment:', error.message)
      clearInterval(interval)
      process.exit(1)
    }
  }, 5000) // Check every 5 seconds
}

async function showProject(monitor: VercelMonitor) {
  console.log('📦 Fetching project information...\n')

  const project = await monitor.getProject()

  console.log(`Name: ${project.name}`)
  console.log(`ID: ${project.id}`)
  console.log(`Framework: ${project.framework || 'N/A'}`)
  console.log(`Build Command: ${project.buildCommand || 'N/A'}`)
  console.log(`Output Directory: ${project.outputDirectory || 'N/A'}`)
  console.log(`Node Version: ${project.nodeVersion || 'N/A'}`)
}

async function testConnection(monitor: VercelMonitor) {
  console.log('🧪 Testing Vercel API connection...\n')

  try {
    const deployments = await monitor.getDeployments(1)
    console.log('✅ Vercel API connected')

    if (VERCEL_PROJECT_ID) {
      const project = await monitor.getProject()
      console.log(`✅ Project found: ${project.name}`)
    }

    if (deployments.length > 0) {
      const latest = deployments[0]
      console.log(`✅ Latest deployment: https://${latest.url}`)
      console.log(`✅ Status: ${latest.state}`)
    }

    console.log('\n✨ All checks passed!')
  } catch (error: any) {
    console.error('❌ Connection failed:', error.message)
    process.exit(1)
  }
}

function showHelp() {
  console.log(`
Vercel Deployment Monitor

Usage:
  tsx scripts/vercel-monitor.ts <command> [options]

Commands:
  status, deployments    Show latest deployments
  logs [deployment-id]   Show build logs (latest if no ID)
  errors [deployment-id] Check for build errors
  watch [deployment-id]  Watch deployment in real-time
  project                Show project information
  test                   Test API connection

Environment Variables:
  VERCEL_TOKEN          Required - Your Vercel API token
  VERCEL_PROJECT_ID     Optional - Your project ID
  VERCEL_TEAM_ID        Optional - Your team ID

Examples:
  tsx scripts/vercel-monitor.ts status
  tsx scripts/vercel-monitor.ts logs
  tsx scripts/vercel-monitor.ts errors dpl_abc123
  tsx scripts/vercel-monitor.ts watch dpl_abc123
  tsx scripts/vercel-monitor.ts test

Setup:
  1. Get token from: https://vercel.com/account/tokens
  2. Add to .env: VERCEL_TOKEN=your-token
  3. Run: tsx scripts/vercel-monitor.ts test
`)
}

main()
