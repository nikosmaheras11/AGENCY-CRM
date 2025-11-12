# Phase 2: Data Integration - Implementation Plan

**Status:** 🔄 In Progress (75% → 100%)  
**Goal:** Connect all dashboard pages to real Supabase data and implement core functionality

---

## Current State

### ✅ Completed
- [x] Supabase backend connected
- [x] Database schema deployed (30 tables)
- [x] `useSupabase()` composable ready
- [x] Configuration cleanup (Directus removed)
- [x] Cloud-first workflow established

### 📊 Existing Data
- **Requests:** 2 (Google Ad Brainstorm, RAMS UGC Video)
- **Clients:** 0
- **Profiles:** 0  
- **Assets:** 0
- **Comments:** 0

---

## Implementation Tasks

### Task 1: Seed Initial Data ✨
**Priority:** High  
**Why:** Need clients and profiles to properly test the system

**Steps:**
1. Create seed data script
2. Add 2-3 sample clients
3. Create initial team member profiles
4. Link existing requests to clients

**Files to Create:**
- `scripts/seed-data.js`

---

### Task 2: Update Overview Dashboard 📊
**File:** `pages/index.vue`  
**Priority:** High

**Current State:** Using mock/static data  
**Target:** Real-time data from Supabase

**Changes Needed:**
```vue
<script setup>
const { supabase } = useSupabase()

// Replace mock data with:
const { data: recentRequests } = await supabase
  .from('requests')
  .select('*, client:clients(*), assigned:profiles(*)')
  .order('created_at', { ascending: false })
  .limit(10)

const { data: activityLog } = await supabase
  .from('activity_log')
  .select('*, user:profiles(*)')
  .order('created_at', { ascending: false })
  .limit(20)

// Stats calculation from real data
const { count: totalRequests } = await supabase
  .from('requests')
  .select('*', { count: 'exact', head: true })

const { count: activeRequests } = await supabase
  .from('requests')
  .select('*', { count: 'exact', head: true })
  .eq('status', 'in_progress')
</script>
```

---

### Task 3: Update Creative Hub 🎨
**File:** `pages/creative/index.vue`  
**Priority:** High

**Current State:** Showing placeholder cards  
**Target:** Real creative requests from Supabase

**Changes Needed:**
```vue
<script setup>
const { supabase } = useSupabase()

// Fetch creative requests
const { data: creativeRequests } = await supabase
  .from('requests')
  .select(`
    *,
    client:clients(name, logo_url),
    assets(id, name, preview_url, file_type),
    assigned:profiles(first_name, last_name, avatar_url)
  `)
  .eq('request_type', 'creative')
  .order('created_at', { ascending: false })

// Real-time subscription for updates
supabase
  .channel('creative-updates')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'requests',
    filter: 'request_type=eq.creative'
  }, (payload) => {
    // Update UI when data changes
  })
  .subscribe()
</script>
```

---

### Task 4: Implement "Create Request" Modal 🆕
**Files to Create:**
- `components/CreateRequestModal.vue`
- Update `pages/creative/index.vue` to include modal

**Priority:** High

**Features:**
- Form with title, description, client selection
- Request type selector (creative, performance, project)
- Priority selector
- Due date picker
- Assigned user selector

**Implementation:**
```vue
<template>
  <UModal v-model="isOpen">
    <UCard>
      <template #header>
        <h3>Create New Request</h3>
      </template>

      <UForm :state="form" @submit="handleSubmit">
        <UFormGroup label="Title" name="title">
          <UInput v-model="form.title" />
        </UFormGroup>

        <UFormGroup label="Client" name="client_id">
          <USelectMenu
            v-model="form.client_id"
            :options="clients"
            option-attribute="name"
            value-attribute="id"
          />
        </UFormGroup>

        <UFormGroup label="Request Type" name="request_type">
          <USelectMenu
            v-model="form.request_type"
            :options="['creative', 'performance', 'project']"
          />
        </UFormGroup>

        <UFormGroup label="Priority" name="priority">
          <USelectMenu
            v-model="form.priority"
            :options="['low', 'medium', 'high', 'urgent']"
          />
        </UFormGroup>

        <UButton type="submit" color="primary">
          Create Request
        </UButton>
      </UForm>
    </UCard>
  </UModal>
</template>

<script setup>
const { supabase, user } = useSupabase()

const form = reactive({
  title: '',
  description: '',
  client_id: null,
  request_type: 'creative',
  priority: 'medium',
  due_date: null
})

async function handleSubmit() {
  const { data, error } = await supabase
    .from('requests')
    .insert({
      ...form,
      status: 'new_request',
      created_by: user.value?.id
    })
    .select()
    .single()

  if (!error) {
    // Success! Close modal and refresh
    isOpen.value = false
    // Emit event or navigate
  }
}
</script>
```

---

### Task 5: Implement Authentication 🔐
**Files to Create:**
- `pages/auth/login.vue`
- `pages/auth/signup.vue`
- `middleware/auth.ts`

**Priority:** Medium

**Features:**
- Email/password login
- Sign up flow
- Protected routes
- User session management

**Implementation:**
```typescript
// middleware/auth.ts
export default defineNuxtRouteMiddleware(async (to, from) => {
  const { supabase, user } = useSupabase()
  
  // Check if user is authenticated
  if (!user.value) {
    const { data } = await supabase.auth.getSession()
    if (!data.session) {
      return navigateTo('/auth/login')
    }
  }
})
```

```vue
<!-- pages/auth/login.vue -->
<template>
  <div class="min-h-screen flex items-center justify-center">
    <UCard class="w-full max-w-md">
      <template #header>
        <h2>Sign In to Agency Dashboard</h2>
      </template>

      <UForm :state="form" @submit="handleLogin">
        <UFormGroup label="Email" name="email">
          <UInput v-model="form.email" type="email" />
        </UFormGroup>

        <UFormGroup label="Password" name="password">
          <UInput v-model="form.password" type="password" />
        </UFormGroup>

        <UButton type="submit" block>
          Sign In
        </UButton>
      </UForm>

      <template #footer>
        <p>
          Don't have an account?
          <NuxtLink to="/auth/signup">Sign up</NuxtLink>
        </p>
      </template>
    </UCard>
  </div>
</template>

<script setup>
const { supabase } = useSupabase()
const router = useRouter()

const form = reactive({
  email: '',
  password: ''
})

async function handleLogin() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: form.email,
    password: form.password
  })

  if (!error) {
    router.push('/')
  } else {
    // Show error toast
  }
}
</script>
```

---

### Task 6: Build Profile Management 👤
**Files to Create:**
- `pages/settings/profile.vue`
- `pages/settings/team.vue`

**Priority:** Medium

**Features:**
- Edit own profile
- Upload avatar
- View team members
- Admin: Manage team members

**Implementation:**
```vue
<!-- pages/settings/profile.vue -->
<template>
  <div class="max-w-2xl mx-auto p-6">
    <h1 class="text-2xl font-bold mb-6">My Profile</h1>

    <UForm :state="profile" @submit="handleUpdate">
      <UFormGroup label="First Name">
        <UInput v-model="profile.first_name" />
      </UFormGroup>

      <UFormGroup label="Last Name">
        <UInput v-model="profile.last_name" />
      </UFormGroup>

      <UFormGroup label="Avatar">
        <UInput type="file" @change="handleAvatarUpload" />
      </UFormGroup>

      <UButton type="submit">
        Save Changes
      </UButton>
    </UForm>
  </div>
</template>

<script setup>
const { supabase, user } = useSupabase()

const profile = ref({
  first_name: '',
  last_name: '',
  avatar_url: ''
})

// Fetch current profile
const { data } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.value.id)
  .single()

profile.value = data

async function handleUpdate() {
  await supabase
    .from('profiles')
    .update(profile.value)
    .eq('id', user.value.id)
}

async function handleAvatarUpload(event) {
  const file = event.target.files[0]
  const { uploadImage } = useSupabase()
  const url = await uploadImage(file, 'avatars')
  profile.value.avatar_url = url
}
</script>
```

---

## Implementation Order

### Week 1 (Now)
1. ✅ Create seed data script
2. ✅ Seed initial clients and profiles
3. ✅ Update Overview Dashboard to use real data
4. ✅ Update Creative Hub to use real data

### Week 2
5. ⏳ Implement Create Request Modal
6. ⏳ Add real-time subscriptions to dashboards
7. ⏳ Implement basic authentication

### Week 3
8. ⏳ Build profile management pages
9. ⏳ Add team member management (admin only)
10. ⏳ Polish UI and fix edge cases

---

## Success Criteria

Phase 2 will be considered complete when:

- [ ] All dashboard pages show real data from Supabase
- [ ] Users can create new requests via UI
- [ ] Real-time updates work (when data changes, UI updates)
- [ ] Basic authentication is functional
- [ ] Users can manage their profiles
- [ ] Team members can be viewed and managed

---

## Testing Checklist

After implementation:

- [ ] Create a new request via UI
- [ ] Verify it appears in Overview Dashboard
- [ ] Verify it appears in Creative Hub
- [ ] Update request status
- [ ] Add a comment to a request
- [ ] Upload an asset
- [ ] Login/logout works
- [ ] Profile updates save correctly
- [ ] Real-time updates work across tabs

---

**Next Step:** Start with seed data and dashboard updates!
