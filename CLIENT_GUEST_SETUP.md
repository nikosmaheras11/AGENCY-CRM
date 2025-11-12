# Client Guest Users - Setup & Usage

## Overview

Agency Dashboard OS supports **two types of users**:

### 1. Internal Team Members
**Role:** `admin` or `user`  
**Access:** Full access to all clients and requests  
**Purpose:** Your agency's staff who create and manage work

**Examples:**
- Nikos (Admin) - Full system access
- Creative Lead - Manage creative requests
- Performance Manager - Track campaign performance
- Design Lead - Oversee design work

### 2. Client Guest Users
**Role:** `client_guest`  
**Access:** Limited to their company's requests only  
**Purpose:** External clients who review and approve work

**Examples (Polymarket team):**
- Shayne Coplan - Review all Polymarket requests
- Marketing Manager - Approve marketing materials
- Creative Director - Provide creative feedback

---

## Database Schema

### profiles Table Structure
```sql
profiles {
  id UUID PRIMARY KEY,              -- Links to auth.users
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  avatar_url VARCHAR(255),
  role VARCHAR(50),                 -- 'admin', 'user', 'client_guest'
  client_id UUID,                   -- NULL for internal, UUID for guests
  company VARCHAR(255),             -- Company name for guest users
  slack_id VARCHAR(255),
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
}
```

### Key Relationships
```
clients (Polymarket)
  └── profiles (role='client_guest', client_id=polymarket.id)
        ├── Shayne Coplan
        ├── Marketing Manager
        └── Creative Director

Internal team
  └── profiles (role='admin' or 'user', client_id=NULL)
        ├── Nikos Maheras
        ├── Creative Lead
        ├── Performance Manager
        └── Design Lead
```

---

## Permissions (Row Level Security)

### What Client Guests CAN Do:
- ✅ View requests for their client only
- ✅ View assets attached to their client's requests
- ✅ Add comments on their client's requests (for feedback)
- ✅ View other guest users from their company

### What Client Guests CANNOT Do:
- ❌ View other clients' requests
- ❌ Create new requests
- ❌ Delete or modify requests
- ❌ Upload assets
- ❌ View internal team discussions
- ❌ Access admin features

---

## Seed Data

The seed script creates:

**Polymarket (Client):**
- Primary Contact: Shayne Coplan

**Polymarket Guest Users:**
1. Shayne Coplan (shayne@polymarket.com)
2. Marketing Manager (marketing@polymarket.com)
3. Creative Director (creative@polymarket.com)

**Internal Team:**
1. Nikos Maheras - Admin (nikos@agency.com)
2. Creative Lead (creative@agency.com)
3. Performance Manager (performance@agency.com)
4. Design Lead (designer@agency.com)

---

## Adding New Client Guests

### Via Supabase Dashboard

1. Go to Authentication → Users
2. Click "Add user"
3. Enter email and password
4. After creation, go to Table Editor → profiles
5. Insert profile:
   ```json
   {
     "id": "<user_auth_id>",
     "first_name": "John",
     "last_name": "Doe",
     "role": "client_guest",
     "client_id": "<polymarket_uuid>",
     "company": "Polymarket"
   }
   ```

### Via API (for UI implementation)

```typescript
// Create auth user
const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
  email: 'newuser@polymarket.com',
  password: 'temp_password',
  email_confirm: false // They'll need to verify email
})

// Create profile
const { error: profileError } = await supabase
  .from('profiles')
  .insert({
    id: authUser.user.id,
    first_name: 'John',
    last_name: 'Doe',
    role: 'client_guest',
    client_id: polymarketId,
    company: 'Polymarket'
  })
```

---

## UI Considerations

### Login Flow
1. User enters email/password
2. System checks `role` in profile
3. Redirect based on role:
   - `admin`/`user` → Full dashboard
   - `client_guest` → Limited view (their client's requests only)

### Request List View
```typescript
// For internal team
const { data } = await supabase
  .from('requests')
  .select('*')
  
// For client guests (automatically filtered by RLS)
const { data } = await supabase
  .from('requests')
  .select('*')
  // RLS automatically filters to their client_id
```

### Guest User Badge
Show visual indicator for guest users:
```vue
<template>
  <div v-if="user.role === 'client_guest'" class="badge">
    <Icon name="material-symbols:person-check" />
    {{ user.company }} Guest
  </div>
</template>
```

---

## Future Enhancements

### Phase 3 (Planned)
- [ ] Guest-specific dashboard view
- [ ] Email invitations for new guests
- [ ] Guest activity tracking
- [ ] Request sharing links (public review)

### Phase 4 (Future)
- [ ] Guest permission levels (view-only vs comment)
- [ ] Time-limited guest access
- [ ] Guest approval workflows
- [ ] Client-specific branding

---

## Testing

### Test Client Guest Access

1. Seed database: `node scripts/seed-data.js`
2. Login as guest: `shayne@polymarket.com / client123`
3. Verify you only see Polymarket requests
4. Try to access another client's request → should be blocked
5. Add a comment → should succeed
6. Try to create request → should be blocked

### Test Internal Team Access

1. Login as admin: `nikos@agency.com / demo123`
2. Verify you see ALL requests (all clients)
3. Create new request → should succeed
4. View all client guest users → should see all

---

## Migration

**File:** `supabase/migrations/20250112_add_client_guests.sql`

**Applied Changes:**
- Added `client_id` column to profiles
- Added `company` column to profiles
- Updated RLS policies for client-scoped access
- Created `client_team_members` view

**To apply:**
```bash
# Via Supabase dashboard SQL editor
# Copy and paste migration file contents

# OR via CLI (if configured)
supabase db push
```

---

## Support

**Questions about client guests?**
- Check RLS policies in Supabase Dashboard → Database → Policies
- View guest users: Query `client_team_members` view
- Debug access: Check `profiles.client_id` matches `requests.client_id`
