import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isPublicRoute =
        nextUrl.pathname === "/login" ||
        nextUrl.pathname === "/" ||
        nextUrl.pathname === "/register" ||
        nextUrl.pathname === "/forgot-password" ||
        nextUrl.pathname === "/reset-password" ||
        nextUrl.pathname === "/verify-otp" ||
        nextUrl.pathname === "/robots.txt" ||
        nextUrl.pathname === "/sitemap.xml" ||
        nextUrl.pathname.startsWith("/.well-known")
      const role = (auth?.user as { role?: string })?.role

      if (isPublicRoute) {
        if (isLoggedIn && (nextUrl.pathname === "/login" || nextUrl.pathname === "/" || nextUrl.pathname === "/register")) {
          if (role === "STUDENT") return Response.redirect(new URL("/student/dashboard", nextUrl))
          if (role === "LECTURER") return Response.redirect(new URL("/lecturer/dashboard", nextUrl))
          return Response.redirect(new URL("/admin/dashboard", nextUrl))
        }
        return true
      }

      if (!isLoggedIn) return false

      if (role === "STUDENT") {
        if (nextUrl.pathname.startsWith("/admin") || nextUrl.pathname.startsWith("/lecturer")) {
          return Response.redirect(new URL("/student/dashboard", nextUrl))
        }
      } else if (role === "LECTURER") {
        if (nextUrl.pathname.startsWith("/admin") || nextUrl.pathname.startsWith("/student")) {
          return Response.redirect(new URL("/lecturer/dashboard", nextUrl))
        }
      }

      return true
    },
    jwt({ token, user }) {
      if (user) {
        // @ts-expect-error role exists on our custom user object
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string
        session.user.id = token.sub || (token.id as string)
      }
      return session
    },
  },
  providers: [],
} satisfies NextAuthConfig
