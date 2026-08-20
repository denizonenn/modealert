// title/message come from ProviderEvent data (third-party game APIs —
// Riot, CommunityDragon, Bungie, etc.), not hardcoded app strings, so
// they're escaped before going into HTML — standard output encoding,
// not a response to any known exploit.
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

// Internal alerts to the admin inbox (provider down, etc) — same
// visual language as the user-facing template, no unsubscribe link
// since this isn't a per-user notification.
export function buildAdminAlertHtml(
  title: string,
  message: string
): string {
  const safeTitle = escapeHtml(title)
  const safeMessage = escapeHtml(message)

  return `<!doctype html>
<html>
  <body style="margin:0;padding:32px;background:#000;font-family:system-ui,sans-serif;color:#fff;">
    <table style="max-width:480px;margin:0 auto;width:100%;">
      <tr>
        <td style="padding-bottom:16px;font-weight:600;font-size:18px;">
          ModeAlert — Ops
        </td>
      </tr>
      <tr>
        <td style="background:#111111;border:1px solid #222222;border-radius:16px;padding:24px;">
          <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:#888888;">
            Admin Alert
          </p>
          <h1 style="margin:0 0 12px;font-size:20px;">
            ${safeTitle}
          </h1>
          <p style="margin:0;color:#aaaaaa;font-size:14px;line-height:1.5;">
            ${safeMessage}
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

// Sign-in magic link — was using Auth.js's built-in generic default
// template (plain "Sign in to modealert.vercel.app" text, no styling)
// while every other real email in this app (notification, digest,
// admin alert) has a branded template. Same visual language as the
// other three, no unsubscribe link since this isn't a per-user
// tracking notification. `url` is a one-time, expiring, HMAC-signed
// Auth.js token — safe to link directly, not user-controlled input,
// but still escaped for consistency with the rest of this file.
export function buildMagicLinkHtml(url: string): string {
  const safeUrl = escapeHtml(url)

  return `<!doctype html>
<html>
  <body style="margin:0;padding:32px;background:#000;font-family:system-ui,sans-serif;color:#fff;">
    <table style="max-width:480px;margin:0 auto;width:100%;">
      <tr>
        <td style="padding-bottom:16px;font-weight:600;font-size:18px;">
          ModeAlert
        </td>
      </tr>
      <tr>
        <td style="background:#111111;border:1px solid #222222;border-radius:16px;padding:24px;">
          <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:#888888;">
            Sign In
          </p>
          <h1 style="margin:0 0 12px;font-size:20px;">
            Your sign-in link
          </h1>
          <p style="margin:0 0 20px;color:#aaaaaa;font-size:14px;line-height:1.5;">
            Click below to sign in to ModeAlert. This link expires in
            24 hours and can only be used once.
          </p>
          <a href="${safeUrl}" style="display:inline-block;background:#ffffff;color:#000000;font-size:14px;font-weight:600;text-decoration:none;padding:10px 20px;border-radius:8px;">
            Sign in
          </a>
        </td>
      </tr>
      <tr>
        <td style="padding-top:16px;font-size:12px;color:#666666;">
          If you didn&apos;t request this, you can safely ignore this email.
        </td>
      </tr>
    </table>
  </body>
</html>`
}

// First email a new account ever gets, regardless of signup method
// (Google/Discord/magic-link via auth.ts's createUser event, or
// email+password via /api/auth/register) — same visual language as
// the other templates, points straight at onboarding since a
// brand-new account has no watchlist yet.
export function buildWelcomeEmailHtml(onboardingUrl: string): string {
  const safeUrl = escapeHtml(onboardingUrl)

  return `<!doctype html>
<html>
  <body style="margin:0;padding:32px;background:#000;font-family:system-ui,sans-serif;color:#fff;">
    <table style="max-width:480px;margin:0 auto;width:100%;">
      <tr>
        <td style="padding-bottom:16px;font-weight:600;font-size:18px;">
          ModeAlert
        </td>
      </tr>
      <tr>
        <td style="background:#111111;border:1px solid #222222;border-radius:16px;padding:24px;">
          <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:#888888;">
            Welcome
          </p>
          <h1 style="margin:0 0 12px;font-size:20px;">
            You&apos;re in.
          </h1>
          <p style="margin:0 0 20px;color:#aaaaaa;font-size:14px;line-height:1.5;">
            ModeAlert watches limited-time modes and events across 13
            games and emails you the moment one you care about goes
            live, ends, or changes. Pick your games and events to get
            your first alert.
          </p>
          <a href="${safeUrl}" style="display:inline-block;background:#ffffff;color:#000000;font-size:14px;font-weight:600;text-decoration:none;padding:10px 20px;border-radius:8px;">
            Set up your watchlist
          </a>
        </td>
      </tr>
      <tr>
        <td style="padding-top:16px;font-size:12px;color:#666666;">
          You&apos;re getting this email because you just created a
          ModeAlert account.
        </td>
      </tr>
    </table>
  </body>
</html>`
}

export function buildEmailHtml(
  title: string,
  message: string,
  unsubscribeUrl: string,
  eventUrl?: string
): string {
  const safeTitle = escapeHtml(title)
  const safeMessage = escapeHtml(message)
  const safeUnsubscribeUrl = escapeHtml(unsubscribeUrl)

  // Without this the alert is a dead end — it tells you something
  // changed but gives you nothing to click, so acting on it means
  // manually finding your way back to the site. Only rendered when
  // the event actually has a slug to link to.
  const ctaBlock = eventUrl
    ? `
          <a href="${escapeHtml(eventUrl)}" style="display:inline-block;margin-top:20px;background:#ffffff;color:#000000;font-size:14px;font-weight:600;text-decoration:none;padding:10px 20px;border-radius:8px;">
            View event
          </a>`
    : ""

  return `<!doctype html>
<html>
  <body style="margin:0;padding:32px;background:#000;font-family:system-ui,sans-serif;color:#fff;">
    <table style="max-width:480px;margin:0 auto;width:100%;">
      <tr>
        <td style="padding-bottom:16px;font-weight:600;font-size:18px;">
          ModeAlert
        </td>
      </tr>
      <tr>
        <td style="background:#111111;border:1px solid #222222;border-radius:16px;padding:24px;">
          <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:#888888;">
            Event Update
          </p>
          <h1 style="margin:0 0 12px;font-size:20px;">
            ${safeTitle}
          </h1>
          <p style="margin:0;color:#aaaaaa;font-size:14px;line-height:1.5;">
            ${safeMessage}
          </p>${ctaBlock}
        </td>
      </tr>
      <tr>
        <td style="padding-top:16px;font-size:12px;color:#666666;">
          You&apos;re getting this email because an event on your watchlist
          was updated.
          <a href="${safeUnsubscribeUrl}" style="color:#666666;">Unsubscribe</a>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
