-- Database Functions Validation Tests
-- Run with: supabase test db --db-url <your-connection-string>

BEGIN;

-- Test 1: Verify video_versions table exists and has correct structure
SELECT plan(10);

SELECT has_table('video_versions', 'video_versions table should exist');
SELECT has_column('video_versions', 'id', 'video_versions should have id column');
SELECT has_column('video_versions', 'request_id', 'video_versions should have request_id column');
SELECT has_column('video_versions', 'video_url', 'video_versions should have video_url column');
SELECT has_column('video_versions', 'version', 'video_versions should have version column');

-- Test 2: Verify timecode_comments table exists
SELECT has_table('timecode_comments', 'timecode_comments table should exist');
SELECT has_column('timecode_comments', 'id', 'timecode_comments should have id column');
SELECT has_column('timecode_comments', 'video_version_id', 'timecode_comments should have video_version_id column');
SELECT has_column('timecode_comments', 'timecode', 'timecode_comments should have timecode column');

-- Test 3: Verify user_mentions table exists
SELECT has_table('user_mentions', 'user_mentions table should exist');

SELECT * FROM finish();

ROLLBACK;
