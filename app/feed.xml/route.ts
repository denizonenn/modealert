import { NextResponse } from "next/server";

import { getRecentFeedItems } from "@/lib/services/feed.service";
import { SITE_URL } from "@/lib/constants/site";

const FEED_ITEM_LIMIT = 50;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Real, already-recorded data only (see feed.service.ts) — every item
// is a real EventHistory occurrence or a real EventChange row, both
// with real timestamps. No summarizing, no invented copy.
export async function GET() {
  const items = await getRecentFeedItems(FEED_ITEM_LIMIT);

  const itemsXml = items
    .map(
      (item) => `
    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${escapeXml(SITE_URL + item.link)}</link>
      <guid isPermaLink="false">${escapeXml(item.guid)}</guid>
      <pubDate>${item.pubDate.toUTCString()}</pubDate>
      <description>${escapeXml(item.description)}</description>
    </item>`
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>ModeAlert — Event Updates</title>
    <link>${SITE_URL}</link>
    <description>Real-time game event and mode status changes tracked by ModeAlert.</description>
    <language>en-us</language>
    <atom:link xmlns:atom="http://www.w3.org/2005/Atom" href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />${itemsXml}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
