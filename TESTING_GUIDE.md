# Testing Guide: Real-Time Creative Requests

## 🚀 Quick Start

### 1. Start Development Server

```bash
pnpm dev
```

### 2. Navigate to Test Page

Open in your browser:
```
http://localhost:3000/creative-requests
```

### 3. Test Form Submission

1. Click **"New Request"** button
2. Fill out the form:
   - **Creative Name**: "Test Campaign Video"
   - **Platform**: "Instagram"
   - **Ad Size / Format**: "1080x1920, Reel"
   - **Priority**: "High"
   - **Due Date**: Select a future date
   - **Creative Description**: "Test description for real-time sync"
   - **(Optional)** Upload an image or video file
3. Click **"Submit"**
4. Watch the request appear instantly in the grid below!

### 4. Test Real-Time Updates

**Option A: Multiple Browser Windows**
1. Open `http://localhost:3000/creative-requests` in two browser windows
2. Create a request in one window
3. Watch it appear instantly in the other window! ✨

**Option B: Supabase Dashboard**
1. Go to Supabase Dashboard → Table Editor → `requests`
2. Manually update a field (e.g., change status to "in-progress")
3. Watch the update appear in your browser instantly!

## 🧪 What to Test

### ✅ Form Submission
- [ ] Create request without file
- [ ] Create request with image upload
- [ ] Create request with video upload
- [ ] Verify all fields are saved correctly

### ✅ Real-Time Sync
- [ ] New requests appear instantly
- [ ] Updates to existing requests reflect immediately
- [ ] Deletes remove items from the list
- [ ] Connection status shows "connected"

### ✅ UI Features
- [ ] Priority badges show correct colors
- [ ] Status badges display properly
- [ ] Due date shows relative time ("Today", "Tomorrow", "In 3 days")
- [ ] Overdue dates show in red
- [ ] Asset thumbnails display (if uploaded)
- [ ] Clicking a request navigates to detail page

### ✅ Edge Cases
- [ ] Empty state shows when no requests exist
- [ ] Loading state appears briefly on page load
- [ ] Connection status banner shows when disconnected
- [ ] Form validation works (required fields)

## 🐛 Troubleshooting

### Issue: Requests don't appear after submission

**Check:**
1. Open browser console (F12) for errors
2. Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `.env`
3. Check Supabase Dashboard → Table Editor → `requests` to see if data was inserted

### Issue: Real-time updates don't work

**Check:**
1. Supabase Dashboard → Database → Publications
2. Verify `requests` table is added to `supabase_realtime` publication
3. Check connection status in the UI (should say "connected")
4. Look for WebSocket errors in browser console

### Issue: File upload fails

**Check:**
1. Storage bucket named `assets` exists (Dashboard → Storage)
2. Bucket is set to **public**
3. Upload policies allow authenticated users
4. File size is under limits

### Issue: "Cannot find module" errors

**Run:**
```bash
pnpm install
```

## 📊 Verify Database Schema

### Check if all tables exist:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

Expected tables:
- requests
- comments
- assets
- asset_versions
- form_templates
- mentions
- activity_log
- profiles
- clients
- slack_messages

### Check requests table structure:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'requests'
ORDER BY ordinal_position;
```

## 🎯 Success Criteria

✅ **Form submission works** - Request appears in database and UI
✅ **Real-time sync works** - Changes appear instantly across clients
✅ **File uploads work** - Images/videos upload to storage and display
✅ **Connection status shows** - "connected" banner appears
✅ **No console errors** - Browser console is clean

## 📝 Next Steps After Testing

1. **Add Filtering** - Filter by status, priority, assignee
2. **Add Sorting** - Sort by date, priority, status
3. **Add Search** - Search by title, description
4. **Add Comments** - Implement real-time comments on requests
5. **Add Notifications** - Toast notifications for new requests
6. **Add Detail View** - Full request detail page with version history

## 🔗 Quick Links

- **Test Page**: http://localhost:3000/creative-requests
- **Supabase Dashboard**: https://supabase.com/dashboard/project/vzhthefdgumjkhnjpydt
- **Table Editor**: https://supabase.com/dashboard/project/vzhthefdgumjkhnjpydt/editor
- **Storage**: https://supabase.com/dashboard/project/vzhthefdgumjkhnjpydt/storage/buckets

---

**Happy Testing! 🎉**

If everything works, you now have a production-ready real-time creative request system!
