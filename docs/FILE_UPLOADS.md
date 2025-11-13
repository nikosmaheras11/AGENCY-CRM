# File Upload Configuration

## Overview

The application uses **Supabase Storage** for handling file uploads in creative requests. All assets (images, videos, documents) are stored in the `assets` bucket.

## Storage Bucket Setup

### Bucket Configuration
- **Name**: `assets`
- **Access**: Public (files are accessible via public URLs)
- **Default Size Limit**: Configured by Supabase plan
- **Supported File Types**: All (no MIME type restrictions)

### Initial Setup

Run the setup script to create the bucket:

```bash
npx tsx scripts/setup-storage-bucket.ts
```

This script will:
- Check if the `assets` bucket exists
- Create it if it doesn't exist
- Update settings if it already exists
- Test upload permissions

## File Upload Limits

### By Supabase Plan

| Plan | Max File Size | Storage Included |
|------|---------------|------------------|
| Free | 50 MB | 1 GB |
| Pro | 5 GB | 100 GB |
| Team | 5 GB | 100 GB |
| Enterprise | Custom | Custom |

### Application Limits

The application handles files through the `useSupabase()` composable:

```typescript
const { uploadImage, uploadVideo, uploadFile } = useSupabase()

// Upload image
const imageUrl = await uploadImage(file, 'requests')

// Upload video
const videoUrl = await uploadVideo(file, 'requests')

// Upload generic file
const fileUrl = await uploadFile('assets', 'requests/filename.pdf', file)
```

## Folder Structure

Files are organized by type and purpose:

```
assets/
├── requests/        # Files uploaded with creative requests
├── images/          # Image assets
├── videos/          # Video assets
└── [timestamp]-[filename]
```

## File Naming Convention

Files are automatically renamed on upload:
- Format: `{folder}/{timestamp}-{original-filename}`
- Example: `requests/1705234567890-campaign-video.mp4`

This prevents:
- Filename collisions
- Special character issues
- Overwrites

## Security

### Access Control

The `assets` bucket is configured as **public**, which means:
- ✅ Files are accessible via direct URLs
- ✅ No authentication required to view files
- ✅ Simplifies sharing and embedding
- ⚠️ Anyone with the URL can access the file

For private files, you can:
1. Store sensitive data in a separate private bucket
2. Use signed URLs with expiration
3. Implement RLS policies

### RLS Policies

Currently, the bucket uses public access. To add Row Level Security:

```sql
-- Create policy for authenticated uploads
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'assets');

-- Create policy for public reads
CREATE POLICY "Public can read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'assets');
```

## Usage in Forms

### Creative Request Form

The `RequestFormModal` component handles file uploads:

1. User selects a file
2. File is validated (type, size)
3. File is uploaded to Supabase Storage
4. Public URL is returned
5. URL is saved in `requests` table

### Error Handling

Common upload errors:

| Error | Cause | Solution |
|-------|-------|----------|
| "Bucket not found" | Bucket doesn't exist | Run setup script |
| "File too large" | Exceeds plan limit | Compress file or upgrade plan |
| "Invalid file type" | Unsupported format | Check MIME type restrictions |
| "Upload failed" | Network/auth issue | Check credentials and connection |

## Troubleshooting

### Bucket Not Found Error

If you see "Bucket not found" in production:

1. Verify the bucket exists in Supabase Dashboard → Storage
2. Check environment variables are set correctly
3. Run the setup script in production environment

### Upload Fails Silently

Check browser console for errors:
- CORS issues (check Supabase CORS settings)
- Authentication (ensure user is logged in)
- File size (check plan limits)

### Files Not Appearing

1. Check Supabase Dashboard → Storage → assets bucket
2. Verify the file path in console logs
3. Test with a small file (< 1MB) to isolate size issues

## Production Deployment

### Environment Variables

Required in Vercel/production:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key  # For server-side operations
```

### Post-Deployment Steps

After deploying to production:

1. Ensure the `assets` bucket exists in production Supabase
2. Test file upload through the application
3. Verify public URLs are accessible
4. Monitor storage usage in Supabase Dashboard

## Monitoring & Maintenance

### Check Storage Usage

```bash
# View bucket size
npx supabase storage usage

# List recent uploads
npx supabase storage ls assets --limit 10
```

### Clean Up Old Files

```typescript
// Delete files older than 30 days
const { data, error } = await supabase.storage
  .from('assets')
  .remove(['path/to/old-file.jpg'])
```

## Future Improvements

Potential enhancements:

- [ ] Implement file compression before upload
- [ ] Add thumbnail generation for videos
- [ ] Implement CDN caching
- [ ] Add virus scanning for uploads
- [ ] Implement file versioning
- [ ] Add batch upload support
- [ ] Implement progress indicators for large files
