import fs from "node:fs";
import path from "node:path";

// Real key art, once Deniz adds it, lives here — one file per game slug.
// Drop e.g. `public/games/key-art/lol.jpg` (any of the extensions below)
// and it's picked up automatically, no code change needed.
const KEY_ART_DIR = path.join(process.cwd(), "public", "games", "key-art");
const KEY_ART_EXTENSIONS = ["jpg", "jpeg", "png", "webp"] as const;

/**
 * Looks for real key art on disk for a game slug. Returns null if none has
 * been added yet, so callers can fall back to a generated placeholder
 * instead of shipping a broken <img>.
 */
export function findGameKeyArt(slug: string): string | null {
  for (const ext of KEY_ART_EXTENSIONS) {
    const file = path.join(KEY_ART_DIR, `${slug}.${ext}`);
    if (fs.existsSync(file)) {
      return `/games/key-art/${slug}.${ext}`;
    }
  }
  return null;
}

/**
 * Generated stand-in art: a radial wash in the game's brand colour with its
 * short name watermarked large behind it. No external asset, no licensing
 * question — swap it for real key art via findGameKeyArt() above whenever
 * it's available.
 */
export function placeholderGameArt(shortName: string, color: string): string {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="900" height="1200" viewBox="0 0 900 1200">
      <defs>
        <radialGradient id="g" cx="50%" cy="30%" r="75%">
          <stop offset="0%" stop-color="${color}" stop-opacity="0.9" />
          <stop offset="100%" stop-color="${color}" stop-opacity="0.25" />
        </radialGradient>
      </defs>
      <rect width="900" height="1200" fill="#0a0a0a" />
      <rect width="900" height="1200" fill="url(#g)" />
      <text x="50%" y="58%" text-anchor="middle" font-family="Arial, sans-serif"
        font-weight="800" font-size="150" fill="#ffffff" fill-opacity="0.14">
        ${shortName}
      </text>
    </svg>
  `.trim();

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
