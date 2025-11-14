# Global Search Setup Instructions

## Step 1: Run SQL Migration in Supabase Dashboard

1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/vzhthefdgumjkhnjpydt
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the contents of `supabase/migrations/20250114_global_search.sql`
5. Click **Run** to execute

This will:
- Enable the `pg_trgm` extension for fuzzy search
- Create GIN indexes on assets and requests tables
- Create the `global_search()` function that searches across both entities

## Step 2: Test the Search

Once the migration is complete, you can test the search function directly in SQL Editor:

```sql
SELECT * FROM global_search('landscape');
```

This should return matching assets and requests.

## Step 3: Use the Frontend

The global search is now available in the top nav bar:
- Click the search button or press `Cmd+K` (Mac) / `Ctrl+K` (Windows)
- Type to search across assets and requests
- Results appear with thumbnails and entity type badges
- Click any result to navigate to it

## Features

- **Typo-tolerant**: Finds "landscape" even if you type "landcape"
- **Fast**: GIN indexes ensure quick searches even with thousands of records
- **Multi-entity**: Searches both assets and requests simultaneously
- **Keyboard shortcuts**: `Cmd+K` to open, `Esc` to close
- **Real-time**: 300ms debounced search as you type

## Troubleshooting

If search doesn't work:

1. Verify the migration ran successfully in Supabase SQL Editor
2. Check browser console for any errors
3. Verify assets/requests tables exist and have data
4. Test the `global_search()` function directly in SQL Editor
