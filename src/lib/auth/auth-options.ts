import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

// NextAuth config with credentials provider.
// Sessions are JWT-based (default) and stored in an httpOnly cookie.
//
// The credentials provider validates email+password against the User table.
// For admin accounts, the system requires email-based OTP verification
// (handled by the admin 2FA gate after NextAuth login succeeds).
// The login flow is:
//   1. User enters email + password → NextAuth validates → creates session
//   2. If admin, the admin 2FA gate sends an OTP to the admin's email
//   3. Admin enters the OTP → /api/auth/verify-otp validates → gate unlocks
//
// Non-admin users (seeker/employer) skip OTP entirely.

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required.");
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });

        if (!user) {
          throw new Error("Invalid email or password.");
        }

        if (user.status !== "active") {
          throw new Error("Account is " + user.status + ". Contact support.");
        }

        const passwordOk = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!passwordOk) {
          throw new Error("Invalid email or password.");
        }

        // Admin accounts require email OTP verification after login.
        // The OTP is handled by the admin 2FA gate (client-side),
        // not by NextAuth's authorize function.
        // NextAuth just validates email + password here.
        // The admin gate calls /api/auth/send-otp and /api/auth/verify-otp.

        // Audit the login
        await db.auditLog.create({
          data: {
            userId: user.id,
            action: "Signed in",
            target: user.email,
            type: "auth",
            status: "success",
          },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          title: user.title ?? undefined,
          avatarColor: user.avatarColor,
          initials: user.initials ?? undefined,
        } as any;
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 60, // 30 minutes — matches admin auto-lock
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
        token.title = (user as any).title;
        token.avatarColor = (user as any).avatarColor;
        token.initials = (user as any).initials;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).title = token.title;
        (session.user as any).avatarColor = token.avatarColor;
        (session.user as any).initials = token.initials;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
};

// Helper: extend the standard Session type
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      title?: string;
      avatarColor: string;
      initials?: string;
    };
  }
  interface User {
    role: string;
    title?: string;
    avatarColor: string;
    initials?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    title?: string;
    avatarColor: string;
    initials?: string;
  }
}
