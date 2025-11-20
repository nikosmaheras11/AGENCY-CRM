-- ============================================
-- CAMPAIGNS TABLE (Top-Level Planning)
-- ============================================
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Basic Info
  name VARCHAR(255) NOT NULL,
  description TEXT,
  client_id UUID REFERENCES clients(id),
  
  -- Platform Configuration (Multi-select)
  platforms TEXT[] NOT NULL, -- ['meta', 'tiktok', 'google', 'linkedin', 'twitter']
  
  -- Campaign Planning
  objective VARCHAR(100), -- 'awareness', 'traffic', 'engagement', 'leads', 'conversions', 'sales'
  campaign_brief TEXT, -- High-level strategy and goals
  
  -- Timeline
  planned_launch_date DATE,
  planned_end_date DATE,
  
  -- Status & Approval
  status VARCHAR(50) DEFAULT 'planning', -- 'planning', 'in_review', 'approved', 'live', 'completed', 'archived'
  
  -- Ownership
  created_by UUID REFERENCES auth.users(id),
  assigned_to UUID REFERENCES auth.users(id), -- Internal team member managing
  
  -- Client Approval
  submitted_for_review_at TIMESTAMP,
  reviewed_by UUID REFERENCES clients(id), -- Client contact who reviewed
  approved_at TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- AD SETS TABLE (Audience Groups)
-- ============================================
CREATE TABLE ad_sets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  
  -- Basic Info
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Which platform is this ad set for
  platform VARCHAR(50) NOT NULL,
  
  -- Audience Definition (High-level planning)
  audience_description TEXT, -- "Women 25-45 in California interested in sustainable fashion"
  
  -- Demographics (Simple fields for planning)
  age_range VARCHAR(50), -- "25-45", "18-34", etc.
  gender VARCHAR(20), -- "all", "male", "female"
  locations TEXT[], -- ["United States", "California", "Los Angeles"]
  
  -- Interests & Targeting Notes
  targeting_notes TEXT, -- Freeform notes about audience targeting
  
  -- Budget Planning (Estimates)
  estimated_daily_budget DECIMAL(10,2),
  estimated_total_budget DECIMAL(10,2),
  
  -- Timeline
  planned_start_date DATE,
  planned_end_date DATE,
  
  -- Status & Approval
  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'ready_for_review', 'in_review', 'approved', 'changes_requested'
  
  -- Notes
  internal_notes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- CREATIVES TABLE (Individual Ads - Asset Focus)
-- ============================================
CREATE TABLE creatives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ad_set_id UUID REFERENCES ad_sets(id) ON DELETE CASCADE,
  
  -- Basic Info
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Asset Link (from Creative Workflow)
  asset_id UUID REFERENCES assets(id),
  
  -- Ad Format & Specs
  format VARCHAR(50), -- 'single_image', 'single_video', 'carousel', 'story'
  dimensions VARCHAR(50), -- "1080x1920", "1080x1080", "1200x628"
  
  -- Copy Elements
  primary_text TEXT,
  headline VARCHAR(255),
  cta_type VARCHAR(50), -- 'learn_more', 'shop_now', 'sign_up', etc.
  destination_url TEXT,
  
  -- Client Review & Approval
  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'ready_for_review', 'in_review', 'changes_requested', 'approved', 'ready_to_ship'
  
  submitted_for_review_at TIMESTAMP,
  review_requested_from UUID REFERENCES auth.users(id), -- Client contact
  reviewed_at TIMESTAMP,
  reviewed_by UUID REFERENCES auth.users(id),
  
  -- Approval Notes
  approval_notes TEXT,
  
  -- Shipping
  shipped_at TIMESTAMP,
  shipped_by UUID REFERENCES auth.users(id),
  shipping_notes TEXT, -- Notes about where/how it was shipped
  
  -- Platform Reference (once live)
  external_ad_id VARCHAR(255), -- Platform's ad ID after shipping
  
  -- Internal tracking
  internal_notes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- CREATIVE COMMENTS (Client Feedback)
-- ============================================
CREATE TABLE creative_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creative_id UUID REFERENCES creatives(id) ON DELETE CASCADE,
  
  -- Comment Content
  comment_text TEXT NOT NULL,
  
  -- Visual feedback (if applicable)
  position_x DECIMAL(5,2), -- Percentage position for visual comments
  position_y DECIMAL(5,2),
  
  -- Comment Type
  comment_type VARCHAR(50) DEFAULT 'general', -- 'general', 'change_request', 'approval', 'question'
  
  -- Resolution
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP,
  resolved_by UUID REFERENCES auth.users(id),
  
  -- Authorship
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Threading
  parent_comment_id UUID REFERENCES creative_comments(id),
  
  -- Mentions
  mentioned_users UUID[]
);

-- ============================================
-- CAMPAIGN APPROVAL LOG
-- ============================================
CREATE TABLE campaign_approval_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- What's being reviewed
  entity_type VARCHAR(50) NOT NULL, -- 'campaign', 'ad_set', 'creative'
  entity_id UUID NOT NULL,
  
  -- Action taken
  action VARCHAR(50) NOT NULL, -- 'submitted', 'approved', 'rejected', 'changes_requested'
  notes TEXT,
  
  -- Who & When
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_campaigns_client ON campaigns(client_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_ad_sets_campaign ON ad_sets(campaign_id);
CREATE INDEX idx_ad_sets_status ON ad_sets(status);
CREATE INDEX idx_creatives_ad_set ON creatives(ad_set_id);
CREATE INDEX idx_creatives_asset ON creatives(asset_id);
CREATE INDEX idx_creatives_status ON creatives(status);
CREATE INDEX idx_comments_creative ON creative_comments(creative_id);
CREATE INDEX idx_approval_log_entity ON campaign_approval_log(entity_type, entity_id);
