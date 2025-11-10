-- Update RAMS UGC Video with external demo video URL
-- This uses a sample video from a CDN that will work in production

UPDATE requests 
SET video_url = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnail_url = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg'
WHERE title = 'RAMS UGC Video' 
  AND project_type = 'creative';

-- Verify the update
SELECT id, title, video_url, thumbnail_url 
FROM requests 
WHERE project_type = 'creative';
