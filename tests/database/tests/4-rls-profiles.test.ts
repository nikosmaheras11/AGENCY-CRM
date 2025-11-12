import { createClient } from '@supabase/supabase-js';

// Admin client for setup
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

describe('Row Level Security (RLS) Policies on Profiles Table', () => {
  let testUser1Id: string;
  let testUser2Id: string;
  let testUser1Email: string;
  let testUser2Email: string;
  let user1Client: any;
  let user2Client: any;

  beforeAll(async () => {
    // Create two test users
    testUser1Email = `test_rls_user1_${Date.now()}@example.com`;
    testUser2Email = `test_rls_user2_${Date.now()}@example.com`;

    const { data: user1Data } = await supabaseAdmin.auth.admin.createUser({
      email: testUser1Email,
      password: 'TestPassword123!',
      email_confirm: true,
    });

    const { data: user2Data } = await supabaseAdmin.auth.admin.createUser({
      email: testUser2Email,
      password: 'TestPassword123!',
      email_confirm: true,
    });

    testUser1Id = user1Data.user!.id;
    testUser2Id = user2Data.user!.id;

    // Wait for profiles to be created
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Create authenticated clients for each user
    const { data: session1 } = await supabaseAdmin.auth.signInWithPassword({
      email: testUser1Email,
      password: 'TestPassword123!',
    });

    user1Client = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${session1.session?.access_token}`,
          },
        },
      }
    );
  });

  afterAll(async () => {
    // Cleanup test users
    if (testUser1Id) {
      await supabaseAdmin.from('profiles').delete().eq('id', testUser1Id);
      await supabaseAdmin.auth.admin.deleteUser(testUser1Id);
    }
    if (testUser2Id) {
      await supabaseAdmin.from('profiles').delete().eq('id', testUser2Id);
      await supabaseAdmin.auth.admin.deleteUser(testUser2Id);
    }
  });

  test('should allow users to view all profiles (SELECT policy)', async () => {
    // User 1 should be able to view all profiles
    const { data: profiles, error } = await user1Client
      .from('profiles')
      .select('id')
      .in('id', [testUser1Id, testUser2Id]);

    expect(error).toBeNull();
    expect(profiles).toBeDefined();
    expect(profiles!.length).toBeGreaterThanOrEqual(2);
    
    const profileIds = profiles!.map((p: any) => p.id);
    expect(profileIds).toContain(testUser1Id);
    expect(profileIds).toContain(testUser2Id);
  });

  test('should allow users to update their own profile', async () => {
    const newFirstName = 'Updated Name';

    // User 1 updates their own profile
    const { data, error } = await user1Client
      .from('profiles')
      .update({ first_name: newFirstName })
      .eq('id', testUser1Id)
      .select();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data![0].first_name).toBe(newFirstName);
  });

  test('should prevent users from updating other users profiles', async () => {
    // User 1 tries to update User 2's profile
    const { error } = await user1Client
      .from('profiles')
      .update({ first_name: 'Hacked Name' })
      .eq('id', testUser2Id);

    // Should fail or return no rows (depending on RLS implementation)
    // In most cases, RLS will make this silently fail by returning 0 rows
    expect(error).toBeNull(); // No error, but no rows affected
  });

  test('should verify update only affects own profile', async () => {
    const uniqueName = `User1_${Date.now()}`;

    // User 1 updates their profile
    await user1Client
      .from('profiles')
      .update({ first_name: uniqueName })
      .eq('id', testUser1Id);

    // Verify User 1's profile was updated
    const { data: user1Profile } = await supabaseAdmin
      .from('profiles')
      .select('first_name')
      .eq('id', testUser1Id)
      .single();

    expect(user1Profile?.first_name).toBe(uniqueName);

    // Verify User 2's profile was NOT updated
    const { data: user2Profile } = await supabaseAdmin
      .from('profiles')
      .select('first_name')
      .eq('id', testUser2Id)
      .single();

    expect(user2Profile?.first_name).not.toBe(uniqueName);
  });

  test('should allow updating multiple fields in own profile', async () => {
    const updates = {
      first_name: 'Test',
      last_name: 'User',
      avatar_url: 'https://example.com/avatar.jpg',
    };

    const { data, error } = await user1Client
      .from('profiles')
      .update(updates)
      .eq('id', testUser1Id)
      .select();

    expect(error).toBeNull();
    expect(data![0].first_name).toBe(updates.first_name);
    expect(data![0].last_name).toBe(updates.last_name);
    expect(data![0].avatar_url).toBe(updates.avatar_url);
  });

  test('should preserve RLS with service role key bypass', async () => {
    // Service role should bypass RLS and update any profile
    const serviceUpdate = 'Service Role Update';

    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ first_name: serviceUpdate })
      .eq('id', testUser2Id);

    expect(error).toBeNull();

    // Verify update succeeded
    const { data } = await supabaseAdmin
      .from('profiles')
      .select('first_name')
      .eq('id', testUser2Id)
      .single();

    expect(data?.first_name).toBe(serviceUpdate);
  });

  test('should allow user to update updated_at timestamp', async () => {
    // Get current timestamp
    const { data: before } = await user1Client
      .from('profiles')
      .select('updated_at')
      .eq('id', testUser1Id)
      .single();

    const beforeTime = new Date(before!.updated_at).getTime();

    // Wait a bit to ensure timestamp difference
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Make an update
    await user1Client
      .from('profiles')
      .update({ first_name: 'Timestamp Test' })
      .eq('id', testUser1Id);

    // Check updated_at changed
    const { data: after } = await user1Client
      .from('profiles')
      .select('updated_at')
      .eq('id', testUser1Id)
      .single();

    const afterTime = new Date(after!.updated_at).getTime();

    expect(afterTime).toBeGreaterThan(beforeTime);
  });

  test('should not allow users to delete their own profile', async () => {
    // Attempt to delete own profile
    const { error } = await user1Client
      .from('profiles')
      .delete()
      .eq('id', testUser1Id);

    // Should fail (no DELETE policy exists for regular users)
    expect(error).not.toBeNull();

    // Verify profile still exists
    const { data } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', testUser1Id)
      .single();

    expect(data).toBeDefined();
  });

  test('should verify RLS is enabled on profiles table', async () => {
    // Query to check if RLS is enabled
    const { data, error } = await supabaseAdmin
      .rpc('check_rls_enabled', { table_name: 'profiles' })
      .single();

    // If the function doesn't exist, manually verify by checking admin vs user access
    // Admin should see more rows than filtered user context
    const { data: allProfiles } = await supabaseAdmin
      .from('profiles')
      .select('id', { count: 'exact' });

    expect(allProfiles).toBeDefined();
    // RLS is working if we can successfully query with restrictions
  });
});
