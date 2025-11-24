-- Check if campaigns table is in the realtime publication
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
  AND tablename IN ('campaigns', 'ad_sets', 'creatives');

-- Check replica identity
SELECT schemaname, tablename, relreplident
FROM pg_publication_tables pt
JOIN pg_class c ON c.relname = pt.tablename
WHERE pubname = 'supabase_realtime' 
  AND tablename IN ('campaigns', 'ad_sets', 'creatives');

-- If tables are missing, add them:
-- ALTER PUBLICATION supabase_realtime ADD TABLE campaigns;
-- ALTER TABLE campaigns REPLICA IDENTITY FULL;
