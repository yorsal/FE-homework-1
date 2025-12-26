import { NextRequest, NextResponse } from 'next/server'

// In-memory storage for tokens (in production, use a database)
const tokenStore = new Map<
  string,
  {
    accessToken: string
    refreshToken: string
    expiresAt: number
    userId: string
  }
>()

const codeStore = new Map<
  string,
  {
    code: string
    expiresAt: number
    used: boolean
  }
>()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { grant_type, code, refresh_token } = body

    if (grant_type === 'authorization_code') {
      // Exchange authorization code for tokens
      if (!code) {
        return NextResponse.json(
          { error: 'invalid_request', error_description: 'Missing code parameter' },
          { status: 400 }
        )
      }

      // Validate code (in a real app, check against database)
      const codeData = codeStore.get(code)
      if (!codeData || codeData.used || Date.now() > codeData.expiresAt) {
        return NextResponse.json(
          { error: 'invalid_grant', error_description: 'Invalid or expired authorization code' },
          { status: 400 }
        )
      }

      // Mark code as used
      codeData.used = true
      codeStore.set(code, codeData)

      // Generate tokens
      const accessToken = `access_token_${Date.now()}_${Math.random().toString(36).substring(7)}`
      const refreshToken = `refresh_token_${Date.now()}_${Math.random().toString(36).substring(7)}`
      const expiresIn = 3600 // 1 hour
      const expiresAt = Date.now() + expiresIn * 1000

      // Store tokens
      tokenStore.set(accessToken, {
        accessToken,
        refreshToken,
        expiresAt,
        userId: 'mock-user-123',
      })

      return NextResponse.json({
        access_token: accessToken,
        refresh_token: refreshToken,
        token_type: 'Bearer',
        expires_in: expiresIn,
        scope: 'openid',
      })
    } else if (grant_type === 'refresh_token') {
      // Refresh access token
      if (!refresh_token) {
        return NextResponse.json(
          { error: 'invalid_request', error_description: 'Missing refresh_token parameter' },
          { status: 400 }
        )
      }

      // Find the token by refresh token
      let oldTokenData: any = null
      for (const [key, value] of tokenStore.entries()) {
        if (value.refreshToken === refresh_token) {
          oldTokenData = value
          tokenStore.delete(key)
          break
        }
      }

      if (!oldTokenData) {
        return NextResponse.json(
          { error: 'invalid_grant', error_description: 'Invalid refresh token' },
          { status: 400 }
        )
      }

      // Generate new tokens
      const accessToken = `access_token_${Date.now()}_${Math.random().toString(36).substring(7)}`
      const newRefreshToken = `refresh_token_${Date.now()}_${Math.random()
        .toString(36)
        .substring(7)}`
      const expiresIn = 3600 // 1 hour
      const expiresAt = Date.now() + expiresIn * 1000

      // Store new tokens
      tokenStore.set(accessToken, {
        accessToken,
        refreshToken: newRefreshToken,
        expiresAt,
        userId: oldTokenData.userId,
      })

      return NextResponse.json({
        access_token: accessToken,
        refresh_token: newRefreshToken,
        token_type: 'Bearer',
        expires_in: expiresIn,
        scope: 'openid',
      })
    } else {
      return NextResponse.json(
        { error: 'unsupported_grant_type', error_description: 'Grant type not supported' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Token endpoint error:', error)
    return NextResponse.json(
      { error: 'server_error', error_description: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to store authorization code (called from authorize page)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const action = searchParams.get('action')

  if (action === 'store_code') {
    const code = searchParams.get('code')
    if (code) {
      codeStore.set(code, {
        code,
        expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
        used: false,
      })
      return NextResponse.json({ success: true })
    }
  }

  return NextResponse.json({ error: 'invalid_request' }, { status: 400 })
}

// Export token store for user endpoint
export { tokenStore }
