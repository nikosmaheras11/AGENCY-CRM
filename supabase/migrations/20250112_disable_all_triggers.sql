-- Disable user triggers on requests table (not system triggers)
ALTER TABLE requests DISABLE TRIGGER USER;

-- This disables: update_updated_at and any custom triggers
-- System triggers (foreign keys, etc.) remain active
