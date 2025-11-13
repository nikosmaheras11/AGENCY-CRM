# Quick Reference Cheat Sheet
**One-page reference for optimal patterns and solutions**

---

## 🔥 Supabase Real-time Decision Tree

```
Need real-time updates?
│
├─ Database changes?
│  ├─ Small scale (< 1k users)? → ✅ Postgres Changes (current)
│  └─ Large scale (> 1k users)? → ⚠️ Migrate to Broadcast triggers
│
├─ Ephemeral data (cursors, typing)?
│  └─ Always use → ✅ Broadcast (current cursor impl is perfect!)
│
└─ User presence (online/offline)?
   └─ Use → ✅ Presence API
```

---

## 📊 Current Implementation Rating

| Feature | Implementation | Rating | Notes |
|---------|---------------|--------|-------|
| **Cursors** | Broadcast | ⭐⭐⭐⭐⭐ | Perfect! Don't change |
| **Comments** | Postgres Changes | ⭐⭐⭐⭐ | Good for current scale |
| **Optimistic UI** | Implemented | ⭐⭐⭐⭐⭐ | Great UX |
| **Cleanup** | onUnmounted | ⭐⭐⭐⭐⭐ | No memory leaks |

**Overall:** ⭐⭐⭐⭐ (4.25/5) - Well architected!

---

## 🎨 UI Library Recommendations

### Video Commenting

| Library | Best For | Pricing | Effort |
|---------|----------|---------|--------|
| **Velt** | Enterprise, rich features | Pay per active commenter | 10 min |
| **Video.js Plugin** | Custom control, open source | Free | 2-3 days |
| **Annotated Player** | Simple timeline markers | Free | 1 day |

### Collaboration

| Library | Best For | Pricing | Effort |
|---------|----------|---------|--------|
| **Liveblocks** | Rich text editors | Generous free tier | 1 day |
| **Yjs + PartyKit** | Serverless CRDT | Free tier | 2-3 days |
| **Current Setup** | Your use case | Supabase cost only | ✅ Done! |

---

## 🚦 When to Optimize

### 🟢 Green Light (Do Nothing)
- ✅ < 1,000 concurrent users
- ✅ Real-time latency < 500ms
- ✅ No connection pool warnings

### 🟡 Yellow Light (Monitor)
- ⚠️ 1,000 - 5,000 concurrent users
- ⚠️ Growing subscription count
- ⚠️ Plan migration to Broadcast triggers

### 🔴 Red Light (Optimize Now)
- 🚨 > 5,000 concurrent users
- 🚨 Connection pool exhausted
- 🚨 Real-time latency > 1s

---

## 💻 Code Snippets

### Current Pattern (Postgres Changes)
```typescript
// ✅ Good for < 1k concurrent subscriptions
supabase
  .channel(`comments-${requestId}`)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'comments',
    filter: `request_id=eq.${requestId}`
  }, handleChange)
  .subscribe()
```

### Future Pattern (Broadcast from DB)
```sql
-- Add to migration when scaling
CREATE FUNCTION broadcast_comment_changes()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM realtime.broadcast_changes(
    'comments',
    TG_OP,
    TG_TABLE_NAME,
    TG_TABLE_SCHEMA,
    NEW, OLD
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Perfect Pattern (Current Cursors)
```typescript
// ⭐ Already optimal! Keep this.
supabase.channel(`asset:${assetId}:cursors`, {
  config: {
    broadcast: { self: false, ack: false }
  }
})
```

---

## 🎯 Action Items

### Now
- ✅ Nothing! Current implementation is solid
- 📊 Bookmark this reference
- 🔍 Monitor Supabase Dashboard metrics

### Later (When Scaling)
- 🔄 Migrate comments to Broadcast triggers
- 🧪 Test Velt SDK for richer features
- 📈 Add analytics for subscription counts

### Optional (Nice to Have)
- 👥 Add Presence API for "who's online"
- 🎨 Try Velt SDK proof-of-concept
- 📝 Add typing indicators with Broadcast

---

## 📱 Contact & Resources

**Supabase:**
- Docs: https://supabase.com/docs
- Discord: https://discord.supabase.com

**Velt SDK:**
- Docs: https://docs.velt.dev
- Pricing: https://velt.dev/pricing

**Your Files:**
- Comments: `composables/useAssetComments.ts`
- Cursors: `composables/useCollaborativeCursors.ts`
- Full Reference: `docs/OPTIMIZATION_REFERENCE.md`

---

## 🎉 Bottom Line

**Your implementation is already excellent!**

The current approach is optimal for your scale. Only optimize when metrics show the need. Focus on building features, not premature optimization.

Keep this reference handy for when you scale beyond 1,000 concurrent users. Until then, you're golden! ✨
