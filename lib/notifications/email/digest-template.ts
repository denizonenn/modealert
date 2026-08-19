function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export interface DigestEntry {
  title: string;
  gameName: string;
  status: string;
  url?: string;
}

// Real content only — every row is a currently-tracked event's actual
// status, nothing inferred or padded out to look busier than it is
// (an empty digest would just not be sent at all, see
// weekly-digest.service.ts).
export function buildDigestHtml(
  entries: DigestEntry[],
  unsubscribeUrl: string
): string {
  const safeUnsubscribeUrl = escapeHtml(unsubscribeUrl);

  const rows = entries
    .map((entry) => {
      // Same reasoning as the per-event alert's CTA: a digest you
      // can't click through from is a dead end. Falls back to plain
      // text when an event has no slug to link to.
      const titleCell = entry.url
        ? `<a href="${escapeHtml(entry.url)}" style="color:#ffffff;text-decoration:none;">${escapeHtml(entry.title)}</a>`
        : escapeHtml(entry.title);

      return `
        <tr>
          <td style="padding:10px 0;border-top:1px solid #222222;">
            <p style="margin:0;font-size:11px;text-transform:uppercase;letter-spacing:0.06em;color:#666666;">
              ${escapeHtml(entry.gameName)}
            </p>
            <p style="margin:2px 0 0;font-size:14px;color:#ffffff;">
              ${titleCell}
              <span style="color:#888888;font-size:12px;"> — ${escapeHtml(entry.status)}</span>
            </p>
          </td>
        </tr>`;
    })
    .join("");

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
            Weekly Digest
          </p>
          <h1 style="margin:0 0 4px;font-size:20px;">
            Your watchlist this week
          </h1>
          <p style="margin:0 0 8px;color:#aaaaaa;font-size:13px;">
            Real-time alerts still fire the moment something changes —
            this is just the current status of everything you're
            tracking, in one place.
          </p>
          <table style="width:100%;border-collapse:collapse;">
            ${rows}
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding-top:16px;font-size:12px;color:#666666;">
          You're getting this because you're tracking at least one event.
          <a href="${safeUnsubscribeUrl}" style="color:#666666;">Unsubscribe</a>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
