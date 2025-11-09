import { createDirectus, rest, authentication } from '@directus/sdk'

// Define your schema types
interface Schema {
  sectors: any[]
  clients: any[]
  projects: any[]
  creative_assets: any[]
  performance_campaigns: any[]
  design_components: any[]
  resources: any[]
  tags: any[]
  team_members: any[]
  activity_feed: any[]
}

export const useDirectus = () => {
  const config = useRuntimeConfig()
  
  const client = createDirectus<Schema>(config.public.directusUrl)
    .with(rest())
    .with(authentication())

  return {
    client
  }
}
