import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import Line from 'next-auth/providers/line'
import Resend from 'next-auth/providers/resend'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'

const authSecret =
  process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET

const providers = [
  process.env.LINE_CLIENT_ID && process.env.LINE_CLIENT_SECRET
    ? Line({
        clientId: process.env.LINE_CLIENT_ID,
        clientSecret: process.env.LINE_CLIENT_SECRET,
      })
    : null,
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? Google({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      })
    : null,
  process.env.RESEND_API_KEY
    ? Resend({
        apiKey: process.env.RESEND_API_KEY,
        from: process.env.EMAIL_FROM ?? 'onboarding@resend.dev',
      })
    : null,
].filter((p): p is NonNullable<typeof p> => p !== null)

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: authSecret,
  trustHost: true,
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'database' },
  providers,
  pages: {
    signIn: '/auth/signin',
    verifyRequest: '/auth/verify-request',
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
      }
      return session
    },
  },
})
