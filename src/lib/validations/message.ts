import { z } from 'zod';
import { phoneSchema } from './user';

// Message role enumeration
export const messageRoleSchema = z.enum(['user', 'assistant']);

// Message content schema
export const messageContentSchema = z.object({
  role: messageRoleSchema,
  content: z.string().min(1, 'Message content cannot be empty'),
});

// Metadata schema
export const messageMetadataSchema = z.object({
  user: phoneSchema, // Reuse existing phone validation from user schema
});

// Complete message payload schema
export const messagePayloadSchema = z.object({
  metadata: messageMetadataSchema,
  message: messageContentSchema,
});

// Type exports
export type MessageRole = z.infer<typeof messageRoleSchema>;
export type MessageContent = z.infer<typeof messageContentSchema>;
export type MessageMetadata = z.infer<typeof messageMetadataSchema>;
export type MessagePayload = z.infer<typeof messagePayloadSchema>;
