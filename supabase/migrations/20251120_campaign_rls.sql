-- Enable RLS
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE creatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE creative_comments ENABLE ROW LEVEL SECURITY;

-- Campaigns Policies
CREATE POLICY "Users can view campaigns they created or are assigned to"
  ON campaigns FOR SELECT
  USING (
    auth.uid() = created_by OR 
    auth.uid() = assigned_to OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'account_manager')
    )
  );

CREATE POLICY "Users can create campaigns"
  ON campaigns FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update campaigns they created or are assigned to"
  ON campaigns FOR UPDATE
  USING (
    auth.uid() = created_by OR 
    auth.uid() = assigned_to OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'account_manager')
    )
  );

-- Ad Sets Policies (inherit from campaign)
CREATE POLICY "Users can view ad sets if they can view the campaign"
  ON ad_sets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = ad_sets.campaign_id
      AND (
        campaigns.created_by = auth.uid() OR
        campaigns.assigned_to = auth.uid() OR
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND role IN ('admin', 'account_manager')
        )
      )
    )
  );

CREATE POLICY "Users can manage ad sets if they can manage the campaign"
  ON ad_sets FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = ad_sets.campaign_id
      AND (
        campaigns.created_by = auth.uid() OR
        campaigns.assigned_to = auth.uid() OR
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND role IN ('admin', 'account_manager')
        )
      )
    )
  );

-- Creatives Policies (inherit from ad set -> campaign)
CREATE POLICY "Users can view creatives if they can view the ad set"
  ON creatives FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM ad_sets
      JOIN campaigns ON campaigns.id = ad_sets.campaign_id
      WHERE ad_sets.id = creatives.ad_set_id
      AND (
        campaigns.created_by = auth.uid() OR
        campaigns.assigned_to = auth.uid() OR
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND role IN ('admin', 'account_manager')
        )
      )
    )
  );

CREATE POLICY "Users can manage creatives if they can manage the ad set"
  ON creatives FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM ad_sets
      JOIN campaigns ON campaigns.id = ad_sets.campaign_id
      WHERE ad_sets.id = creatives.ad_set_id
      AND (
        campaigns.created_by = auth.uid() OR
        campaigns.assigned_to = auth.uid() OR
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND role IN ('admin', 'account_manager')
        )
      )
    )
  );
