import { NextRequest, NextResponse } from 'next/server'

// Mock user database
const mockUsers: Record<string, any> = {
  'mock-user-123': {
    id: 'mock-user-123',
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    created_at: '2024-01-01T00:00:00Z',
  },
}

export async function GET(request: NextRequest) {
  try {
    // Get access token from Authorization header
    const authHeader = request.headers.get('authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'unauthorized', error_description: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    const accessToken = authHeader.substring(7) // Remove 'Bearer ' prefix

    // Validate access token (in a real app, check against database and verify expiry)
    // For this mock, we'll accept any token that starts with 'access_token_'
    if (!accessToken.startsWith('access_token_')) {
      return NextResponse.json(
        { error: 'invalid_token', error_description: 'Invalid access token' },
        { status: 401 }
      )
    }

    // Return mock user data
    const user = mockUsers['mock-user-123']

    return NextResponse.json({
      sub: user.id,
      name: user.name,
      email: user.email,
      picture: user.avatar,
      email_verified: true,
      updated_at: user.created_at,
    })
  } catch (error) {
    console.error('User endpoint error:', error)
    return NextResponse.json(
      { error: 'server_error', error_description: 'Internal server error' },
      { status: 500 }
    )
  }
}
