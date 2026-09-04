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
import { isLockedOut, nextLockedUntil } from "@/lib/auth/lockout";
import { analyticsService } from "@/lib/services/analytics.service";
import { ANALYTICS_EVENTS } from "@/lib/constants/analytics-events";
import { buildMagicLinkHtml } from "@/lib/notifications/email/template";
import { sendWelcomeEmail } from "@/lib/notifications/email/welcome";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { getDictionaryFor } from "@/lib/i18n/load-dictionary";

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
            // Auth.js's built-in Resend provider sends a generic,
            // unbranded default template ("Sign in to
            // modealert.vercel.app", plain text styling) — every
            // other real email this app sends (notification, digest,
            // admin alert) has a branded template, this was the one
            // gap. Same Resend API call the built-in provider makes,
            // just with our own subject/HTML.
            async sendVerificationRequest({ identifier, url, provider }) {
              // No signed-in user yet (that's the whole point of this
              // link), so there's no User.locale to read — fall back
              // to the browsing-language cookie the site was already
              // showing this visitor.
              const locale = await getRequestLocale();
              const dict = await getDictionaryFor(locale);
              const t = dict.magicLinkEmail;

              const response = await fetch(
                "https://api.resend.com/emails",
                {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${provider.apiKey}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    from: provider.from,
                    to: identifier,
                    subject: t.subject,
                    html: buildMagicLinkHtml(url, {
                      eyebrow: t.eyebrow,
                      title: t.title,
                      intro: t.intro,
                      cta: t.cta,
                      footer: t.footer,
                    }),
                    text: `${t.subject}: ${url}\n\n${t.intro}`,
                  }),
                }
              );

              if (!response.ok) {
                throw new Error(
                  `Resend error: ${JSON.stringify(await response.json())}`
                );
              }
            },
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

        if (isLockedOut(user.lockedUntil)) {
          return null;
        }

        const valid = await bcrypt.compare(password, user.password);

        if (!valid) {
          // Atomic increment, not read-then-write: bcrypt.compare
          // alone (~100-300ms at this cost factor) opens a wide
          // window for concurrent wrong-password attempts to all
          // read the same pre-increment count and all compute the
          // same "+1" — under real concurrency (not just sequential
          // guesses) the lockout counter could silently never reach
          // LOCKOUT_THRESHOLD no matter how many real attempts
          // happened, bypassing the per-account lockout entirely.
          // `{ increment: 1 }` compiles to an atomic SQL UPDATE, so
          // every concurrent attempt gets a genuinely distinct
          // post-increment count back.
          const updated = await prisma.user.update({
            where: { id: user.id },
            data: {
              failedLoginAttempts: { increment: 1 },
            },
          });

          await prisma.user.update({
            where: { id: user.id },
            data: {
              lockedUntil: nextLockedUntil(
                updated.failedLoginAttempts,
                LOCKOUT_THRESHOLD,
                LOCKOUT_DURATION_MS
              ),
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

      if (user.email) {
        // Best-effort — a failed welcome email should never block or
        // undo an already-created account.
        try {
          await sendWelcomeEmail(user.email);
        } catch (error) {
          console.error("Failed to send welcome email", error);
        }
      }
    },
  },
});
