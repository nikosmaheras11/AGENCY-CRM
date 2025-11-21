-- Add budget columns to creatives table
ALTER TABLE creatives 
ADD COLUMN IF NOT EXISTS daily_budget DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS total_budget DECIMAL(10,2);
