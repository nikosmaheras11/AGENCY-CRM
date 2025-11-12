import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

describe('Comments Table - Hierarchical Comments and Resolution Status', () => {
  let testRequestId: string;
  let testUserId: string;
  let parentCommentId: string;
  let childComment1Id: string;
  let childComment2Id: string;

  beforeAll(async () => {
    // Create a test user
    const testEmail = `test_comments_${Date.now()}@example.com`;
    const { data: userData } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: 'TestPassword123!',
      email_confirm: true,
    });
    testUserId = userData.user!.id;

    // Wait for profile creation
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Create a test request
    const { data: requestData } = await supabase
      .from('requests')
      .insert({
        title: 'Test Request for Comments',
        request_type: 'creative',
        status: 'new_request',
        created_by: testUserId,
      })
      .select('id')
      .single();

    testRequestId = requestData!.id;
  });

  afterAll(async () => {
    // Cleanup: Delete comments, request, and user
    if (testRequestId) {
      await supabase.from('comments').delete().eq('request_id', testRequestId);
      await supabase.from('requests').delete().eq('id', testRequestId);
    }
    if (testUserId) {
      await supabase.from('profiles').delete().eq('id', testUserId);
      await supabase.auth.admin.deleteUser(testUserId);
    }
  });

  test('should create a parent comment without parent_comment_id', async () => {
    const { data, error } = await supabase
      .from('comments')
      .insert({
        request_id: testRequestId,
        user_id: testUserId,
        content: 'This is a parent comment',
        is_resolved: false,
      })
      .select('id, parent_comment_id, is_resolved')
      .single();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data!.parent_comment_id).toBeNull();
    expect(data!.is_resolved).toBe(false);

    parentCommentId = data!.id;
  });

  test('should create child comments with parent_comment_id reference', async () => {
    // Create first reply
    const { data: reply1, error: error1 } = await supabase
      .from('comments')
      .insert({
        request_id: testRequestId,
        user_id: testUserId,
        content: 'This is a reply to the parent comment',
        parent_comment_id: parentCommentId,
        is_resolved: false,
      })
      .select('id, parent_comment_id')
      .single();

    expect(error1).toBeNull();
    expect(reply1!.parent_comment_id).toBe(parentCommentId);
    childComment1Id = reply1!.id;

    // Create second reply
    const { data: reply2, error: error2 } = await supabase
      .from('comments')
      .insert({
        request_id: testRequestId,
        user_id: testUserId,
        content: 'This is another reply to the parent comment',
        parent_comment_id: parentCommentId,
        is_resolved: false,
      })
      .select('id, parent_comment_id')
      .single();

    expect(error2).toBeNull();
    expect(reply2!.parent_comment_id).toBe(parentCommentId);
    childComment2Id = reply2!.id;
  });

  test('should query all replies to a parent comment', async () => {
    const { data: replies, error } = await supabase
      .from('comments')
      .select('id, content, parent_comment_id')
      .eq('parent_comment_id', parentCommentId)
      .order('created_at', { ascending: true });

    expect(error).toBeNull();
    expect(replies).toBeDefined();
    expect(replies!.length).toBeGreaterThanOrEqual(2);

    replies!.forEach((reply) => {
      expect(reply.parent_comment_id).toBe(parentCommentId);
    });
  });

  test('should allow nested replies (grandchild comments)', async () => {
    // Create a reply to a reply
    const { data, error } = await supabase
      .from('comments')
      .insert({
        request_id: testRequestId,
        user_id: testUserId,
        content: 'This is a reply to a reply (grandchild)',
        parent_comment_id: childComment1Id,
        is_resolved: false,
      })
      .select('id, parent_comment_id')
      .single();

    expect(error).toBeNull();
    expect(data!.parent_comment_id).toBe(childComment1Id);

    // Verify we can query this nested comment
    const { data: grandchild, error: queryError } = await supabase
      .from('comments')
      .select('*')
      .eq('parent_comment_id', childComment1Id)
      .single();

    expect(queryError).toBeNull();
    expect(grandchild).toBeDefined();
  });

  test('should mark comment as resolved', async () => {
    const { data, error } = await supabase
      .from('comments')
      .update({ is_resolved: true })
      .eq('id', parentCommentId)
      .select('is_resolved')
      .single();

    expect(error).toBeNull();
    expect(data!.is_resolved).toBe(true);
  });

  test('should mark comment as unresolved', async () => {
    // First mark as resolved
    await supabase
      .from('comments')
      .update({ is_resolved: true })
      .eq('id', childComment1Id);

    // Then mark as unresolved
    const { data, error } = await supabase
      .from('comments')
      .update({ is_resolved: false })
      .eq('id', childComment1Id)
      .select('is_resolved')
      .single();

    expect(error).toBeNull();
    expect(data!.is_resolved).toBe(false);
  });

  test('should query only resolved comments', async () => {
    // Mark some comments as resolved
    await supabase
      .from('comments')
      .update({ is_resolved: true })
      .in('id', [parentCommentId, childComment1Id]);

    // Query resolved comments
    const { data: resolvedComments, error } = await supabase
      .from('comments')
      .select('id, is_resolved')
      .eq('request_id', testRequestId)
      .eq('is_resolved', true);

    expect(error).toBeNull();
    expect(resolvedComments!.length).toBeGreaterThanOrEqual(2);

    resolvedComments!.forEach((comment) => {
      expect(comment.is_resolved).toBe(true);
    });
  });

  test('should query only unresolved comments', async () => {
    const { data: unresolvedComments, error } = await supabase
      .from('comments')
      .select('id, is_resolved')
      .eq('request_id', testRequestId)
      .eq('is_resolved', false);

    expect(error).toBeNull();

    unresolvedComments!.forEach((comment) => {
      expect(comment.is_resolved).toBe(false);
    });
  });

  test('should support positioned comments with coordinates', async () => {
    const { data, error } = await supabase
      .from('comments')
      .insert({
        request_id: testRequestId,
        user_id: testUserId,
        content: 'Positioned comment at specific coordinates',
        position_x: 150.5,
        position_y: 200.75,
        is_resolved: false,
      })
      .select('position_x, position_y')
      .single();

    expect(error).toBeNull();
    expect(data!.position_x).toBe(150.5);
    expect(data!.position_y).toBe(200.75);
  });

  test('should allow comments with optional asset_id', async () => {
    // Create a test asset first
    const { data: assetData } = await supabase
      .from('assets')
      .insert({
        request_id: testRequestId,
        name: 'Test Asset for Comments',
        file_type: 'image',
        storage_path: '/test/asset.jpg',
        version_number: 1,
        is_current_version: true,
      })
      .select('id')
      .single();

    // Create comment linked to asset
    const { data: commentData, error } = await supabase
      .from('comments')
      .insert({
        request_id: testRequestId,
        asset_id: assetData!.id,
        user_id: testUserId,
        content: 'Comment on specific asset',
        is_resolved: false,
      })
      .select('asset_id')
      .single();

    expect(error).toBeNull();
    expect(commentData!.asset_id).toBe(assetData!.id);

    // Cleanup asset
    await supabase.from('assets').delete().eq('id', assetData!.id);
  });

  test('should track created_at and updated_at timestamps', async () => {
    const beforeCreate = new Date();

    const { data: comment, error } = await supabase
      .from('comments')
      .insert({
        request_id: testRequestId,
        user_id: testUserId,
        content: 'Timestamp test comment',
        is_resolved: false,
      })
      .select('id, created_at, updated_at')
      .single();

    expect(error).toBeNull();
    expect(comment!.created_at).toBeDefined();
    expect(comment!.updated_at).toBeDefined();

    const createdAt = new Date(comment!.created_at);
    expect(createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());

    // Update the comment
    await new Promise((resolve) => setTimeout(resolve, 1000));

    await supabase
      .from('comments')
      .update({ content: 'Updated content' })
      .eq('id', comment!.id);

    const { data: updatedComment } = await supabase
      .from('comments')
      .select('created_at, updated_at')
      .eq('id', comment!.id)
      .single();

    const updatedAt = new Date(updatedComment!.updated_at);
    expect(updatedAt.getTime()).toBeGreaterThan(createdAt.getTime());
  });

  test('should build complete comment thread hierarchy', async () => {
    // Get all comments for the request
    const { data: allComments, error } = await supabase
      .from('comments')
      .select('id, content, parent_comment_id')
      .eq('request_id', testRequestId)
      .order('created_at', { ascending: true });

    expect(error).toBeNull();

    // Build a tree structure
    const commentMap = new Map();
    const rootComments: any[] = [];

    allComments!.forEach((comment) => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    allComments!.forEach((comment) => {
      if (comment.parent_comment_id) {
        const parent = commentMap.get(comment.parent_comment_id);
        if (parent) {
          parent.replies.push(commentMap.get(comment.id));
        }
      } else {
        rootComments.push(commentMap.get(comment.id));
      }
    });

    // Verify hierarchy
    expect(rootComments.length).toBeGreaterThan(0);
    const parentComment = rootComments.find((c) => c.id === parentCommentId);
    expect(parentComment).toBeDefined();
    expect(parentComment.replies.length).toBeGreaterThan(0);
  });
});
