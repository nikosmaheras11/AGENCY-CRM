-- Enable RLS
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE creatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE creative_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_approval_log ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable all for campaigns" ON campaigns FOR ALL USING (true);
CREATE POLICY "Enable all for ad_sets" ON ad_sets FOR ALL USING (true);
CREATE POLICY "Enable all for creatives" ON creatives FOR ALL USING (true);
CREATE POLICY "Enable all for creative_comments" ON creative_comments FOR ALL USING (true);
CREATE POLICY "Enable all for campaign_approval_log" ON campaign_approval_log FOR ALL USING (true);