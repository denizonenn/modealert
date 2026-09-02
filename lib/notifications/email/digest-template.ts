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

export interface DigestFeedbackUrls {
  useful: string;
  notUseful: string;
}

// The label fields are the recipient's own translated copy, resolved
// by weekly-digest.service.ts — this stays a pure string builder with
// no request scope of its own.
export interface DigestLabels {
  eyebrow: string;
  title: string;
  intro: string;
  usefulQuestion: string;
  yes: string;
  no: string;
  footer: string;
  unsubscribe: string;
}

// Real content only — every row is a currently-tracked event's actual
// status, nothing inferred or padded out to look busier than it is
// (an empty digest would just not be sent at all, see
// weekly-digest.service.ts).
export function buildDigestHtml(
  entries: DigestEntry[],
  unsubscribeUrl: string,
  feedbackUrls: DigestFeedbackUrls,
  labels: DigestLabels
): string {
  const safeUnsubscribeUrl = escapeHtml(unsubscribeUrl);
  const safeUsefulUrl = escapeHtml(feedbackUrls.useful);
  const safeNotUsefulUrl = escapeHtml(feedbackUrls.notUseful);

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
            ${escapeHtml(labels.eyebrow)}
          </p>
          <h1 style="margin:0 0 4px;font-size:20px;">
            ${escapeHtml(labels.title)}
          </h1>
          <p style="margin:0 0 8px;color:#aaaaaa;font-size:13px;">
            ${escapeHtml(labels.intro)}
          </p>
          <table style="width:100%;border-collapse:collapse;">
            ${rows}
          </table>
          <p style="margin:20px 0 0;padding-top:16px;border-top:1px solid #222222;font-size:12px;color:#888888;">
            ${escapeHtml(labels.usefulQuestion)}
            <a href="${safeUsefulUrl}" style="color:#ffffff;margin-left:6px;">${escapeHtml(labels.yes)}</a>
            ·
            <a href="${safeNotUsefulUrl}" style="color:#ffffff;">${escapeHtml(labels.no)}</a>
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding-top:16px;font-size:12px;color:#666666;">
          ${escapeHtml(labels.footer)}
          <a href="${safeUnsubscribeUrl}" style="color:#666666;">${escapeHtml(labels.unsubscribe)}</a>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
