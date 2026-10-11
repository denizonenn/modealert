import { createHmac, randomBytes } from "node:crypto";

// OAuth 1.0a request signing (HMAC-SHA1), the user-context auth X
// requires for posting as a specific account (@ModeAlertApp). Written
// by hand instead of pulling in an OAuth/Twitter SDK: it's ~40 lines
// of RFC 5849, and keeping it a pure function means it's verified
// against X's own documented example signature in oauth1.test.ts.

export interface OAuth1Credentials {
  consumerKey: string;
  consumerSecret: string;
  accessToken: string;
  accessTokenSecret: string;
}

// RFC 3986 percent-encoding — stricter than encodeURIComponent, which
// leaves !*'() unescaped and would produce a signature X rejects.
export function percentEncode(value: string): string {
  return encodeURIComponent(value).replace(
    /[!*'()]/g,
    (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`
  );
}

export function buildOAuth1Header(
  method: string,
  url: string,
  credentials: OAuth1Credentials,
  // Query/form params that are part of the signature. A JSON request
  // body (X API v2's POST /2/tweets) is NOT signed — pass nothing.
  params: Record<string, string> = {},
  // Injectable only so the test can reproduce X's documented example;
  // real calls always get a fresh nonce and the current time.
  nonce: string = randomBytes(16).toString("hex"),
  timestamp: string = Math.floor(Date.now() / 1000).toString()
): string {
  const oauthParams: Record<string, string> = {
    oauth_consumer_key: credentials.consumerKey,
    oauth_nonce: nonce,
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: timestamp,
    oauth_token: credentials.accessToken,
    oauth_version: "1.0",
  };

  const parameterString = Object.entries({ ...params, ...oauthParams })
    .map(([key, value]) => [percentEncode(key), percentEncode(value)])
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  const baseString = [
    method.toUpperCase(),
    percentEncode(url),
    percentEncode(parameterString),
  ].join("&");

  const signingKey = `${percentEncode(
    credentials.consumerSecret
  )}&${percentEncode(credentials.accessTokenSecret)}`;

  const signature = createHmac("sha1", signingKey)
    .update(baseString)
    .digest("base64");

  const headerParams = { ...oauthParams, oauth_signature: signature };

  return (
    "OAuth " +
    Object.entries(headerParams)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(
        ([key, value]) => `${percentEncode(key)}="${percentEncode(value)}"`
      )
      .join(", ")
  );
}
