<template>
  <div class="version-history-panel">
    <!-- Header with actions -->
    <div class="panel-header">
      <h3>Version History</h3>
      <button @click="uploadNewVersion" class="btn-upload">
        <span class="material-icons">upload</span>
        New Version
      </button>
    </div>
    
    <!-- Version list -->
    <div class="version-list">
      <!-- Loading state -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading versions...</p>
      </div>
      
      <!-- Empty state -->
      <div v-else-if="versions.length === 0" class="empty-state">
        <span class="material-icons">history</span>
        <p>No version history yet</p>
        <button @click="uploadNewVersion" class="btn-secondary">Upload first version</button>
      </div>
      
      <!-- Version items -->
      <div
        v-for="version in versions"
        :key="version.id"
        class="version-item"
        :class="{ 
          active: version.id === currentVersion?.id,
          approved: version.approved 
        }"
        @click="selectVersion(version)"
      >
        <!-- Version thumbnail -->
        <div class="version-thumbnail">
          <img 
            v-if="version.thumbnail_url" 
            :src="version.thumbnail_url" 
            :alt="`v${version.version_number}`"
            @error="handleImageError"
          />
          <div v-else class="thumbnail-placeholder">
            <span class="material-icons">image</span>
          </div>
          
          <div class="version-number-badge">v{{ version.version_number }}</div>
          
          <!-- Approved checkmark -->
          <div v-if="version.approved" class="approved-badge">
            <span class="material-icons">check_circle</span>
          </div>
        </div>
        
        <!-- Version details -->
        <div class="version-details">
          <div class="version-header">
            <h4>Version {{ version.version_number }}</h4>
            <span class="version-date">{{ formatRelativeTime(version.created_at) }}</span>
          </div>
          
          <p v-if="version.change_description" class="version-description">
            {{ version.change_description }}
          </p>
          
          <div class="version-meta">
            <div v-if="version.created_by" class="author">
              <span class="material-icons">person</span>
              <span>{{ version.created_by }}</span>
            </div>
            
            <div class="file-info">
              <span v-if="version.dimensions">{{ version.dimensions }}</span>
              <span v-if="version.dimensions && version.file_size">•</span>
              <span v-if="version.file_size">{{ formatFileSize(version.file_size) }}</span>
            </div>
          </div>
          
          <!-- Version actions -->
          <div class="version-actions">
            <button 
              v-if="!version.approved"
              @click.stop="approveVersion(version)"
              class="btn-approve"
            >
              <span class="material-icons">check</span>
              Approve
            </button>
            
            <button @click.stop="restoreVersion(version)" class="btn-action">
              <span class="material-icons">restore</span>
              Restore
            </button>
            
            <button @click.stop="downloadVersion(version)" class="btn-action">
              <span class="material-icons">download</span>
            </button>
            
            <button @click.stop="toggleVersionMenu(version)" class="btn-action">
              <span class="material-icons">more_horiz</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatRelativeTime, formatFileSize } from '~/utils/asset-viewer'

interface Version {
  id: string
  request_id: string
  version_number: number
  file_url: string
  thumbnail_url?: string
  preview_url?: string
  file_size?: number
  mime_type?: string
  duration?: number
  dimensions?: string
  change_description?: string
  change_type?: string
  created_by?: string
  created_at: string
  approved: boolean
  approved_by?: string
  approved_at?: string
  metadata?: any
}

interface Props {
  assetId: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'version-selected': [version: Version]
  'version-restored': [version: Version]
}>()

// State
const versions = ref<Version[]>([])
const currentVersion = ref<Version | null>(null)
const loading = ref(true)
const error = ref<Error | null>(null)

// Fetch versions from Supabase
const fetchVersions = async () => {
  loading.value = true
  error.value = null
  
  try {
    const { supabase } = useSupabase()
    
    const { data, error: fetchError } = await supabase
      .from('asset_versions')
      .select('*')
      .eq('request_id', props.assetId)
      .order('version_number', { ascending: false })
    
    if (fetchError) throw fetchError
    
    versions.value = data || []
    
    // Set current version to the latest approved or just latest
    currentVersion.value = versions.value.find(v => v.approved) || versions.value[0] || null
    
  } catch (e) {
    console.error('Error fetching versions:', e)
    error.value = e as Error
  } finally {
    loading.value = false
  }
}

// Select version
const selectVersion = (version: Version) => {
  currentVersion.value = version
  emit('version-selected', version)
}

// Approve version
const approveVersion = async (version: Version) => {
  try {
    const { supabase } = useSupabase()
    
    const { error: updateError } = await supabase
      .from('asset_versions')
      .update({ 
        approved: true,
        approved_at: new Date().toISOString()
      })
      .eq('id', version.id)
    
    if (updateError) throw updateError
    
    // Update local state
    const versionIndex = versions.value.findIndex(v => v.id === version.id)
    if (versionIndex !== -1) {
      versions.value[versionIndex].approved = true
      versions.value[versionIndex].approved_at = new Date().toISOString()
    }
    
    console.log('Version approved:', version.version_number)
  } catch (e) {
    console.error('Error approving version:', e)
    alert('Failed to approve version')
  }
}

// Restore version (creates new version from old one)
const restoreVersion = async (version: Version) => {
  const confirmed = confirm(
    `Restore to version ${version.version_number}? This will create a new version.`
  )
  
  if (!confirmed) return
  
  try {
    const { supabase } = useSupabase()
    
    // Create new version based on restored one
    const { data, error: insertError } = await supabase
      .from('asset_versions')
      .insert({
        request_id: props.assetId,
        file_url: version.file_url,
        thumbnail_url: version.thumbnail_url,
        preview_url: version.preview_url,
        file_size: version.file_size,
        mime_type: version.mime_type,
        duration: version.duration,
        dimensions: version.dimensions,
        change_description: `Restored from v${version.version_number}`,
        change_type: 'restoration'
      })
      .select()
      .single()
    
    if (insertError) throw insertError
    
    // Refresh versions
    await fetchVersions()
    
    emit('version-restored', data)
    
    console.log('Version restored:', version.version_number)
  } catch (e) {
    console.error('Error restoring version:', e)
    alert('Failed to restore version')
  }
}

// Download version
const downloadVersion = (version: Version) => {
  if (version.file_url) {
    window.open(version.file_url, '_blank')
  }
}

// Upload new version
const uploadNewVersion = () => {
  // TODO: Implement upload modal/flow
  alert('Upload new version - Coming soon')
}

// Toggle version menu
const toggleVersionMenu = (version: Version) => {
  // TODO: Implement dropdown menu
  console.log('Version menu:', version)
}

// Handle image load errors
const handleImageError = (e: Event) => {
  const img = e.target as HTMLImageElement
  img.style.display = 'none'
}

// Load versions on mount
onMounted(() => {
  fetchVersions()
})
</script>

<style scoped>
.version-history-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #2a2a2a;
}

.panel-header h3 {
  color: #f9fafb;
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.btn-upload {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-upload:hover {
  background: #2563eb;
}

.btn-upload .material-icons {
  font-size: 18px;
}

.version-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px 20px;
  color: #6b7280;
  text-align: center;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #374151;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state .material-icons {
  font-size: 48px;
  color: #4b5563;
}

.btn-secondary {
  margin-top: 8px;
  padding: 8px 16px;
  background: #374151;
  color: #e5e7eb;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-secondary:hover {
  background: #4b5563;
}

.version-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: #1a1a1a;
  border: 2px solid transparent;
  border-radius: 8px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.version-item:hover {
  background: #252525;
  border-color: #374151;
}

.version-item.active {
  border-color: #3b82f6;
  background: #1e293b;
}

.version-item.approved {
  border-left: 3px solid #10b981;
}

.version-thumbnail {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
  background: #0a0a0a;
}

.version-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnail-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
}

.thumbnail-placeholder .material-icons {
  font-size: 32px;
  color: #6b7280;
}

.version-number-badge {
  position: absolute;
  top: 6px;
  left: 6px;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
}

.approved-badge {
  position: absolute;
  top: 6px;
  right: 6px;
  background: #10b981;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.approved-badge .material-icons {
  font-size: 16px;
}

.version-details {
  flex: 1;
  min-width: 0;
}

.version-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.version-header h4 {
  color: #f9fafb;
  font-size: 14px;
  font-weight: 600;
  margin: 0;
}

.version-date {
  color: #9ca3af;
  font-size: 12px;
}

.version-description {
  color: #d1d5db;
  font-size: 13px;
  margin: 0 0 8px 0;
  line-height: 1.4;
}

.version-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 12px;
  font-size: 12px;
  color: #9ca3af;
}

.author,
.file-info {
  display: flex;
  align-items: center;
  gap: 4px;
}

.author .material-icons {
  font-size: 14px;
}

.version-actions {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.btn-approve,
.btn-action {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: #374151;
  color: #e5e7eb;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-approve {
  background: #10b981;
  color: white;
}

.btn-approve:hover {
  background: #059669;
}

.btn-action:hover {
  background: #4b5563;
}

.btn-action .material-icons,
.btn-approve .material-icons {
  font-size: 16px;
}
</style>
