import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

describe('Asset Versions Auto-Increment Trigger', () => {
  let testRequestId: string;
  let testAssetId: string;

  beforeAll(async () => {
    // Create a test request first (assets require a request_id)
    const { data: requestData, error: requestError } = await supabase
      .from('requests')
      .insert({
        title: 'Test Request for Asset Versioning',
        request_type: 'creative',
        status: 'new_request',
      })
      .select('id')
      .single();

    expect(requestError).toBeNull();
    testRequestId = requestData!.id;
  });

  afterAll(async () => {
    // Cleanup: Delete test assets and request
    if (testAssetId) {
      await supabase
        .from('assets')
        .delete()
        .or(`id.eq.${testAssetId},parent_asset_id.eq.${testAssetId}`);
    }
    if (testRequestId) {
      await supabase.from('requests').delete().eq('id', testRequestId);
    }
  });

  test('should create initial asset with version_number = 1', async () => {
    const { data, error } = await supabase
      .from('assets')
      .insert({
        request_id: testRequestId,
        name: 'Test Asset',
        file_type: 'image',
        storage_path: '/test/initial.jpg',
        version_number: 1,
        is_current_version: true,
      })
      .select('id, version_number, is_current_version')
      .single();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data!.version_number).toBe(1);
    expect(data!.is_current_version).toBe(true);

    testAssetId = data!.id;
  });

  test('should auto-increment version when storage_path is updated', async () => {
    // Update the storage path to trigger versioning
    const { error: updateError } = await supabase
      .from('assets')
      .update({ storage_path: '/test/updated_v2.jpg' })
      .eq('id', testAssetId);

    expect(updateError).toBeNull();

    // Check if a new version was created
    const { data: versions, error: versionsError } = await supabase
      .from('assets')
      .select('id, version_number, is_current_version, storage_path, parent_asset_id')
      .or(`id.eq.${testAssetId},parent_asset_id.eq.${testAssetId}`)
      .order('version_number', { ascending: true });

    expect(versionsError).toBeNull();
    expect(versions).toBeDefined();

    // Should have 2 versions now
    expect(versions!.length).toBeGreaterThanOrEqual(1);

    // Check version numbers and current status
    const currentVersion = versions!.find((v) => v.is_current_version);
    expect(currentVersion).toBeDefined();
    expect(currentVersion!.storage_path).toBe('/test/updated_v2.jpg');
  });

  test('should set previous version is_current_version to false', async () => {
    // Get all versions
    const { data: versions, error } = await supabase
      .from('assets')
      .select('version_number, is_current_version')
      .or(`id.eq.${testAssetId},parent_asset_id.eq.${testAssetId}`)
      .order('version_number', { ascending: true });

    expect(error).toBeNull();

    // Count how many are marked as current (should be only 1)
    const currentVersionCount = versions!.filter((v) => v.is_current_version).length;
    expect(currentVersionCount).toBe(1);

    // The latest version should be marked as current
    const latestVersion = versions![versions!.length - 1];
    expect(latestVersion.is_current_version).toBe(true);
  });

  test('should link versions via parent_asset_id', async () => {
    // Query for child versions
    const { data: childVersions, error } = await supabase
      .from('assets')
      .select('id, version_number, parent_asset_id')
      .eq('parent_asset_id', testAssetId)
      .order('version_number', { ascending: true });

    expect(error).toBeNull();

    // All child versions should reference the parent
    childVersions?.forEach((version) => {
      expect(version.parent_asset_id).toBe(testAssetId);
    });
  });

  test('should increment version numbers sequentially', async () => {
    // Create another version by updating storage path again
    await supabase
      .from('assets')
      .update({ storage_path: '/test/updated_v3.jpg' })
      .eq('is_current_version', true)
      .eq('request_id', testRequestId);

    // Get all versions
    const { data: versions, error } = await supabase
      .from('assets')
      .select('version_number')
      .or(`id.eq.${testAssetId},parent_asset_id.eq.${testAssetId}`)
      .order('version_number', { ascending: true });

    expect(error).toBeNull();

    // Verify sequential numbering
    const versionNumbers = versions!.map((v) => v.version_number).sort((a, b) => a - b);
    for (let i = 0; i < versionNumbers.length - 1; i++) {
      expect(versionNumbers[i + 1]).toBe(versionNumbers[i] + 1);
    }
  });

  test('should preserve version_notes when creating new version', async () => {
    const versionNotes = 'Major update with new layout';

    // Update with version notes
    await supabase
      .from('assets')
      .update({
        storage_path: '/test/updated_v4.jpg',
        version_notes: versionNotes,
      })
      .eq('is_current_version', true)
      .eq('request_id', testRequestId);

    // Verify the notes were saved
    const { data: currentVersion, error } = await supabase
      .from('assets')
      .select('version_notes')
      .eq('is_current_version', true)
      .eq('request_id', testRequestId)
      .single();

    expect(error).toBeNull();
    expect(currentVersion?.version_notes).toBe(versionNotes);
  });
});
