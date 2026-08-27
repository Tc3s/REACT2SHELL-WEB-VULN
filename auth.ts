import NextAuth, { type DefaultSession } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { authConfig } from "./auth.config"
import { prisma } from "@/lib/prisma"

declare module "next-auth" {
  interface Session {
    user: {
      role: string
    } & DefaultSession["user"]
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        })
        if (!user) return null
        
        const passwordsMatch = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        )
        if (passwordsMatch) {
          return { id: user.id, email: user.email, role: user.role }
        }
        return null
      }
    })
  ],
})
