import { createHmac, timingSafeEqual } from "crypto";

import { env } from "@/lib/config/env";

export function createUnsubscribeToken(userId: string): string {
  return createHmac("sha256", env.AUTH_SECRET)
    .update(userId)
    .digest("hex");
}

export function verifyUnsubscribeToken(
  userId: string,
  token: string
): boolean {
  const expected = createUnsubscribeToken(userId);

  const expectedBuffer = Buffer.from(expected);
  const tokenBuffer = Buffer.from(token);

  if (expectedBuffer.length !== tokenBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, tokenBuffer);
}
