import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  // Users
  users: defineTable({
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.string(),
    avatarUrl: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index('by_email', ['email'])
    .index('by_phone', ['phone']),

  // Conversations
  conversations: defineTable({
    userId: v.id('users'),
    title: v.string(),
    createdAt: v.number(),
    lastMessageAt: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_last_message', ['lastMessageAt']),

  // Messages
  messages: defineTable({
    conversationId: v.id('conversations'),
    userId: v.id('users'),
    role: v.union(v.literal('user'), v.literal('assistant')),
    content: v.string(),
    fileIds: v.optional(v.array(v.id('files'))),
    createdAt: v.number(),
  })
    .index('by_conversation', ['conversationId'])
    .index('by_created_at', ['createdAt']),

  // Files
  files: defineTable({
    userId: v.id('users'),
    conversationId: v.id('conversations'),
    fileName: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
    storageId: v.string(),
    uploadedAt: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_conversation', ['conversationId']),
});
