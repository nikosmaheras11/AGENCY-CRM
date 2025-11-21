-- CAMPAIGNS TABLE (Top-Level Planning)
-- ============================================
CREATE TABLE IF NOT EXISTS campaigns (
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
  assigned_to UUID REFERENCES auth.users(id),
  
  -- Client Approval
  submitted_for_review_at TIMESTAMP,
  reviewed_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- AD SETS TABLE (Audience Groups)
-- ============================================
CREATE TABLE IF NOT EXISTS ad_sets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  
  -- Basic Info
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Which platform is this ad set for
  platform VARCHAR(50) NOT NULL,
  
  -- Audience Definition
  audience_description TEXT,
  
  -- Demographics
  age_range VARCHAR(50),
  gender VARCHAR(20),
  locations TEXT[],
  
  -- Targeting Notes
  targeting_notes TEXT,
  
  -- Budget Planning
  estimated_daily_budget DECIMAL(10,2),
  estimated_total_budget DECIMAL(10,2),
  
  -- Timeline
  planned_start_date DATE,
  planned_end_date DATE,
  
  -- Status & Approval
  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'ready_for_review', 'in_review', 'approved', 'changes_requested'
  
  -- Notes
  internal_notes TEXT,
  
  -- Ordering within campaign
  sort_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- CREATIVES TABLE (Individual Ads)
-- ============================================
CREATE TABLE IF NOT EXISTS creatives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ad_set_id UUID REFERENCES ad_sets(id) ON DELETE CASCADE,
  
  -- Basic Info
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Asset Link
  asset_id UUID REFERENCES assets(id),
  
  -- Format & Specs
  format VARCHAR(50),
  dimensions VARCHAR(50),
  
  -- Copy Elements
  primary_text TEXT,
  headline VARCHAR(255),
  cta_type VARCHAR(50),
  destination_url TEXT,
  
  -- Client Review & Approval
  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'ready_for_review', 'in_review', 'changes_requested', 'approved', 'ready_to_ship'
  
  submitted_for_review_at TIMESTAMP,
  review_requested_from UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP,
  reviewed_by UUID REFERENCES auth.users(id),
  
  -- Approval Notes
  approval_notes TEXT,
  
  -- Shipping
  shipped_at TIMESTAMP,
  shipped_by UUID REFERENCES auth.users(id),
  shipping_notes TEXT,
  external_ad_id VARCHAR(255),
  
  -- Internal tracking
  internal_notes TEXT,
  
  -- Ordering within ad set
  sort_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- CREATIVE COMMENTS (Client Feedback)
-- ============================================
CREATE TABLE IF NOT EXISTS creative_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creative_id UUID REFERENCES creatives(id) ON DELETE CASCADE,
  
  comment_text TEXT NOT NULL,
  
  -- Visual feedback position
  position_x DECIMAL(5,2),
  position_y DECIMAL(5,2),
  
  comment_type VARCHAR(50) DEFAULT 'general',
  
  -- Resolution
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP,
  resolved_by UUID REFERENCES auth.users(id),
  
  -- Authorship
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Threading
  parent_comment_id UUID REFERENCES creative_comments(id),
  
  mentioned_users UUID[]
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_campaigns_client ON campaigns(client_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_ad_sets_campaign ON ad_sets(campaign_id);
CREATE INDEX IF NOT EXISTS idx_ad_sets_sort ON ad_sets(campaign_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_creatives_ad_set ON creatives(ad_set_id);
CREATE INDEX IF NOT EXISTS idx_creatives_sort ON creatives(ad_set_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_creatives_asset ON creatives(asset_id);
CREATE INDEX IF NOT EXISTS idx_comments_creative ON creative_comments(creative_id);
