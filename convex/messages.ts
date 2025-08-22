import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

// Create a new message
export const createMessage = mutation({
  args: {
    userPhone: v.string(),
    role: v.union(v.literal('user'), v.literal('assistant')),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const { userPhone, role, content } = args;

    // Find the user by phone number
    const user = await ctx.db
      .query('users')
      .withIndex('by_phone', (q) => q.eq('phone', userPhone))
      .first();

    if (!user) {
      throw new Error('User not found');
    }

    // Find or create a conversation for this user
    let conversation = await ctx.db
      .query('conversations')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .first();

    if (!conversation) {
      // Create a new conversation
      const conversationId = await ctx.db.insert('conversations', {
        userId: user._id,
        title: 'Chat Conversation',
        createdAt: Date.now(),
        lastMessageAt: Date.now(),
      });
      conversation = await ctx.db.get(conversationId);
    } else {
      // Update the last message timestamp
      await ctx.db.patch(conversation._id, {
        lastMessageAt: Date.now(),
      });
    }

    // Create the message
    const messageId = await ctx.db.insert('messages', {
      conversationId: conversation!._id,
      userId: user._id,
      role,
      content,
      createdAt: Date.now(),
    });

    // Return the created message
    const message = await ctx.db.get(messageId);
    return {
      message,
      conversation,
      user: {
        _id: user._id,
        name: user.name,
        phone: user.phone,
      },
    };
  },
});

// Get messages for a conversation
export const getMessagesByConversation = query({
  args: { conversationId: v.id('conversations') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('messages')
      .withIndex('by_conversation', (q) => q.eq('conversationId', args.conversationId))
      .order('asc')
      .collect();
  },
});

// Get messages for a user (by phone)
export const getMessagesByUserPhone = query({
  args: { userPhone: v.string() },
  handler: async (ctx, args) => {
    // Find the user by phone number
    const user = await ctx.db
      .query('users')
      .withIndex('by_phone', (q) => q.eq('phone', args.userPhone))
      .first();

    if (!user) {
      return [];
    }

    // Get all conversations for this user
    const conversations = await ctx.db
      .query('conversations')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .collect();

    // Get all messages for these conversations
    const allMessages = [];
    for (const conversation of conversations) {
      const messages = await ctx.db
        .query('messages')
        .withIndex('by_conversation', (q) => q.eq('conversationId', conversation._id))
        .order('asc')
        .collect();
      allMessages.push(...messages);
    }

    // Sort messages by creation time
    return allMessages.sort((a, b) => a.createdAt - b.createdAt);
  },
});