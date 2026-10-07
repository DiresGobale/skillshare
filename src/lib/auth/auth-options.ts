import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authenticator } from "otplib";
import { db } from "@/lib/db";

// NextAuth config with credentials provider.
// Sessions are JWT-based (default) and stored in an httpOnly cookie
// named "next-auth.session-token" (or "__Secure-..." in production).
//
// The credentials provider validates email+password against the User table,
// then checks if 2FA is required. If yes, the caller must include a valid
// `totp` field. We signal "2FA required" by returning null + a hint in the
// error field.

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        totp: { label: "2FA code", type: "text" },
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

        // 2FA check (admin role has 2FA enabled by default)
        if (user.twoFactorEnabled && user.twoFactorSecretHash) {
          if (!credentials.totp) {
            // Signal that 2FA is required — frontend will redirect to 2FA page
            throw new Error("2FA_REQUIRED");
          }
          // Use a wider window (5 windows = accepts codes from -150s to +150s)
          // to account for network latency, clock drift, and manual entry time
          const totpOk = authenticator.verify({
            token: credentials.totp,
            secret: user.twoFactorSecretHash,
            window: 5,
          });
          if (!totpOk) {
            throw new Error("Invalid 2FA code.");
          }
        }

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
