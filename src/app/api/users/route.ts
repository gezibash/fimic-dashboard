import { ConvexHttpClient } from 'convex/browser';
import { type NextRequest, NextResponse } from 'next/server';
import { api } from '../../../../convex/_generated/api';

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL ?? '');

export async function GET(_request: NextRequest) {
  try {
    // Call Convex query to get all users
    const users = await client.query(api.queries.getAllUsers);

    return NextResponse.json({
      success: true,
      data: users,
    });
  } catch (_error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve users',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}
