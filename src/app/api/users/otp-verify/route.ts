import { ConvexHttpClient } from 'convex/browser';
import type { NextRequest } from 'next/server';
import {
  createErrorResponse,
  createSuccessResponse,
  validateRequestBody,
} from '@/lib/utils';
import { otpVerificationSchema } from '@/lib/validations/user';
import { api } from '../../../../../convex/_generated/api';

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL ?? '');

export async function POST(request: NextRequest) {
  console.log('=== /api/users/otp-verify endpoint called ===');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Method:', request.method);
  console.log('URL:', request.url);
  console.log('Headers:', Object.fromEntries(request.headers.entries()));
  console.log('User-Agent:', request.headers.get('user-agent'));
  console.log('Content-Type:', request.headers.get('content-type'));
  console.log('Origin:', request.headers.get('origin') || 'No origin header');
  console.log('Referer:', request.headers.get('referer') || 'No referer');

  try {
    console.log('Attempting to parse JSON body...');
    const body = await request.json();
    console.log('Body successfully parsed');
    console.log('Received payload:', JSON.stringify(body, null, 2));
    console.log('Payload keys:', Object.keys(body));
    console.log('Payload size:', JSON.stringify(body).length, 'bytes');

    // Log individual fields before validation
    console.log('Raw phone value:', body.phone, 'Type:', typeof body.phone);
    console.log('Raw OTP value:', body.otp, 'Type:', typeof body.otp);
    console.log(
      'Raw timestamp value:',
      body.timestamp,
      'Type:',
      typeof body.timestamp
    );

    // Validate request body
    console.log('Starting validation with otpVerificationSchema...');
    const validation = validateRequestBody(otpVerificationSchema, body);
    console.log(
      'Validation result:',
      validation.success ? 'SUCCESS' : 'FAILED'
    );

    if (!validation.success) {
      console.log('❌ Validation failed!');
      console.log(
        'Validation errors:',
        JSON.stringify(validation.error.issues, null, 2)
      );
      console.log('First error message:', validation.error.issues[0]?.message);
      console.log('First error path:', validation.error.issues[0]?.path);
      return createErrorResponse(
        validation.error.issues[0]?.message || 'Invalid request data',
        'VALIDATION_ERROR',
        400
      );
    }

    console.log('✅ Validation passed!');
    const { phone, otp, timestamp } = validation.data;
    console.log('Validated data:', { phone, otp, timestamp });
    console.log(
      'Phone format check:',
      phone.startsWith('+41')
        ? 'Swiss'
        : phone.startsWith('+383')
          ? 'Kosovo'
          : 'Unknown'
    );
    console.log('OTP length:', otp.length, 'characters');
    console.log('Timestamp:', new Date(timestamp).toISOString());
    console.log(
      'Timestamp age:',
      Math.floor((Date.now() - timestamp) / 1000),
      'seconds ago'
    );

    // OTP verification logic: return false only for "4444", true for all others
    console.log('--- Starting OTP verification logic ---');
    console.log(`Checking if OTP "${otp}" equals "4444"...`);
    const isValid = otp !== '4444';
    console.log(
      `OTP verification result: ${isValid ? '✅ VALID' : '❌ INVALID'}`
    );

    // Query for user to get their name
    console.log('--- Looking up user by phone number ---');
    console.log('Querying Convex for user with phone:', phone);
    const user = await client.query(api.users.getUserByPhone, { phone });
    console.log(
      'User lookup result:',
      user ? `User found: ${user.name} (${user._id})` : 'No user found'
    );

    const response = {
      phone,
      otp,
      timestamp,
      valid: isValid,
      name: user?.name || null,
      userExists: !!user,
      user: user || null,
    };
    console.log('--- Preparing response ---');
    console.log('Response object:', JSON.stringify(response, null, 2));
    console.log('Response status: 200 OK');
    console.log('Response type: success');

    const finalResponse = createSuccessResponse(response);
    console.log('✅ Response sent successfully');
    return finalResponse;
  } catch (error) {
    console.error('❌ ERROR in /api/users/otp-verify:', error);
    console.error('Error type:', error?.constructor?.name);
    console.error(
      'Error message:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    console.error(
      'Error stack:',
      error instanceof Error ? error.stack : 'No stack trace'
    );

    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      console.log('🔴 JSON parsing error detected');
      console.log('Invalid JSON body received');
      return createErrorResponse(
        'Invalid JSON in request body',
        'INVALID_JSON',
        400
      );
    }

    console.log('🔴 Internal server error occurred');
    console.log('Returning 500 Internal Server Error');
    return createErrorResponse('Failed to verify OTP', 'INTERNAL_ERROR', 500);
  } finally {
    console.log('Request processing time:', new Date().toISOString());
    console.log('=== /api/users/otp-verify endpoint finished ===');
    console.log('─'.repeat(50) + '\n');
  }
}
