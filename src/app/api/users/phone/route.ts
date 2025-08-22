import { ConvexHttpClient } from 'convex/browser';
import { type NextRequest, NextResponse } from 'next/server';
import { api } from '../../../../../convex/_generated/api';

const PHONE_REGEX = /^(\+41[1-9]\d{8}|\+383[4-9]\d{7,8})$/;

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL ?? '');

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');

    // Validate phone parameter
    if (!phone) {
      return NextResponse.json(
        {
          success: false,
          error: 'Phone number parameter is required',
          code: 'MISSING_PHONE',
        },
        { status: 400 }
      );
    }

    // Phone format validation
    if (!PHONE_REGEX.test(phone)) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Invalid phone number format. Please use Swiss (+41XXXXXXXXX) or Kosovo (+383XXXXXXXX) format',
          code: 'INVALID_PHONE_FORMAT',
        },
        { status: 400 }
      );
    }

    // Call Convex query to find user by phone
    const user = await client.query(api.users.getUserByPhone, { phone });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
          code: 'USER_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (_error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve user',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}
