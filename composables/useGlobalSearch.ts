import { ref } from 'vue'

export interface SearchResult {
  id: string
  entity_type: 'asset' | 'request'
  title: string
  description: string | null
  thumbnail_url: string | null
  url: string
  created_at: string
  score: number
}

export const useGlobalSearch = () => {
  const { supabase } = useSupabase()
  const searchResults = ref<SearchResult[]>([])
  const isSearching = ref(false)
  const searchError = ref<string | null>(null)

  const search = async (query: string) => {
    if (!query || query.trim().length < 2) {
      searchResults.value = []
      return
    }
    
    try {
      isSearching.value = true
      searchError.value = null
      
      const { data, error } = await supabase
        .rpc('global_search', { search_term: query.trim() })
        
      if (error) throw error
      searchResults.value = (data as SearchResult[]) || []
    } catch (err: any) {
      searchError.value = err.message || 'Search failed'
      console.error('Search error:', err)
      searchResults.value = []
    } finally {
      isSearching.value = false
    }
  }

  const clearResults = () => {
    searchResults.value = []
    searchError.value = null
  }

  return {
    search,
    searchResults,
    isSearching,
    searchError,
    clearResults
  }
}
