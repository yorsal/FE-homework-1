import { NextAuthOptions } from 'next-auth'

export const authOptions: NextAuthOptions = {
  providers: [
    {
      id: 'mock-oauth2',
      name: 'Mock OAuth2',
      type: 'oauth',
      authorization: {
        url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/authorize`,
        params: {
          scope: 'openid',
          response_type: 'code',
        },
      },
      token: {
        url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/token`,
        async request(context) {
          const { provider, params, checks } = context

          const tokenUrl = typeof provider.token === 'string' ? provider.token : provider.token?.url

          // Store the authorization code
          if (params.code) {
            await fetch(
              `${
                process.env.NEXTAUTH_URL || 'http://localhost:3000'
              }/api/auth/token?action=store_code&code=${params.code}`
            )
          }

          const response = await fetch(tokenUrl as string, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              grant_type: 'authorization_code',
              code: params.code,
              redirect_uri: provider.callbackUrl,
            }),
          })

          const tokens = await response.json()
          return { tokens }
        },
      },
      userinfo: {
        url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/user`,
        async request(context) {
          const userinfoUrl =
            typeof context.provider.userinfo === 'string'
              ? context.provider.userinfo
              : context.provider.userinfo?.url
          const response = await fetch(userinfoUrl as string, {
            headers: {
              Authorization: `Bearer ${context.tokens.access_token}`,
            },
          })
          return await response.json()
        },
      },
      clientId: 'mock-client-id',
      clientSecret: 'mock-client-secret',
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        }
      },
    },
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires: account.expires_at
            ? account.expires_at * 1000
            : Date.now() + 3600 * 1000,
          user,
        }
      }

      // Return previous token if the access token has not expired yet
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token
      }

      // Access token has expired, try to refresh it
      return refreshAccessToken(token)
    },
    async session({ session, token }) {
      session.user = token.user as any
      session.accessToken = token.accessToken as string
      session.error = token.error as string | undefined

      return session
    },
  },
  pages: {
    signIn: '/',
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key-change-in-production',
}

async function refreshAccessToken(token: any) {
  try {
    const url = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/token`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        refresh_token: token.refreshToken,
      }),
    })

    const refreshedTokens = await response.json()

    if (!response.ok) {
      throw refreshedTokens
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    }
  } catch (error) {
    console.error('Error refreshing access token:', error)

    return {
      ...token,
      error: 'RefreshAccessTokenError',
    }
  }
}
