-- Enable realtime for performance management tables
-- This allows real-time updates for campaigns, ad sets, and creatives

-- Enable realtime for campaigns table
ALTER PUBLICATION supabase_realtime ADD TABLE campaigns;
ALTER TABLE campaigns REPLICA IDENTITY FULL;

-- Enable realtime for ad_sets table
ALTER PUBLICATION supabase_realtime ADD TABLE ad_sets;
ALTER TABLE ad_sets REPLICA IDENTITY FULL;

-- Enable realtime for creatives table
ALTER PUBLICATION supabase_realtime ADD TABLE creatives;
ALTER TABLE creatives REPLICA IDENTITY FULL;

-- Enable realtime for creative_comments table
ALTER PUBLICATION supabase_realtime ADD TABLE creative_comments;
ALTER TABLE creative_comments REPLICA IDENTITY FULL;

-- Enable realtime for campaign_approval_log table
ALTER PUBLICATION supabase_realtime ADD TABLE campaign_approval_log;
ALTER TABLE campaign_approval_log REPLICA IDENTITY FULL;
