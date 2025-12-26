import { DefaultSession, DefaultUser } from 'next-auth'
import { JWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
    } & DefaultSession['user']
    accessToken?: string
    error?: string
  }

  interface User extends DefaultUser {
    id: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string
    refreshToken?: string
    accessTokenExpires?: number
    error?: string
    user?: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}
