-- Clean up creative requests - keep only 2
-- Run this in Supabase SQL Editor

-- Step 1: Delete all creative requests
DELETE FROM requests WHERE project_type = 'creative';

-- Step 2: Insert the two main requests
INSERT INTO requests (
  project_type, status, title, format, size, dimensions, duration,
  figma_url, tags, client, campaign, created_at, updated_at
) VALUES (
  'creative', 'in-progress', 'Google Ad Brainstorm', 'Figma', '—', '—', '—',
  'https://www.figma.com/design/oNc959dRXzFRbRdWbDkW0R/Polymarket-Ad-Master-Doc?node-id=383-3866&t=AO2exoexFrM7drs2-4',
  ARRAY['google', 'ads', 'brainstorm'], 'Polymarket', 'Google Ads',
  '2025-01-10T06:00:00Z', '2025-01-10T06:00:00Z'
);

INSERT INTO requests (
  project_type, status, title, format, size, dimensions, duration,
  video_url, thumbnail_url, tags, client, campaign, category,
  created_at, updated_at
) VALUES (
  'creative', 'needs-review', 'RAMS UGC Video', 'MP4', '125 MB', '1920 × 1080', '1:23',
  '/videos/rams-ugc-video.mp4', '/thumbnails/rams-ugc-video.jpg',
  ARRAY['video', 'ugc', 'performance'], 'Polymarket', 'Performance', 'Performance',
  '2025-01-11T07:24:00Z', '2025-01-11T07:24:00Z'
);

-- Step 3: Verify
SELECT project_type, status, title FROM requests WHERE project_type = 'creative';
