import { v } from 'convex/values';
import { query } from './_generated/server';

// Get all users
export const getAllUsers = query({
  handler: async (ctx) => {
    return await ctx.db.query('users').order('desc').collect();
  },
});

// Get user by ID
export const getUserById = query({
  args: { id: v.id('users') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get all conversations with user details
export const getAllConversations = query({
  handler: async (ctx) => {
    const conversations = await ctx.db
      .query('conversations')
      .order('desc')
      .collect();

    return await Promise.all(
      conversations.map(async (conversation) => {
        const user = await ctx.db.get(conversation.userId);
        return {
          ...conversation,
          user,
        };
      })
    );
  },
});

// Get conversations by user
export const getConversationsByUser = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('conversations')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .order('desc')
      .collect();
  },
});

// Get conversation by ID
export const getConversationById = query({
  args: { id: v.id('conversations') },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.id);
    if (!conversation) return null;

    const user = await ctx.db.get(conversation.userId);
    return {
      ...conversation,
      user,
    };
  },
});

// Get messages by conversation with user details
export const getMessagesByConversation = query({
  args: { conversationId: v.id('conversations') },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query('messages')
      .withIndex('by_conversation', (q) =>
        q.eq('conversationId', args.conversationId)
      )
      .order('asc')
      .collect();

    return await Promise.all(
      messages.map(async (message) => {
        const user = await ctx.db.get(message.userId);
        const files = message.fileIds
          ? await Promise.all(message.fileIds.map((id) => ctx.db.get(id)))
          : [];
        return {
          ...message,
          user,
          files: files.filter(Boolean),
        };
      })
    );
  },
});

// Get all messages with conversation and user details
export const getAllMessages = query({
  handler: async (ctx) => {
    const messages = await ctx.db
      .query('messages')
      .order('desc')
      .collect();

    return await Promise.all(
      messages.map(async (message) => {
        const user = await ctx.db.get(message.userId);
        const conversation = await ctx.db.get(message.conversationId);
        const files = message.fileIds
          ? await Promise.all(message.fileIds.map((id) => ctx.db.get(id)))
          : [];
        return {
          ...message,
          user,
          conversation,
          files: files.filter(Boolean),
        };
      })
    );
  },
});

// Get all files with user and conversation details
export const getAllFiles = query({
  handler: async (ctx) => {
    const files = await ctx.db.query('files').order('desc').collect();

    return await Promise.all(
      files.map(async (file) => {
        const user = await ctx.db.get(file.userId);
        const conversation = await ctx.db.get(file.conversationId);
        return {
          ...file,
          user,
          conversation,
        };
      })
    );
  },
});

// Get files by user
export const getFilesByUser = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const files = await ctx.db
      .query('files')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .order('desc')
      .collect();

    return await Promise.all(
      files.map(async (file) => {
        const conversation = await ctx.db.get(file.conversationId);
        return {
          ...file,
          conversation,
        };
      })
    );
  },
});

// Dashboard stats
export const getDashboardStats = query({
  handler: async (ctx) => {
    const [users, conversations, messages, files] = await Promise.all([
      ctx.db.query('users').collect(),
      ctx.db.query('conversations').collect(),
      ctx.db.query('messages').collect(),
      ctx.db.query('files').collect(),
    ]);

    // Recent activity (last 7 days)
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentUsers = users.filter((u) => u.createdAt > weekAgo);
    const recentConversations = conversations.filter(
      (c) => c.createdAt > weekAgo
    );
    const recentMessages = messages.filter((m) => m.createdAt > weekAgo);

    return {
      totalUsers: users.length,
      totalConversations: conversations.length,
      totalMessages: messages.length,
      totalFiles: files.length,
      recentUsers: recentUsers.length,
      recentConversations: recentConversations.length,
      recentMessages: recentMessages.length,
    };
  },
});
