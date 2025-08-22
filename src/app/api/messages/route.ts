import { ConvexHttpClient } from 'convex/browser';
import type { NextRequest } from 'next/server';
import {
  createErrorResponse,
  createSuccessResponse,
  validateRequestBody,
} from '@/lib/utils';
import { messagePayloadSchema } from '@/lib/validations/message';
import { api } from '../../../../convex/_generated/api';

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL ?? '');

function handleMessageError(error: unknown) {
  if (error instanceof Error && error.message.includes('User not found')) {
    return createErrorResponse('User not found', 'USER_NOT_FOUND', 404);
  }

  return createErrorResponse('Internal server error', 'INTERNAL_ERROR', 500);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body with Zod
    const validation = validateRequestBody(messagePayloadSchema, body);
    if (!validation.success) {
      const firstError = validation.error.issues[0];
      let errorCode = 'VALIDATION_ERROR';

      if (firstError.path.includes('user')) {
        errorCode = 'INVALID_PHONE_FORMAT';
      } else if (firstError.path.includes('role')) {
        errorCode = 'INVALID_MESSAGE_ROLE';
      } else if (firstError.path.includes('content')) {
        errorCode = 'INVALID_MESSAGE_CONTENT';
      }

      return createErrorResponse(firstError.message, errorCode, 400);
    }

    const { metadata, message } = validation.data;

    // Call Convex mutation to store the message
    const result = await client.mutation(api.messages.createMessage, {
      userPhone: metadata.user,
      role: message.role,
      content: message.content,
    });

    return createSuccessResponse(result);
  } catch (error) {
    return handleMessageError(error);
  }
}
