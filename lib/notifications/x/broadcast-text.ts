import type { ProviderEvent } from "@/lib/providers/core/provider";
import { EVENT_CATEGORIES } from "@/lib/constants/event-category";
import { EVENT_STATUS } from "@/lib/constants/event-status";

// Only a genuinely played, time-boxed mode going LIVE is worth a public
// post (Deniz's call, 2026-10-11): platform status, shop rotations,
// season passes and always-on permanent modes would turn the account
// into noise — and every post costs money on X's pay-per-use API.
export function shouldBroadcast(
  event: Pick<ProviderEvent, "status" | "category" | "isLimitedTime">,
  previous: { status: string } | null
): boolean {
  if (event.status !== EVENT_STATUS.LIVE) {
    return false;
  }

  if (!event.isLimitedTime) {
    return false;
  }

  if (event.category !== EVENT_CATEGORIES.PLAYABLE) {
    return false;
  }

  // Already LIVE last sync means nothing just started. A brand-new
  // event (no previous row) that arrives LIVE did just start.
  return previous?.status !== EVENT_STATUS.LIVE;
}

const MAX_TITLE_LENGTH = 100;
const MAX_HASHTAG_LENGTH = 20;

function hashtagFor(gameName: string): string | null {
  const tag = gameName.replace(/[^A-Za-z0-9]/g, "");

  return tag.length > 0 && tag.length <= MAX_HASHTAG_LENGTH
    ? `#${tag}`
    : null;
}

// Deliberately contains no URL or bare domain: X auto-links anything
// that looks like one (modealert.app included), and a post with a link
// costs ~13x more ($0.20 vs $0.015). The site lives in the bio instead.
export function buildBroadcastText(
  title: string,
  gameName: string
): string {
  const safeTitle =
    title.length > MAX_TITLE_LENGTH
      ? `${title.slice(0, MAX_TITLE_LENGTH - 1)}…`
      : title;

  const hashtag = hashtagFor(gameName);

  return [
    `🟢 ${safeTitle} is now live in ${gameName}!`,
    "Get an alert the next time it's back (link in bio).",
    hashtag,
  ]
    .filter(Boolean)
    .join("\n\n");
}
