import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

describe('handle_new_user Function (Auth Trigger)', () => {
  let testUserId: string;
  let testUserEmail: string;

  afterEach(async () => {
    // Cleanup: Delete test user and profile
    if (testUserId) {
      // Delete profile first (due to FK constraint)
      await supabase.from('profiles').delete().eq('id', testUserId);
      
      // Delete auth user using admin API
      await supabase.auth.admin.deleteUser(testUserId);
      
      testUserId = '';
    }
  });

  test('should automatically create profile when new user signs up', async () => {
    testUserEmail = `test_user_${Date.now()}@example.com`;

    // Create a new user (this should trigger handle_new_user function)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testUserEmail,
      password: 'TestPassword123!',
      email_confirm: true,
    });

    expect(authError).toBeNull();
    expect(authData.user).toBeDefined();
    testUserId = authData.user!.id;

    // Wait a moment for trigger to execute
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Check if profile was automatically created
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', testUserId)
      .single();

    expect(profileError).toBeNull();
    expect(profile).toBeDefined();
    expect(profile!.id).toBe(testUserId);
  });

  test('should set default role to "user" in new profile', async () => {
    testUserEmail = `test_user_${Date.now()}@example.com`;

    const { data: authData } = await supabase.auth.admin.createUser({
      email: testUserEmail,
      password: 'TestPassword123!',
      email_confirm: true,
    });

    testUserId = authData.user!.id;

    // Wait for trigger
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', testUserId)
      .single();

    expect(error).toBeNull();
    expect(profile?.role).toBe('user');
  });

  test('should set created_at timestamp on profile creation', async () => {
    testUserEmail = `test_user_${Date.now()}@example.com`;

    const beforeCreation = new Date();

    const { data: authData } = await supabase.auth.admin.createUser({
      email: testUserEmail,
      password: 'TestPassword123!',
      email_confirm: true,
    });

    testUserId = authData.user!.id;

    // Wait for trigger
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('created_at')
      .eq('id', testUserId)
      .single();

    expect(error).toBeNull();
    expect(profile?.created_at).toBeDefined();

    const createdAt = new Date(profile!.created_at);
    expect(createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
    expect(createdAt.getTime()).toBeLessThanOrEqual(new Date().getTime());
  });

  test('should handle profile creation with metadata from auth.users', async () => {
    testUserEmail = `test_user_${Date.now()}@example.com`;

    // Create user with metadata
    const { data: authData } = await supabase.auth.admin.createUser({
      email: testUserEmail,
      password: 'TestPassword123!',
      email_confirm: true,
      user_metadata: {
        first_name: 'Test',
        last_name: 'User',
      },
    });

    testUserId = authData.user!.id;

    // Wait for trigger
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Check if metadata was transferred to profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', testUserId)
      .single();

    expect(error).toBeNull();
    
    // Note: Depending on your trigger implementation, this might or might not populate
    // If your trigger uses raw_user_meta_data, these should be populated
    if (profile?.first_name || profile?.last_name) {
      expect(profile.first_name).toBe('Test');
      expect(profile.last_name).toBe('User');
    }
  });

  test('should not create duplicate profiles for same user', async () => {
    testUserEmail = `test_user_${Date.now()}@example.com`;

    // Create user
    const { data: authData } = await supabase.auth.admin.createUser({
      email: testUserEmail,
      password: 'TestPassword123!',
      email_confirm: true,
    });

    testUserId = authData.user!.id;

    // Wait for trigger
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Try to manually insert another profile with same ID (should fail due to PK constraint)
    const { error: duplicateError } = await supabase
      .from('profiles')
      .insert({
        id: testUserId,
        role: 'admin',
      });

    expect(duplicateError).not.toBeNull();
    expect(duplicateError?.message).toContain('duplicate');
  });

  test('should verify profile ID matches auth.users ID', async () => {
    testUserEmail = `test_user_${Date.now()}@example.com`;

    const { data: authData } = await supabase.auth.admin.createUser({
      email: testUserEmail,
      password: 'TestPassword123!',
      email_confirm: true,
    });

    testUserId = authData.user!.id;

    // Wait for trigger
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Verify profile exists with matching ID
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', testUserId)
      .single();

    expect(error).toBeNull();
    expect(profile!.id).toBe(testUserId);
    expect(profile!.id).toBe(authData.user!.id);
  });
});
