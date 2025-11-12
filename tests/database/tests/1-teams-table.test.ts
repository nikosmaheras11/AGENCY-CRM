import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

describe('Teams Table Schema and Constraints', () => {
  afterAll(async () => {
    // Cleanup: Remove any test data created
    await supabase.from('teams').delete().ilike('name', 'test_team_%');
  });

  test('should have teams table with correct schema', async () => {
    // Query information_schema to verify table exists and has correct columns
    const { data: columns, error } = await supabase.rpc('get_table_columns', {
      table_name: 'teams'
    });

    // Alternative query using raw SQL
    const { data: tableInfo } = await supabase
      .from('teams')
      .select('*')
      .limit(0);

    expect(error).toBeNull();
    expect(tableInfo).toBeDefined();
  });

  test('should verify teams table columns exist', async () => {
    // Verify we can query with expected columns
    const { data, error } = await supabase
      .from('teams')
      .select('id, name, description, created_at, updated_at')
      .limit(1);

    expect(error).toBeNull();
    expect(data).toBeDefined();
  });

  test('should enforce NOT NULL constraint on team name', async () => {
    const { data, error } = await supabase
      .from('teams')
      .insert({ name: null, description: 'Test team' })
      .select();

    expect(error).not.toBeNull();
    expect(error?.message).toContain('null');
  });

  test('should enforce UNIQUE constraint on team name', async () => {
    const uniqueName = `test_team_${Date.now()}`;

    // Insert first team
    const { error: insertError1 } = await supabase
      .from('teams')
      .insert({ name: uniqueName, description: 'First team' });

    expect(insertError1).toBeNull();

    // Try to insert duplicate team name
    const { error: insertError2 } = await supabase
      .from('teams')
      .insert({ name: uniqueName, description: 'Second team' });

    expect(insertError2).not.toBeNull();
    expect(insertError2?.message).toContain('duplicate');

    // Cleanup
    await supabase.from('teams').delete().eq('name', uniqueName);
  });

  test('should auto-generate UUID for id column', async () => {
    const testName = `test_team_${Date.now()}`;

    const { data, error } = await supabase
      .from('teams')
      .insert({ name: testName, description: 'UUID test' })
      .select('id');

    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    expect(data![0].id).toBeDefined();
    expect(typeof data![0].id).toBe('string');
    // UUID format validation
    expect(data![0].id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    );

    // Cleanup
    await supabase.from('teams').delete().eq('name', testName);
  });

  test('should auto-populate created_at and updated_at timestamps', async () => {
    const testName = `test_team_${Date.now()}`;

    const { data, error } = await supabase
      .from('teams')
      .insert({ name: testName, description: 'Timestamp test' })
      .select('created_at, updated_at');

    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    expect(data![0].created_at).toBeDefined();
    expect(data![0].updated_at).toBeDefined();
    expect(new Date(data![0].created_at).getTime()).toBeGreaterThan(0);
    expect(new Date(data![0].updated_at).getTime()).toBeGreaterThan(0);

    // Cleanup
    await supabase.from('teams').delete().eq('name', testName);
  });
});
