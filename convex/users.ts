import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

// Swiss and Kosovo phone number validation regex
// Swiss format: +41 followed by 9 digits
// Kosovo format: +383 followed by 8-9 digits
const PHONE_REGEX = /^(\+41[1-9]\d{8}|\+383[4-9]\d{7,8})$/;

// Email validation regex (optional, only if provided)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Query to get user by phone number
export const getUserByPhone = query({
  args: { phone: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('users')
      .withIndex('by_phone', (q) => q.eq('phone', args.phone))
      .first();
  },
});

// Mutation to register a new user
export const registerUser = mutation({
  args: {
    name: v.string(),
    phone: v.string(),
    email: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { name, phone, email, avatarUrl } = args;

    // Validate phone number format
    if (!PHONE_REGEX.test(phone)) {
      throw new Error(
        'Invalid phone number format. Please use Swiss (+41XXXXXXXXX) or Kosovo (+383XXXXXXXX) format'
      );
    }

    // Check if phone number already exists
    const existingUserByPhone = await ctx.db
      .query('users')
      .withIndex('by_phone', (q) => q.eq('phone', phone))
      .first();

    if (existingUserByPhone) {
      throw new Error('Phone number already registered');
    }

    // Validate email format if provided
    if (email && !EMAIL_REGEX.test(email)) {
      throw new Error('Invalid email format');
    }

    // Check if email already exists (if provided)
    if (email) {
      const existingUserByEmail = await ctx.db
        .query('users')
        .withIndex('by_email', (q) => q.eq('email', email))
        .first();

      if (existingUserByEmail) {
        throw new Error('Email already registered');
      }
    }

    // Validate name is not empty
    if (!name.trim()) {
      throw new Error('Name cannot be empty');
    }

    // Create the user
    const userId = await ctx.db.insert('users', {
      name: name.trim(),
      phone,
      email: email || undefined,
      avatarUrl: avatarUrl || undefined,
      createdAt: Date.now(),
    });

    // Return the created user
    return await ctx.db.get(userId);
  },
});

// Mutation to update user profile
export const updateUser = mutation({
  args: {
    userId: v.id('users'),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, name, email, avatarUrl } = args;

    // Check if user exists
    const existingUser = await ctx.db.get(userId);
    if (!existingUser) {
      throw new Error('User not found');
    }

    // Prepare update object
    const updates: any = {};

    // Validate and update name if provided
    if (name !== undefined) {
      if (!name.trim()) {
        throw new Error('Name cannot be empty');
      }
      updates.name = name.trim();
    }

    // Validate and update email if provided
    if (email !== undefined) {
      if (email && !EMAIL_REGEX.test(email)) {
        throw new Error('Invalid email format');
      }

      // Check if email is already taken by another user
      if (email) {
        const existingUserByEmail = await ctx.db
          .query('users')
          .withIndex('by_email', (q) => q.eq('email', email))
          .first();

        if (existingUserByEmail && existingUserByEmail._id !== userId) {
          throw new Error('Email already registered by another user');
        }
      }

      updates.email = email || undefined;
    }

    // Update avatar URL if provided
    if (avatarUrl !== undefined) {
      updates.avatarUrl = avatarUrl || undefined;
    }

    // Perform the update
    await ctx.db.patch(userId, updates);

    // Return the updated user
    return await ctx.db.get(userId);
  },
});

// Mutation to delete a user and all related data
export const deleteUser = mutation({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const { userId } = args;

    // Check if user exists
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Get all conversations by this user
    const conversations = await ctx.db
      .query('conversations')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .collect();

    const deletedCounts = {
      conversations: 0,
      messages: 0,
      files: 0,
    };

    // Delete all related data for each conversation
    for (const conversation of conversations) {
      // Get and delete all messages in this conversation
      const messages = await ctx.db
        .query('messages')
        .withIndex('by_conversation', (q) =>
          q.eq('conversationId', conversation._id)
        )
        .collect();

      for (const message of messages) {
        await ctx.db.delete(message._id);
      }
      deletedCounts.messages += messages.length;

      // Get and delete all files in this conversation
      const files = await ctx.db
        .query('files')
        .withIndex('by_conversation', (q) =>
          q.eq('conversationId', conversation._id)
        )
        .collect();

      for (const file of files) {
        await ctx.db.delete(file._id);
      }
      deletedCounts.files += files.length;

      // Delete the conversation
      await ctx.db.delete(conversation._id);
      deletedCounts.conversations++;
    }

    // Delete any remaining files by this user that might not be in conversations
    const remainingFiles = await ctx.db
      .query('files')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .collect();

    for (const file of remainingFiles) {
      await ctx.db.delete(file._id);
    }
    deletedCounts.files += remainingFiles.length;

    // Finally, delete the user
    await ctx.db.delete(userId);

    return {
      success: true,
      deletedUser: {
        id: userId,
        name: user.name,
        phone: user.phone,
        email: user.email,
      },
      deletedCounts,
    };
  },
});
