import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Discord from "next-auth/providers/discord";
import Resend from "next-auth/providers/resend";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { PrismaAdapter } from "@auth/prisma-adapter";

import { prisma } from "@/lib/db/prisma";
import { env } from "@/lib/config/env";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";
import { analyticsService } from "@/lib/services/analytics.service";
import { ANALYTICS_EVENTS } from "@/lib/constants/analytics-events";

const LOCKOUT_THRESHOLD = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

// Per-account lockout (below) stops brute-forcing one email. This
// stops the other direction — one IP spraying many different emails,
// which the per-account lockout alone wouldn't catch.
const LOGIN_IP_LIMIT = 20;
const LOGIN_IP_WINDOW_MS = 15 * 60 * 1000;

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),

  trustHost: true,

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/signin",
    verifyRequest: "/signin/check-email",
  },

  providers: [
    ...(env.AUTH_GOOGLE_ID && env.AUTH_GOOGLE_SECRET
      ? [
          Google({
            clientId: env.AUTH_GOOGLE_ID,
            clientSecret: env.AUTH_GOOGLE_SECRET,
          }),
        ]
      : []),

    ...(env.AUTH_DISCORD_ID && env.AUTH_DISCORD_SECRET
      ? [
          Discord({
            clientId: env.AUTH_DISCORD_ID,
            clientSecret: env.AUTH_DISCORD_SECRET,
          }),
        ]
      : []),

    ...(env.RESEND_API_KEY
      ? [
          Resend({
            apiKey: env.RESEND_API_KEY,
            from: env.EMAIL_FROM,
          }),
        ]
      : []),

    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials, request) {
        const email =
          typeof credentials?.email === "string"
            ? credentials.email.toLowerCase().trim()
            : undefined;

        const password =
          typeof credentials?.password === "string"
            ? credentials.password
            : undefined;

        if (!email || !password) {
          return null;
        }

        const ip = getClientIp(request);

        const allowed = await checkRateLimit({
          key: `login:${ip}`,
          limit: LOGIN_IP_LIMIT,
          windowMs: LOGIN_IP_WINDOW_MS,
        });

        if (!allowed) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user?.password) {
          return null;
        }

        if (user.lockedUntil && user.lockedUntil > new Date()) {
          return null;
        }

        const valid = await bcrypt.compare(password, user.password);

        if (!valid) {
          const attempts = user.failedLoginAttempts + 1;

          await prisma.user.update({
            where: { id: user.id },
            data: {
              failedLoginAttempts: attempts,
              lockedUntil:
                attempts >= LOCKOUT_THRESHOLD
                  ? new Date(Date.now() + LOCKOUT_DURATION_MS)
                  : null,
            },
          });

          return null;
        }

        if (user.failedLoginAttempts > 0) {
          await prisma.user.update({
            where: { id: user.id },
            data: { failedLoginAttempts: 0, lockedUntil: null },
          });
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],

  callbacks: {
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
      }

      // Lets the client refresh the JWT after an in-place profile edit
      // (e.g. display name) via useSession().update(...) — otherwise
      // the JWT session strategy would keep serving the stale name
      // until the next full sign-in.
      if (trigger === "update" && session?.name) {
        token.name = session.name;
      }

      return token;
    },

    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }

      return session;
    },
  },

  events: {
    // Fires for adapter-backed sign-ups (Google, magic link). The
    // Credentials/password path doesn't go through the adapter at
    // all (see the provider's own note above), so that one is
    // tracked directly in /api/auth/register instead — together they
    // cover every real signup method.
    async createUser({ user }) {
      if (user.id) {
        await analyticsService.record(
          user.id,
          ANALYTICS_EVENTS.SIGNUP_COMPLETED
        );
      }
    },
  },
});
