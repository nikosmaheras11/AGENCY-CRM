-- Enable pg_trgm extension for fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create GIN indexes on requests table for fast trigram search
CREATE INDEX IF NOT EXISTS idx_requests_title_trgm ON requests USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_requests_description_trgm ON requests USING gin (description gin_trgm_ops);

-- Global search function for requests (ordered by most recent first)
CREATE OR REPLACE FUNCTION global_search(search_term text)
RETURNS TABLE (
  id uuid,
  entity_type text,
  title text,
  description text,
  thumbnail_url text,
  url text,
  project_type text,
  status text,
  created_at timestamptz,
  score real
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    'request'::text AS entity_type,
    r.title,
    r.description,
    r.thumbnail_url,
    '/creative/asset/' || r.id::text AS url,
    r.project_type,
    r.status,
    r.created_at,
    GREATEST(
      similarity(r.title, search_term),
      similarity(COALESCE(r.description, ''), search_term)
    ) AS sim_score
  FROM requests r
  WHERE 
    r.project_type = 'creative' AND
    (r.title % search_term OR COALESCE(r.description, '') % search_term)
  ORDER BY 
    r.created_at DESC, -- Most recent first
    sim_score DESC     -- Then by relevance
  LIMIT 50;
END;
$$;
