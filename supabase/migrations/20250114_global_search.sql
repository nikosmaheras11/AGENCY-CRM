-- Enable pg_trgm extension for fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create GIN indexes on assets table for fast trigram search
CREATE INDEX IF NOT EXISTS idx_assets_title_trgm ON assets USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_assets_description_trgm ON assets USING gin (description gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_assets_tags_trgm ON assets USING gin (tags gin_trgm_ops);

-- Create GIN indexes on requests table for searching requests
CREATE INDEX IF NOT EXISTS idx_requests_title_trgm ON requests USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_requests_description_trgm ON requests USING gin (description gin_trgm_ops);

-- Smart search function that searches across assets AND requests
CREATE OR REPLACE FUNCTION global_search(search_term text)
RETURNS TABLE (
  id uuid,
  entity_type text,
  title text,
  description text,
  thumbnail_url text,
  url text,
  created_at timestamptz,
  score float
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH asset_results AS (
    SELECT 
      a.id,
      'asset'::text AS entity_type,
      a.title,
      a.description,
      a.thumbnail_url,
      '/creative/asset/' || a.id::text AS url,
      a.created_at,
      GREATEST(
        similarity(a.title, search_term),
        similarity(COALESCE(a.description, ''), search_term),
        similarity(COALESCE(a.tags, ''), search_term)
      ) AS sim_score
    FROM assets a
    WHERE 
      a.title % search_term OR
      COALESCE(a.description, '') % search_term OR
      COALESCE(a.tags, '') % search_term
  ),
  request_results AS (
    SELECT 
      r.id,
      'request'::text AS entity_type,
      r.title,
      r.description,
      NULL::text AS thumbnail_url,
      '/creative/request/' || r.id::text AS url,
      r.created_at,
      GREATEST(
        similarity(r.title, search_term),
        similarity(COALESCE(r.description, ''), search_term)
      ) AS sim_score
    FROM requests r
    WHERE 
      r.title % search_term OR
      COALESCE(r.description, '') % search_term
  )
  SELECT * FROM (
    SELECT * FROM asset_results
    UNION ALL
    SELECT * FROM request_results
  ) combined
  WHERE sim_score > 0.1
  ORDER BY sim_score DESC
  LIMIT 50;
END;
$$;
