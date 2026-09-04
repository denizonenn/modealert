import { randomBytes, createHash } from "crypto";

import {
  createApiKey,
  getApiKeyByHash,
  getAllApiKeys,
  getApiKeysByUser,
  touchApiKeyLastUsed,
  revokeApiKey,
} from "@/lib/repositories/api-key.repository";
import { countHitsSince } from "@/lib/repositories/rate-limit.repository";
import { getUserByEmail } from "@/lib/repositories/user.repository";
import { API_LIMIT, API_WINDOW_MS } from "@/lib/api/verify-api-key";

const KEY_PREFIX = "mdlrt_live_";
const PREFIX_DISPLAY_LENGTH = 12;

function hashKey(rawKey: string): string {
  return createHash("sha256").update(rawKey).digest("hex");
}

// The raw key is real entropy from crypto.randomBytes — unlike a
// user-chosen password, it needs no server-side pepper/salt to be
// unguessable, so a plain SHA-256 digest is enough to store safely
// while still allowing a fast, direct lookup by hash on every
// request (bcrypt is deliberately slow per-comparison, wrong tool
// here — see docs on ApiKey.keyHash in schema.prisma).
export const apiKeyService = {
  // Returns the raw key exactly once — the caller must show it to the
  // admin/user now, since only its hash is ever persisted.
  async create(userId: string, name: string) {
    const rawKey = `${KEY_PREFIX}${randomBytes(24).toString("hex")}`;
    const keyHash = hashKey(rawKey);
    const keyPrefix = rawKey.slice(0, PREFIX_DISPLAY_LENGTH);

    const record = await createApiKey(userId, name, keyHash, keyPrefix);

    return { rawKey, record };
  },

  async verify(rawKey: string) {
    if (!rawKey.startsWith(KEY_PREFIX)) {
      return null;
    }

    const key = await getApiKeyByHash(hashKey(rawKey));

    if (!key || key.revokedAt) {
      return null;
    }

    // Fire-and-forget — a slow/failed timestamp update should never
    // block or fail the actual request the key is authorizing.
    touchApiKeyLastUsed(key.id).catch(() => {});

    return key;
  },

  async listForUser(userId: string) {
    return getApiKeysByUser(userId);
  },

  async listAll() {
    return getAllApiKeys();
  },

  // Current-hour usage against the same fixed window verifyApiKey()
  // enforces — reads RateLimitHit without recording a hit, purely for
  // display (see docs/09_BACKLOG.md "Sellable API" → usage dashboard).
  async usageFor(keyId: string) {
    const windowStart = new Date(Date.now() - API_WINDOW_MS);
    const used = await countHitsSince(`apikey:${keyId}`, windowStart);

    return { used, limit: API_LIMIT };
  },

  // Manual-approval issuance path (see docs/09_BACKLOG.md "Sellable
  // API") — an admin creates a key for a known developer's account by
  // email; self-serve issuance can replace this once billing exists.
  async createForEmail(email: string, name: string) {
    const user = await getUserByEmail(email);

    if (!user) {
      return { error: "not_found" as const };
    }

    const { rawKey, record } = await apiKeyService.create(user.id, name);

    return { rawKey, record };
  },

  async revoke(id: string) {
    return revokeApiKey(id);
  },
};
