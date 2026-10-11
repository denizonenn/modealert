import { describe, expect, it } from "vitest";

import { buildOAuth1Header, percentEncode } from "./oauth1";

// X's own worked example from "Creating a signature"
// (developer.x.com, OAuth 1.0a docs) — if this matches, the signing
// algorithm is byte-for-byte what X's servers compute.
const EXAMPLE = {
  credentials: {
    consumerKey: "xvz1evFS4wEEPTGEFPHBog",
    consumerSecret: "kAcSOqF21Fu85e7zjz7ZN2U4ZRhfV3WpwPAoE3Z7kBw",
    accessToken: "370773112-GmHxMAgYyLbNEtIKZeRNFsMKPR9EyMZeS9weJAEb",
    accessTokenSecret: "LswwdoUaIvS8ltyTt5jkRh4J50vUPVVHtR2YPi5kE",
  },
  nonce: "kYjzVBB8Y0ZFabxSWbWovY3uYSQ2pTgmZeNu2VS4cg",
  timestamp: "1318622958",
  url: "https://api.twitter.com/1.1/statuses/update.json",
  params: {
    include_entities: "true",
    status: "Hello Ladies + Gentlemen, a signed OAuth request!",
  },
  signature: "hCtSmYh+iHYCEqBWrE7C7hYmtUk=",
};

describe("buildOAuth1Header", () => {
  it("reproduces X's documented example signature", () => {
    const header = buildOAuth1Header(
      "POST",
      EXAMPLE.url,
      EXAMPLE.credentials,
      EXAMPLE.params,
      EXAMPLE.nonce,
      EXAMPLE.timestamp
    );

    expect(header).toContain(
      `oauth_signature="${percentEncode(EXAMPLE.signature)}"`
    );
    expect(header.startsWith("OAuth ")).toBe(true);
    expect(header).toContain(
      `oauth_token="${EXAMPLE.credentials.accessToken}"`
    );
  });

  it("produces a different nonce on every real call", () => {
    const a = buildOAuth1Header("POST", EXAMPLE.url, EXAMPLE.credentials);
    const b = buildOAuth1Header("POST", EXAMPLE.url, EXAMPLE.credentials);

    expect(a).not.toBe(b);
  });
});

describe("percentEncode", () => {
  it("escapes the characters encodeURIComponent leaves alone", () => {
    expect(percentEncode("a!b*c'd(e)")).toBe("a%21b%2Ac%27d%28e%29");
    expect(percentEncode("Ladies + Gentlemen")).toBe(
      "Ladies%20%2B%20Gentlemen"
    );
  });
});
