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

export function buildEmailHtml(
  title: string,
  message: string,
  unsubscribeUrl: string
): string {
  const safeTitle = escapeHtml(title)
  const safeMessage = escapeHtml(message)
  const safeUnsubscribeUrl = escapeHtml(unsubscribeUrl)

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
          </p>
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
