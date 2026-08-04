export function buildEmailHtml(
  title: string,
  message: string
): string {
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
            ${title}
          </h1>
          <p style="margin:0;color:#aaaaaa;font-size:14px;line-height:1.5;">
            ${message}
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding-top:16px;font-size:12px;color:#666666;">
          Bu e-postayı, takip listene eklediğin bir event güncellendiği için alıyorsun.
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
