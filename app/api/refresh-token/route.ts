import { NextRequest, NextResponse } from 'next/server';
import { refreshAccessToken } from '../../actions/tokenActions';

export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = await request.json();

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token is required' },
        { status: 400 }
      );
    }

    const result = await refreshAccessToken(refreshToken);

    if (result.success && result.data) {
      return NextResponse.json(result.data);
    } else {
      return NextResponse.json(
        { error: result.error || 'Token refresh failed' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}