import { buildOAuth1Header, type OAuth1Credentials } from "./oauth1";

const CREATE_POST_URL = "https://api.x.com/2/tweets";
const REQUEST_TIMEOUT_MS = 10_000;

// Posts as the account the access token belongs to (@ModeAlertApp).
// Returns the new post's id. Throws on any non-2xx so the caller can
// log it — X's error body is included because it's the only place the
// real reason ("You are not permitted to perform this action" = token
// generated before Read+Write was enabled, credits exhausted, ...) shows.
export async function createPost(
  text: string,
  credentials: OAuth1Credentials
): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(CREATE_POST_URL, {
      method: "POST",
      headers: {
        // JSON body → not part of the OAuth signature (see oauth1.ts).
        Authorization: buildOAuth1Header("POST", CREATE_POST_URL, credentials),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");

      throw new Error(
        `X API returned HTTP ${response.status}: ${body.slice(0, 300)}`
      );
    }

    const json = (await response.json()) as { data?: { id?: string } };

    return json.data?.id ?? "";
  } finally {
    clearTimeout(timer);
  }
}
