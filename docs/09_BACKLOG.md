# 09 - Product Backlog

> Living roadmap for ModeAlert.
>
> Every feature starts here before implementation.
> Completed items are moved to the Done section.
>
> Priority:
>
> - P0 = Critical
> - P1 = High
> - P2 = Nice to have
> - P3 = Future

---

# CURRENT MILESTONE

Current Goal:

> Build the first production-ready version capable of detecting Riot game events automatically and notifying users.

Target:

- MVP Release

Status:

🟢 Live in production (2026-08-04) — https://modealert.vercel.app
(feature/landing-page-v2 branch, auto-deploys on push)

Next milestone: real auth (Phase 7) — ✅ landed (2026-08-05), see
"P2 — User Accounts" and docs/06_DECISIONS.md ADR-005. Following
milestone: Phase 8 (Premium/monetization), now unblocked since real
per-user identity exists.

---

# P0 — Core Infrastructure

## Provider Architecture

Status: ✅

- Generic Provider interface
- Riot Provider
- CommunityDragon Provider
- Provider Registry
- Provider Executor

---

## Repository Layer

Status: ✅

- Event Repository
- Game Repository
- Notification Repository
- Watchlist Repository
- Event History Repository

---

## Service Layer

Status: ✅

- Event Service
- Sync Service
- Provider Sync
- Event Change Detector
- Event Change Handler
- Notification Trigger

---

## Prisma

Status: ✅

- schema
- migrations
- seed

---

# P0 — Riot Integration

## Riot Local Client

Status: 🟡

Scope: Kişiselleştirme amaçlı (bkz. docs/06_DECISIONS.md ADR-001).
Event keşfi LCU üzerinden YAPILMAZ.

Completed

- connect to LCU
- authentication
- gameflow endpoint
- current summoner

Remaining

- endpoint mapping (kişiselleştirme endpoint'leri için)
- current game context extraction
- polling abstraction

---

## Riot API

Status: 🟢

Completed

- Champion Rotation
- Platform Status
- **Valorant provider** (`lib/providers/valorant/`) — platform status +
  aktif act/episode tespiti, `eu.api.riotgames.com`. DB'de doğrulandı.

Future

- Clash
- Ranked data
- TFT
- LoR

---

# P0 — CommunityDragon

Status: 🟢

Completed

- queues
- maps
- game modes
- event hub (gerçek `EventProvider` olarak bağlandı, DB'ye senkronize
  oluyor — bkz. docs/06_DECISIONS.md ADR-001/ADR-002)
- PBE patchline desteği (`/live` sayfasında live vs pbe karşılaştırması)
- **PBE aday event senkronizasyonu** — **tamamlandı (2026-08-06).**
  ADR-001'in planlayıp hiç uygulamadığı parça: PBE'de olup live'da
  olmayan event-hub girdileri artık ayrı bir provider'la
  (`communitydragon-pbe`) gerçekten DB'ye senkronize oluyor, `(PBE
  Preview)` etiketiyle — onboarding/dashboard'da normal bir event
  gibi track edilebiliyor. Bkz. ADR-017.

Remaining

- ~~rotating modes~~ — **çözüldü (2026-08-13, ADR-037), önceki
  çözülemedi kararları geçersiz.** `queues.json`/event-hub.json'un
  gerçekten "şu an aktif mi" bilgisi yoktu (ADR-017/ADR-020/ADR-023
  hepsi doğruydu, bu iki dosya için) — ama araştırma yanlış yere
  bakıyordu. Gerçek sinyal `clientconfig.rpg.riotgames.com`'da
  (Riot'un client'ın giriş öncesi kullandığı, key gerektirmeyen config
  servisi) duruyormuş: `queueConfigs[].isEnabled`/`isVisibleInClient`,
  bölge bazında, gerçek zamanlı. `lib/providers/lol-client-config/`
  artık URF/Pick URF/Arena/Bravery Arena/Arena 3x6'yı bununla gerçek
  canlı sinyalle takip ediyor. Detay ve sevkiyat öncesi yakalanan
  ciddi bir bölge-parametresi hatası için ADR-037'ye bak.
- ~~arena metadata (cherry-lobby.json henüz kullanılmıyor)~~ —
  **artık geçersiz not (2026-08-18'de fark edildi).** `cherry-lobby
  .json`'da hiç tarih/aktiflik alanı yok (aynı URF sorunu, bkz.
  ADR-037'nin bulduğu gerçek çözüm) — Arena zaten
  `lib/providers/lol-client-config/` üzerinden gerçek canlı sinyalle
  takip ediliyor. Bu not ADR-037'den sonra silinmesi gerekirken
  unutulmuş.
- ~~event-passes.json entegrasyonu~~ — **artık geçersiz not.** Pass
  pencereleri (Mayhem/URF/Arena progression track, League Classic)
  zaten CommunityDragon normalizer'ında `SEASON_PASS` kategorisiyle
  senkronize ediliyor (ADR-023/ADR-026).

---

# P0 — Notification Engine

Status: 🟡

Completed

- Provider abstraction (`NotificationProvider` — recipient/event/previous
  alır)
- Per-recipient dispatch (`notificationTriggerService` her watchlist
  kaydı için ayrı ayrı gönderiyor, tek provider-level çağrı değil)
- Notification DB kaydı (daha önce hiç yazılmıyordu — her gönderim artık
  `Notification` tablosuna işleniyor, `read` durumu, `channel` ayrımıyla)
- **Email provider** (Resend, `lib/notifications/email/`) — HTML + text,
  `RESEND_API_KEY` yoksa otomatik disabled olur, pipeline'ı bozmaz.
  Uçtan uca doğrulandı (gerçek event değişikliği → console + DB kaydı).
  Gerçek e-posta gönderimi için Deniz'in resend.com'da hesap açıp key
  vermesi gerekiyor (bkz. docs/06_DECISIONS.md).
- Console provider (ops/debug amaçlı, kalıcı)

Need

- Notification Queue
- Notification Scheduler (şu an sadece cron sync tetikliyor)
- Notification Rate Limiter
- ~~Unsubscribe mekanizması~~ — **çözüldü (2026-08-05).** `/signin`
  "Unsubscribe anytime" diyordu ama gerçek bir mekanizma yoktu.
  `User.emailOptOut` + HMAC tabanlı, DB'de ayrı token tablosu
  gerektirmeyen imzasız link (`/api/unsubscribe`), her e-postanın
  altında. Bkz. docs/06_DECISIONS.md ADR-007.
- ~~Retry Policy (tek deneme, başarısızlık sadece loglanıyor)~~ —
  **tamamlandı (2026-08-05 retry, 2026-08-06 kalıcı kayıt).**
  `notification-trigger.service.ts` her gönderimi 3 deneme, artan
  gecikmeyle (500ms/1s) yapıyor (artık `lib/utils/retry.ts` paylaşılan
  helper'ı üzerinden — kendi kopyası değil). 3 deneme de başarısız
  olursa artık `NotificationFailure` tablosuna kalıcı kayıt düşüyor
  (Vercel log'larının aksine kaybolmuyor), `/statistics`'te gerçek bir
  success rate'e dönüşüyor. Hâlâ yapılmayan (bilinçli, trafik hacmine
  göre erken optimizasyon olurdu): ayrı bir queue/worker altyapısı,
  başarısızlık için otomatik alarm/bildirim.

Future — bilinçli olarak ertelendi

- **Discord** — Türkiye'de erişim sorunu var, en sona bırakıldı
  (Deniz'in isteği)
- Telegram
- Push

---

# P0 — Event Engine

Status: 🟡

Completed (bkz. docs/06_DECISIONS.md ADR-002)

- Event comparison (yeni/güncellenen — `eventChangeDetectorService`)
- Detect new event
- Detect updated event
- Detect removed event (`source`'a göre scoped expiry — bir provider'ın
  artık raporlamadığı event otomatik ENDED olur)
- Historical tracking (LIVE/TRACKING → history start, ENDED → history
  finish)
- **Event descriptions** — **eklendi (2026-08-06).** `Event.description`
  alanı ve tüm 10 provider'da gerçek, uydurulmamış açıklama üretimi.
  Onboarding/`/games/[slug]`/dashboard'da gösteriliyor. Bkz. ADR-018.

Remaining

- Predict expiration (Phase 5 — Prediction Engine kapsamına ertelendi)
- Confidence score (Phase 5)

---

# P0 — Onboarding

Status: 🟢

Completed (2026-08-04)

- Was the site's main broken CTA: every "Start Tracking" button led
  to a static placeholder page. Now a real 3-step flow: Games →
  Events → Finish.
- Fixed a real bug found while wiring it up: `GameSelector` called
  `gameService.getAllGames()` (Prisma) directly from a `"use client"`
  component — would have crashed the moment it rendered. Switched to
  the `useGames()` hook.
- Finish step creates real Watchlist rows via `/api/watchlists`,
  redirects to `/dashboard`.
- The old 4th step ("Create your account") was removed rather than
  faked — there's no auth system yet, so it's out until Phase 7.

Remaining

- Nothing blocking. Revisit once auth exists to add a real account
  step and per-user identity instead of the "demo" user.

---

# P0 — Dashboard

Status: 🟢

Completed (2026-08-04)

- Live statistics (Watching / Live Now / Next Event — scoped to the
  real watchlist, not global event count)
- "Your Watchlist" (only watched events) + "All Events" (browse/add)
  sections, grouped by status (Live/Upcoming/Tracking/Ended)
- Real add/remove watchlist toggle (star button), optimistic UI
- Corporate-quality visual pass: real fonts (was accidentally
  rendering in browser-default serif — see docs/06_DECISIONS.md),
  gradient accent system, skeleton loading states

Done (2026-08-05)

- ~~Notification history view~~ — `/dashboard/notifications` added
  (All/Unread filter, mark read/mark all read, reuses the existing
  `NotificationItem`/`EmptyState` components). Linked via a "See all
  notifications" footer in the navbar bell dropdown
  (`notification-center.tsx`).

- ~~Sync health / provider status page~~ — public `/status` page added
  (`hooks/use-provider-health.ts`, 60s auto-refresh), linked from the
  footer. `/api/providers/health` existed with zero consumers before
  this — another instance of the "written but not connected" pattern,
  this time backend-only.

- ~~`/live` only showed League of Legends~~ — added an "All Games —
  Live Status" section (`components/live/all-games-status.tsx`) above
  the existing LoL-specific PBE early-signal deep dive, grouping every
  tracked event by game with its LIVE/UPCOMING/TRACKING status badge.
  Reuses `useEvents()` (already existed, already used by
  dashboard/onboarding) — no new API route needed.

- ~~Marketing copy across the site said "Fortnite" as one of the three
  live-supported games~~ — Fortnite has no working provider (empty
  `crawler/*/get-events.ts`, placeholder `Game` row only). Swapped to
  Destiny 2 (the game that's actually real) across FAQ, hero, landing
  sections, OG image, and every page's meta description. Same class
  of fix as the earlier "hourly" → "daily" correction — false claims
  in indexed/shared content are worse than in throwaway UI text.

- ~~Destiny 2's icon fell back to an unsized emoji span~~ — added
  `SiBungie` (react-icons/si has an official Bungie mark) to
  `GAME_BRAND_ICONS`, matching every other game. Also hardened the
  emoji fallback itself (`game-icon.tsx`) to scale with the `size`
  prop, so the same bug can't silently recur for the next game added
  without a mapped icon.

- Follow-up caught while fixing the above: `/games` still showed
  Fortnite with fabricated stats ("150K players tracking", "6
  supported events") even after the copy elsewhere was corrected to
  say "3 real games" — self-contradictory. Added
  `GAMES_WITH_PROVIDER` (`lib/constants/games.ts`, derived from
  `GAME_IDS`) as the single source of truth for "has a real provider."
  `GameCard` now shows "Tracking coming soon" instead of fake numbers
  for games without one; onboarding's `GameSelector` filters them out
  entirely so users can't pick a game, reach the event-selection step,
  and hit an empty list with no path forward.

- ~~Homepage "ModeAlert Dashboard" preview widget hardcoded URF as
  LIVE~~ and ~~`Game.activeUsers` ("players tracking") was a
  hand-written marketing number from the seed~~ — both fixed
  (2026-08-05), see docs/06_DECISIONS.md ADR-007. Homepage now shows
  real synced events and real watchlist-derived counts; homepage
  Games teaser trimmed to only real-provider games (Fortnite still
  shown on the full `/games` page).

- ~~No account settings page — signed-in users couldn't manage
  anything~~ — **done (2026-08-05).** `/dashboard/settings`: set/change
  password (works for OAuth-only accounts too), toggle email
  notifications (same `emailOptOut` flag the unsubscribe link uses),
  delete account. Deleting required adding `onDelete: Cascade` to
  `Watchlist.user`/`Notification.user` (only `Account`/`Session` had
  it before) — without it, deleting a user with any watchlist activity
  would have failed on a foreign-key constraint. Verified end-to-end
  including the cascade actually removing a real watchlist row.

---

# P1 — SEO & Discoverability

Status: 🟢 (2026-08-05)

Completed

- Per-page metadata (title template, description, OpenGraph, Twitter
  card) for every route via `app/layout.tsx` + per-segment `layout.tsx`
  files (needed because most pages are `"use client"` and can't export
  `metadata` directly).
- `/features` and `/games` are now real indexable pages instead of
  `#features`/`#games` anchors on the homepage — those broke entirely
  when clicked from any other page (`href="#features"` on `/dashboard`
  just appends the hash to the current URL). Navbar now links to the
  real routes; `/#faq` fixed the same way for the FAQ anchor, which
  stays on the homepage.
- `app/robots.ts` + `app/sitemap.ts` — public marketing pages allowed,
  `/dashboard`, `/onboarding`, `/signin`, `/api` disallowed and
  `noindex`'d (they're user-specific or utility pages, not content).
- `app/opengraph-image.tsx` — dynamic OG image (`next/og`) so links
  shared in Discord/Twitter/Slack get a real preview card instead of
  nothing.
- JSON-LD structured data on the homepage: `Organization`,
  `SoftwareApplication`, and `FAQPage` (the last one can earn rich
  FAQ snippets directly in Google search results).
- Navbar nav links were plain `<a>` tags (full page reload on every
  click); switched to `next/link` for client-side navigation.
- Fixed a pre-existing accuracy bug found while rewriting this copy:
  landing page copy claimed "hourly" detection in three places
  (Features card, How It Works, FAQ) — sync actually runs once a day
  (Vercel Hobby cron limit, see docs/06_DECISIONS.md ADR-002). Copy
  now says "daily". Shipping a false claim into machine-readable
  FAQPage structured data would have made it worse, not just cosmetic.

Future

- Per-game landing pages (`/games/league-of-legends`, etc.) if organic
  search volume ever justifies the extra maintenance surface.

Done (2026-08-18)

- ~~Real custom favicon / app icon (currently the default Next.js
  one)~~ — `app/favicon.ico` was confirmed to still be create-next-app's
  default (exact stock file size). Replaced with `app/icon.tsx` +
  `app/apple-icon.tsx` (Next's code-generated icon convention, same
  `next/og` `ImageResponse` approach `opengraph-image.tsx` already
  used) — reuses the real navbar brand mark (white rounded square,
  black bell, `components/layout/navbar.tsx`) instead of inventing a
  new design. Old static `favicon.ico` deleted so there's one source of
  truth. Also caught and fixed while verifying with a real
  `npm run build`: the nested `graphify/` tool (gitignored, not part of
  ModeAlert) was still inside `tsconfig.json`'s default `**/*.ts`
  include, breaking local production builds on its own broken test
  fixtures — added to `tsconfig.json`'s `exclude`. Same build also
  caught `opengraph-image.tsx`'s hardcoded "League of Legends ·
  Valorant · Destiny 2 · TFT" line — same stale-game-list bug as above,
  fixed to `${GAMES_WITH_PROVIDER.size} games, one inbox`.

- ~~Stale "4 games" copy in indexed/shared content~~ — found while
  looking for the next task: the game count grew to 11 real providers
  (PUBG/PlanetSide 2 added 2026-08-13) but `app/layout.tsx`'s default
  meta description, the homepage `Organization` JSON-LD, `/games` and
  `/live` meta descriptions, the FAQ's "Which games are supported?"
  answer (also shipped into `FAQPage` JSON-LD), and `HowItWorks`'s
  step-1 copy still said "League of Legends, Valorant, Destiny 2, and
  Teamfight Tactics" — same false-claim-in-indexed-content class as the
  "hourly" → "daily" fix (P1 SEO) and the Fortnite-swap fix (P0
  Dashboard). All six now read `GAMES_WITH_PROVIDER.size` instead of a
  hardcoded number, so this can't silently go stale again the next time
  a game is added.

---

# P1 — Watchlists

Status: 🟢

Completed

- Users can follow individual Events (star toggle on dashboard,
  also created during onboarding finish step)
- Real DB persistence (`/api/watchlists`), optimistic updates

Done (2026-08-18, ADR-051)

- ~~Follow by Game/Queue/Champion (currently only Event-level)~~ —
  Game-level done, Premium-only. New `GameWatchlist` table (separate
  from `Watchlist`, not a nullable `eventId` on it — keeps the free
  per-event limit counter well-defined). `notification-trigger.service.ts`
  now merges event-level and game-level followers (deduped) when
  picking recipients. `FollowGameButton` on `/games/[slug]`
  (sign-in/premium-gated), "Following (whole game)" strip on the
  dashboard. Queue/Champion granularity not pursued — no real,
  event-independent "trackable unit" exists at that level (queue data
  already lives inside events, not a separate entity).

Future

- Custom filters

---

# P1 — Event Categories

Status: 🟢 (2026-08-12)

Completed

- **`Event.category`** — every event now tagged as one of `PLAYABLE`,
  `SEASON_PASS`, `ROTATION_MILESTONE`, `COSMETIC_SHOP`,
  `PLATFORM_STATUS` (`lib/constants/event-category.ts`). Fixes Deniz's
  complaint that the tracked-events list was cluttered with "dummy"
  entries (Platform Status, Champion Rotation) nobody actually plays,
  drowning out real events.
- A single `categorySortKey(category, statusPriority)` helper drives
  sorting everywhere events are listed (onboarding, dashboard,
  homepage, `/games/[slug]`) — category dominates the sort, so a real
  played event that has ended still outranks a live infrastructure
  row. This is also how URF/Arena/Mayhem is surfaced again after being
  fully hidden by ADR-020 — see ADR-023.
- Onboarding's event-selection step now has a category filter (5
  cards, each with example event names) instead of one flat list.
- Category badges added to event cards on onboarding, dashboard, and
  `/games/[slug]`.

- ~~`lib/providers/rotating-modes/provider.ts` URF/Arena placeholders~~
  — **superseded 2026-08-13, ADR-037.** The static `ENDED`-by-default
  URF/Arena rows (ADR-024, then ADR-036's Arena correction) were
  ModeAlert's best available answer for years — genuinely no signal
  existed. That changed: found `clientconfig.rpg.riotgames.com`,
  Riot's own unauthenticated, keyless client-config service (the one
  the League Client itself queries pre-login), which exposes real,
  per-region, live `isEnabled`/`isVisibleInClient` flags per queue id
  — literally the "is this queue open right now" signal that ADR-017
  through ADR-036 all concluded didn't exist anywhere. New provider
  `lib/providers/lol-client-config/` now tracks URF, Pick URF, Arena,
  Bravery Arena, and Arena 3x6 as real, self-updating rows (LIVE if
  enabled in ≥1 of 15 checked regions), recomputed fresh every sync —
  not a frozen snapshot like ADR-036's mistake. Caught and fixed a
  real bug before shipping this: a single request only returns
  accurate data for the region named in its own `region` query
  param — bundling all-region data from one request (the first
  attempt) silently reported wrong statuses for every region except
  the one requested. Found via cross-checking against isurfback.com's
  independent live data. Not an officially documented public API, but
  same "real, unauthenticated client data" trust class as
  CommunityDragon; if Riot changes/restricts it, the existing
  health-check pipeline surfaces it as unhealthy rather than silently
  serving wrong data.
- ~~ARAM: Mayhem / League Classic `rotating-modes` entries~~ —
  **also superseded 2026-08-13, ADR-038.** Same underlying issue as
  URF/Arena had before ADR-037, just previously overlooked because
  "permanent" made it feel safe: `status: "LIVE"` was still a one-time
  WebSearch snapshot frozen into the code (ADR-029), never re-verified.
  Moved into `lib/providers/lol-client-config/` alongside URF/Arena
  (queue 2400 for Mayhem, 4310 for League Classic — its real live
  queue id; the id in the static `queues.json` snapshot, 4300, doesn't
  even appear in the live config). `status` is now genuinely
  live-computed; `isLimitedTime: false` stays as a separate, still-
  valid structural claim from the same WebSearch research. Verified
  against real data: both show LIVE in all 15 checked regions right
  now — the "permanent" claim is now backed by live evidence, not just
  a research snapshot from a month earlier.
- **Same provider extended (2026-08-12, ADR-025)** with Summoner's
  Rift and ARAM as permanent `LIVE`/`PLAYABLE` rows — structurally
  always-queueable modes, not something requiring live verification.
  Gives the "all playable modes" baseline Deniz asked for after
  sharing a screenshot of LoL's mode-select screen.
- **Default category filter flipped to `PLAYABLE`-only** (was: all 5
  categories shown by default) in both onboarding's event selector
  and the dashboard's "All Events" list (not "Your Watchlist", which
  always shows everything already tracked). Filter bar extracted to
  `components/shared/category-filter-bar.tsx`, shared by both.
- Dashboard event cards now link their title to `/events/[slug]` —
  the per-event stats page (timeline, average duration, first/last
  seen) already existed but wasn't reachable from the dashboard,
  only from `/games/[slug]`.

- **Queue-level granularity (2026-08-12, ADR-026)** — Deniz clarified
  he wants the real sub-modes he sees in the client, not one umbrella
  row per game mode. `rotating-modes` provider now lists Summoner's
  Rift's 4 real permanent queues (Normal, Ranked Solo/Duo, Ranked
  Flex, Swiftplay) and ARAM by their real `queues.json` names, plus
  "ARAM: Mayhem Classic-ish" as an honest `ENDED` placeholder (Riot
  flags it specifically as limited-time). Mayhem/URF/Arena event-hub
  entries and League Classic's pass reclassified `SEASON_PASS` →
  `PLAYABLE` — they represent a real mode, not just a reward track.

- **`Event.isLimitedTime` (2026-08-12, ADR-027)** — separate from
  category, marks whether a mode/event is structurally permanent
  (Summoner's Rift's queues, ARAM, platform status) or genuinely
  time-boxed. Shown as a "Permanent"/"Limited Time" badge everywhere
  events are listed. Also fixed same day: dashboard's "All Events"
  list had a hardcoded 6-item cap on the Ended section with a
  non-clickable "+N more" — real cause of "Mayhem Classic-ish still
  doesn't show up" (it existed, just hidden behind the cap). Cap
  removed. And event-hub's pass-tier titles ("Mayhem Set 2", "Classic
  Pass: Act I") now display as their real, recognizable mode name
  ("ARAM: Mayhem", "League Classic") — dates/status still come from
  the real event-hub entry, only the label changed.

- **"ARAM: Mayhem Classic-ish" derived from real data (2026-08-12,
  ADR-028)** — Deniz's screenshot proved his client showed it as
  currently selectable while ModeAlert showed it as a hardcoded
  always-`ENDED` placeholder. Moved off the static provider entirely;
  now emitted as a companion event alongside League Classic's real
  pass-window entry in the CommunityDragon normalizer, sharing its
  actual dates/status. URF still has no comparable real anchor to tie
  to, so it stays a static `ENDED` placeholder — same risk of going
  stale exists for it too if it ever actually returns.

- **ARAM: Mayhem + League Classic confirmed permanent (2026-08-12,
  ADR-029)** — Deniz asked to double-check the Limited Time label via
  web research, not just API data. WebSearch confirmed both are now
  Riot-confirmed/designed-as permanent modes, not rotating — moved off
  the pass-window-inference workaround (ADR-026/ADR-028) onto their
  own dedicated, independently-verified `LIVE`/`isLimitedTime: false`
  entries. Arena checked too but stays unconfirmed (its guaranteed-run
  commitment lapsed with no clear follow-up found).

Full rationale, the URF-specific reasoning, and the per-provider
category mapping: docs/06_DECISIONS.md ADR-023/ADR-024/ADR-025/
ADR-026/ADR-027/ADR-028/ADR-029.

Future

- ~~A few CommunityDragon event-hub sub-types (e.g. "Classic Pass
  Token Bank") fall through to the `PLAYABLE` default~~ — fixed same
  day, title-matched to `SEASON_PASS` (it's pass-currency tracking,
  not real content).
- How long URF/rotating modes stay live once they do appear, and the
  average PBE-to-live lag — explicitly deferred by Deniz to a later
  phase. `EventHistory` already captures LIVE/TRACKING windows per
  event once real data exists, and PBE-preview rows are already
  timestamped from first sight, so the raw data this needs will
  already be there when it's time to build it.
- ~~Known duplicate-title issue (ADR-027)~~ — **resolved (2026-08-13,
  ADR-036).** The specific "ARAM: Mayhem" case turned out to already
  be fixed as a side effect of ADR-029 (same-day) — its pass window
  stopped being renamed to the canonical mode name, so it never
  actually duplicated after that; this note was just never updated.
  The underlying mechanism (a recurring thing getting a fresh provider
  id each occurrence) is still real and now confirmed live on a
  different event ("Season 3: Act I", one ENDED row from 2025, one
  LIVE from 2026) — `lib/utils/event-series.ts`'s
  `collapseSeriesToLatest()` now collapses same-game, same-seriesKey,
  **same-title** rows to the single most relevant occurrence in the
  dashboard "All Events" and onboarding pick-lists only. Deliberately
  keyed on title, not just seriesKey — an early version grouped by
  seriesKey alone and wrongly collapsed genuinely distinct occurrences
  ("Season 1: Act I" vs "Season 1: Act II") down to one. `/games/[slug]`,
  `/events/[slug]`, and "Your Watchlist" still show every real
  occurrence, untouched.

---

# P1 — Event History

Status: 🟡 (2026-08-12)

Completed (2026-08-12, ADR-030)

- **`eventPredictionService.predictNextArrival()`** — "typically
  returns after X, next expected around [date]" prediction for
  currently-ended events with 2+ completed historical occurrences.
  Shown on `/events/[slug]` alongside the existing "estimated to end"
  prediction. Pure computation (`computeRecurrence`) covered by 5
  unit tests; not yet verifiable against real data since history
  tracking only started 2026-08-04 and no event has 2+ *completed*
  occurrences yet.

Completed (2026-08-12, ADR-031)

- ~~Only works within a single event id's history~~ — solved.
  `Event.seriesKey` groups CommunityDragon rows that are real,
  successive occurrences of the same recurring thing (Mayhem's pass
  windows, the ranked season pass across years, Hall of Legends across
  years) using Riot's own event-hub data, which already reports years
  of real history in one fetch — no external research needed.
  `eventStatisticsService`/`eventPredictionService` gained
  `*BySeriesKey` variants; `/events/[slug]` uses them automatically
  when the event is part of a series. One-off narrative campaigns
  (Welcome to Noxus, Spirit Blossom Beyond, etc.) are deliberately NOT
  grouped — different content each time, not real recurrences.
- Providers with a stable id across real-world recurrences (PoE
  league, Warframe Nightwave, Foxhole war) never needed this — they
  already accumulate cross-occurrence history under one id naturally.

Completed

- Per-event detail page (`/events/[slug]`) — built directly on the
  `Event.slug` work from the same day. Shows the full `EventHistory`
  timeline for a single event (every LIVE/TRACKING occurrence with
  start time, end time or "ongoing", and computed duration, most
  recent first), plus provider (resolved from `event.source` via a
  new `getProviderName()` lookup on the provider registry),
  first-tracked/times-seen/average-duration stats, and the existing
  prediction/confidence from `eventPredictionService`. Linked from
  event titles on `/games/[slug]`, included in `app/sitemap.ts`.

Done (2026-08-13, ADR-039)

- ~~Changes — a log of title/description/status edits over time, not
  just LIVE/TRACKING start-end spans~~ — new `EventChange` table
  (additive migration, hand-written SQL per CLAUDE.md's migration
  rule, row counts verified identical before/after `migrate deploy`).
  `eventChangeDetectorService.diffEventFields()` (pure, unit-tested)
  compares title/description/status/category/isLimitedTime on every
  sync; `eventChangeHandlerService` persists any real diffs via the
  new `eventChangeService`, independent of whether the status change
  itself triggers a notification. Shown as a new "Changes" section on
  `/events/[slug]`, below the existing occurrence Timeline. Verified
  end-to-end against the real DB (inserted a real diff through the
  full detector→handler chain, confirmed it logged correctly, cleaned
  up the test artifact — not backfillable, starts recording from
  2026-08-13 forward same as every other "new instrumentation" feature
  in this app).

---

# P1 — Statistics

Status: 🟡 (2026-08-06)

Completed

- Public `/statistics` page (`lib/services/global-statistics.service.ts`),
  linked from the footer. Everything on it is computed from real rows,
  nothing fabricated:
  - **Most common events** — ranked by real `EventHistory` occurrence
    count.
  - **Average duration** — overall + per-game, computed only from
    occurrences that have actually completed (`endedAt` set).
  - **Prediction accuracy** — retrospective score: for every completed
    occurrence after an event's first, predicts its duration the same
    way `eventPredictionService` does live (average of prior
    occurrences) and compares to what actually happened.
  - Since history tracking only started 2026-08-04, average duration
    and prediction accuracy currently show "not enough data yet" —
    same honest empty-state pattern as `/games/[slug]` — because zero
    `EventHistory` rows have a real `endedAt` yet. Will fill in as
    events complete naturally via daily sync. Not backfillable: there's
    no fake substitute for "it actually finished."
  - **Provider uptime** — **done (2026-08-06, second attempt, ADR-022).**
    First attempt caused a real prod DB wipe via a documented-as-safe
    step that turned out not to be (`migrate diff --shadow-database-url`
    pointed at the same DB, not a real shadow one) — Neon PITR restored
    everything, no data lost, and CLAUDE.md's migration process was
    corrected before retrying. Second attempt used hand-written
    migration SQL (no `migrate diff`), verified row counts identical
    before/after `migrate deploy`. `ProviderHealthCheck` table now
    records a real row (provider, healthy, latencyMs, error) on every
    `providerSyncService.syncAll()` call — both the daily cron and
    `/admin`'s manual sync feed it, same code path. `/statistics` shows
    uptime % per provider over a rolling 30-day window. Verified
    end-to-end against a real sync (11 real health-check rows, real
    latencies, rendered on the page).

- **Notification success (rate)** — **done (2026-08-06).** Added
  `NotificationFailure` (userId, eventId, channel, error, createdAt)
  via the corrected migration process (hand-written SQL, no
  `migrate diff`; row counts verified identical before/after
  `migrate deploy`). `notification-trigger.service.ts`'s catch block
  now writes a failure row instead of only `console.error`-ing it —
  this also closes the matching gap under Notification Engine's Retry
  Policy note. While in that file, replaced its local hand-rolled
  retry loop with the shared `lib/utils/retry.ts` (same one CommunityDragon's
  client now uses), removing duplicate logic. `/statistics` now shows
  a real 30-day success rate (`sent / (sent + failed)`), not just a
  raw count — `null`/honest-empty-state when there have been zero send
  attempts in the window.

Done (2026-08-13, ADR-040)

- ~~False positives~~ — Deniz picked a definition from 3 concrete
  options: real user-facing "this was wrong" reports, not an inferred/
  guessed signal (rejected: automatic status-flapping detection, which
  would assume something's wrong rather than a user confirming it).
  `Notification.falsePositiveReportedAt` (nullable, additive migration,
  hand-written SQL, row counts verified before/after deploy) — set
  once, idempotent. "This was wrong" button on every notification
  (navbar bell dropdown + `/dashboard/notifications`), real rate shown
  on `/statistics` with the same honest-empty-state pattern as
  everything else there. Verified end-to-end against the real DB
  (reported a real notification, confirmed idempotency, confirmed the
  stats calculation, restored the original state).

---

# P1 — Scheduler

Status: 🟡 (2026-08-06)

Completed

- **Backoff** and **parallel execution**, partially — turned out
  `lib/utils/retry.ts` (exponential-ish backoff, 3 attempts) and
  `lib/http/client.ts` (timeout + retry, built on top of it) already
  existed and were already wired into 9 of 10 provider clients — found
  while looking for what to build next, another instance of the
  "written but not connected" pattern, this time only 1/10 connected
  wrong rather than 0/10. **CommunityDragon's client was the one
  holdout**, still on raw `fetch()` with no retry — migrated to the
  shared `http()` client (2026-08-06), verified against a real sync
  (17 events, same result as before, now retry-protected). Provider
  fetches already run in parallel via `Promise.allSettled` in
  `provider-sync.service.ts` (existed before this session).
  `lib/utils/retry.ts` got real test coverage for the first time
  (3 tests, fake timers).

Need

- Cron abstraction (currently just a single Vercel Cron route calling
  `syncAll()` — fine at current scale, revisit if multiple schedules
  are ever needed)
- Adaptive polling (blocked on Vercel Hobby plan's once-daily cron
  limit — see CLAUDE.md "Cron" note; moot until Pro plan)
- Failure recovery beyond per-request retry — e.g. a provider that's
  down for a full day currently just reports unhealthy in
  `ProviderHealthCheck`/`/status` until the next day's cron; no
  automatic re-check or alerting exists yet.

---

# P1 — Health Monitoring

Status: 🟡 (2026-08-06)

Completed

- **Provider latency** and **provider failures** — `ProviderHealthCheck`
  (see P1 Statistics → Provider uptime) records both on every sync,
  surfaced as uptime % on `/statistics` and live per-provider status on
  `/status`/`/admin`.
- **Sync duration** — **done (2026-08-06).** `providerSyncService.syncAll()`
  now times the whole run and returns `durationMs`; both
  `/api/cron/sync` and `/api/admin/sync` include it, shown on
  `/admin`'s manual sync panel ("Finished in Xs"). Verified against a
  real sync (11 providers, 3054ms). Not persisted anywhere yet — it's
  a per-request value, not a trend over time; revisit if that's ever
  needed.
- **Database health** — **done (2026-08-06).** `lib/db/health.ts`
  (`checkDatabaseHealth()`, a timed `SELECT 1`) wired into
  `/api/providers/health` alongside provider checks, surfaced as its
  own row on `/status` and `/admin` (also factored into `/status`'s
  "All systems operational" headline). Verified live (healthy, real
  latency).
- **Provider outage alerting** — **done (2026-08-13, ADR-046).**
  Closed the exact bus-factor risk named in the product's own
  readiness memo: `/status`/`/admin` existed but nobody was watching
  them, so a dead provider (e.g. the Riot key expiring) could go
  unnoticed for days. `healthAlertService` now emails `ADMIN_EMAILS`
  once a provider crosses into 2-consecutive-daily-syncs-unhealthy
  (~24h down), and only once per incident, not daily.

Need

- Notification latency (time from event-change-detected to
  notification-sent) — lower priority than it sounds: notifications
  fire synchronously within the same sync request in this
  architecture (no queue/worker gap), so the number would likely
  always be near-zero and not very informative. Revisit if a queue
  ever gets introduced.

---

# P1 — Admin

Status: 🟡 (2026-08-06)

Completed

- `/admin` — first admin-only page in the app, and the first thing
  requiring an actual "who's an admin" concept, which didn't exist
  (`User` has no `role` field). Rather than a schema change,
  gated by `ADMIN_EMAILS` (comma-separated, `lib/config/env.ts`) +
  `lib/auth/is-admin.ts`. Page itself calls `notFound()` (not a
  redirect/403) for non-admins, same as a route that doesn't exist —
  doesn't reveal it's there. Currently just `denizate@gmail.com` in
  `.env`/Vercel; **needs `ADMIN_EMAILS` added to Vercel production
  env vars to work live** (only set locally so far).
  - **Manual Sync** — `POST /api/admin/sync` (session+admin gated,
    separate from the `CRON_SECRET`-gated `/api/cron/sync` used by
    Vercel Cron — a browser button can't safely hold that secret).
    Reuses `providerSyncService.syncAll()` as-is. Useful right after
    a Riot key renewal instead of waiting for the next daily cron.
  - **Provider Status** — reuses the existing `useProviderHealth()`
    hook/`/api/providers/health` endpoint (same data `/status`
    shows), just rendered inline on the admin page.

Deliberately not built (would be fake or genuinely risky)

- **Clear Cache** — there's no cache layer in the app to clear.
  Building a button for this would be decoration, not a real action.
- **Rebuild Data** — too undefined to build blind (rebuild *what*,
  from *what* source, deleting existing rows first or not?). A
  destructive-sounding admin action needs a specific, scoped
  definition from Deniz before it's safe to write, not a guess.
- **Logs** — Vercel serverless function logs are ephemeral (already
  noted under Notification Engine's Retry Policy). A real persistent
  log viewer needs its own storage, which is new infrastructure, not
  a page.

---

# P1 — Product Analytics & Retention

Status: 🟢 (2026-08-13, ADR-046)

Completed

- **First-party funnel analytics** — signed-in users only, no
  cookies, no third-party script (see the "Due Diligence" readiness
  memo, which named "nobody's watching the funnel" as a blocking
  finding). New `AnalyticsEvent` table, allowlisted event names only.
  Tracks: onboarding step viewed, onboarding finished, free-limit hit,
  signup completed (all 3 methods), checkout clicked, premium
  activated. Aggregate 30-day counts on `/admin`'s new Funnel panel —
  no per-user PII surfaced there. Privacy policy updated to disclose
  it honestly.
- **Weekly digest email** — first real retention mechanic beyond the
  alerts themselves. Every Monday, users with email on and a non-empty
  watchlist get a real snapshot of what they're tracking. Piggybacks
  on the existing daily sync cron (no second Vercel cron entry
  needed).
- **Cross-game moat stated explicitly in marketing copy** — the
  homepage Features section and `/features` page now name the real,
  dynamic game count ("11 games, one inbox") and the actual
  differentiator (one watchlist instead of a tracker per game),
  instead of a generic/stale 4-game description.

Future

- Anonymous/pre-signup funnel tracking (landing page → signup) —
  deliberately out of scope for now, would need a real decision about
  cookieless session identification that's consistent with the
  privacy policy's promises, not a quick add.
- A/B testing the $4.99 price point — needs real signups first.

---

# P2 — AI Features

Status: 🟡 (2026-08-13)

Done

- ~~Event prediction~~ / ~~Expected duration~~ — done earlier
  (`eventPredictionService`, ADR-030), Premium-gated (ADR-041).
- ~~Popularity estimation~~ — **done (2026-08-13, ADR-047).** Real
  watchlist-count aggregation, not fabricated — turned out
  `Event.trackedUsers` had been a hardcoded 0 from every provider
  this whole time (same bug class as Game.activeUsers, ADR-007),
  just never caught since nothing displayed it. Now shown on
  `/events/[slug]`.
- ~~Recommendation engine~~ — **done (2026-08-13, ADR-047).** Real
  collaborative filtering ("people tracking this also track"),
  computed from actual Watchlist co-occurrence — deliberately not an
  LLM call, to stay inside the project's no-fabrication principle.

Future

- LLM-powered features (e.g. a natural-language digest summary) —
  deliberately not pursued yet, would need a new paid external API
  key (Anthropic) and real per-request cost, unlike everything else
  in "AI Features" which turned out to be buildable for free from
  data already in the DB.
- ~~Sorting onboarding's event picker by real popularity~~ — **done
  (2026-08-18).** `EventSelector`'s sort now uses `trackedUsers`
  (ADR-047's real Watchlist-count signal) as a tiebreaker within each
  existing category/rotation/status bucket — category still dominates
  (a real played thing still beats infrastructure noise), popularity
  only decides ordering among otherwise-equal events. No new data,
  same field `/events/[slug]` already displays.

---

# P2 — Multi Game Support

Status: 🟢 13 real games, 17 providers (2026-08-18)

Live providers

- League of Legends ✅ (Riot + CommunityDragon)
- Valorant ✅ (2026-08-04, Riot)
- Destiny 2 ✅ (2026-08-05, Bungie API — platform status + active
  weekly milestones/raid rotation. See docs/06_DECISIONS.md ADR-006.)
  **Context update (2026-08-12, ADR-033/ADR-034):** Bungie ended
  Destiny 2's planned live-service content on 2026-06-09 ("Monument of
  Triumph", Update 9.7.0) — servers stay up, game stays playable, but
  no more seasons/expansions, ever. Resolved the open question from
  ADR-033: checked Bungie's real milestone definitions directly —
  Trials of Osiris has a real milestone entry (`milestoneHash`
  2311040624) so the existing pipeline already catches it correctly
  when active, no change needed. Iron Banner has zero entries in that
  table (structurally can't be caught that way), so
  `mapIronBanner()` was added — computes real LIVE/ENDED status from
  Bungie's own official announced schedule (`@DestinyTheGame`: returns
  June 30, 2026, every 4 weeks after), not a live API signal but a
  deterministic formula from a dated, official source. Verified
  against real sync: computed dates matched independently-found real
  window dates exactly. **Xûr added (2026-08-13, ADR-042):** no live
  vendor API exists (would need per-character OAuth), so his status
  is computed from his long-standing Friday 17:00 UTC – Tuesday
  17:00 UTC weekly schedule instead, recomputed every sync.
- TFT ✅ (2026-08-05, Riot — platform status, same `RIOT_API_KEY`. See
  ADR-009.) **Current Set added (2026-08-13, ADR-042):** derived from
  CommunityDragon's live game-file mirror (highest set number
  present) — Data Dragon's versioned data proved stale for this.
- Fortnite ✅ (2026-08-05, `fortnite-api.com`, no key needed — Item
  Shop rotation only. LTM tracking deliberately excluded: the
  `/v1/playlists` endpoint returns every playlist the game has ever
  had, not just currently-active ones, and `isLimitedTimeMode` never
  came back `true` on a real request. See ADR-011.)
- Warframe ✅ (2026-08-06, `api.warframestat.us`, no key needed —
  Void Trader (Baro Ki'Teer) arrival, Nightwave season status, daily
  Sortie, weekly Archon Hunt. All 4 verified against real data with
  real activation/expiry timestamps. Alerts/invasions deliberately
  excluded (too high-frequency, low signal). See ADR-013. **5th
  activity added 2026-08-12 (ADR-035): Deep Archimedea** — weekly
  endgame mission chain, found via WebSearch then confirmed the same
  worldstate API already in use exposes it (`archimedeas` field, real
  activation/expiry) — was just never wired up.) **6th & 7th activity
  added 2026-08-18 (ADR-052): Prime Resurgence (vaultTrader) and Steel
  Path Circuit reward (steelPath)** — found by auditing this
  provider's own worldstate payload for unmapped fields; both were
  already in every response this provider fetches, real
  activation/expiry, ~monthly and weekly cadence respectively.
  `duviriCycle` (rotates every ~2h) and `calendar` deliberately not
  added — same too-high-frequency exclusion as alerts/invasions.)
- Path of Exile ✅ (2026-08-06, `api.pathofexile.com`, no key needed —
  current challenge league only (`Allflame` verified live). See
  ADR-014.)
- Helldivers 2 ✅ (2026-08-06, `api.helldivers2.dev`, community-run
  mirror of Arrowhead's backend, no key needed — active Major
  Orders/Personal Orders only (2 verified live). Per-planet campaigns
  deliberately excluded, too high-frequency/low-signal. See ADR-015.)
- Foxhole ✅ (2026-08-06, `war-service-live.foxholeservices.com`,
  official developer (Clapfoot) API, no key needed — single ongoing
  World Conquest war state (`War #137` verified live). See ADR-016.)
- PUBG: BATTLEGROUNDS ✅ (2026-08-13, `api.pubg.com`, official KRAFTON
  developer API, key required (self-serve, no IP lock) — current
  ranked season only, real `isCurrentSeason` flag (`Season 42`
  verified live). See ADR-043.)
- PlanetSide 2 ✅ (2026-08-13, `census.daybreakgames.com`, Daybreak's
  shared `s:example` service id, no key needed — current server-wide
  "Alert" (metagame event) status, real zone/duration data. Backlog
  previously said this needed a websocket; re-checked and that turned
  out to be wrong — a sorted, limited REST poll on `world_event` is
  enough. See ADR-044.)
- Final Fantasy XIV ✅ (2026-08-18, `frontier.ffxiv.com`, official
  Square Enix launcher-facing endpoint, no key needed — login gate
  open/closed only, same thin-but-real signal class as LoL/Valorant's
  platform status. See ADR-052.)
- **Steam Sales** — not a new game, a new provider (`steam-sales`)
  extending existing paid Steam games (Helldivers 2, Foxhole) with a
  real `discount_percent`-based "Steam Sale" event, via Valve's own
  keyless `appdetails` store API. F2P games in the roster don't return
  price data, so they're excluded rather than faked. See ADR-052.
- **EA Sports FC / FIFA Ultimate Team** (2026-08-18, `ea-fc`, 13th
  game) — Deniz approved loosening the data-sourcing policy to allow
  scraping/third-party sources (see ADR-053). Source: FUT.GG's own
  backend API (`fut.gg/api/fut/sbc/26/`, keyless), one of only 3 sites
  EA's own "FC Community API" authorizes — not first-party EA data,
  but a real, live, currently-verified platform, not a sketchy
  scraper. Real Squad Building Challenge (SBC) data, aggregated into
  one "Squad Building Challenges (N active)" event (same pattern as
  Fortnite's Item Shop) — 50+ concurrent SBCs are mostly permanent
  tutorials or low-signal daily grind, so per-SBC events would be as
  noisy as Warframe's excluded alerts/invasions.

Pending Deniz's action

- **Dota 2** — Valve's official Steam Web API (`GetTournamentPrizePool`)
  is real, documented, and not IP-locked (same friction class as
  Riot/Bungie/PUBG) — just needs a free self-serve key from
  **steamcommunity.com/dev/apikey**. Once Deniz provides
  `STEAM_API_KEY`, `lib/providers/dota2/` gets built and verified
  end-to-end. See ADR-053.

- Apex Legends — `apexlegendsapi.com` is the viable source. Deniz
  got a key via the web form (2026-08-06), added to `.env` as
  `APEX_API_KEY`, but a real request to `/maprotation` returns
  `429 "You must verify your API account first by linking your
  Discord account"` — the key is unusable until Discord is linked at
  `portal.apexlegendsapi.com/discord-auth`. Same VPN-access blocker
  as Discord OAuth login (ADR-005) — Discord isn't reachable from
  Deniz's location without a VPN. Blocked on the same prerequisite;
  revisit both together once Deniz has VPN access. Map rotation
  endpoint itself looks solid once unblocked; Collection Events/LTMs
  are as unreliable as Fortnite's, likely same "shop/rotation only"
  scope.

Evaluated and rejected

- ~~Deep Rock Galactic~~ — **researched 2026-08-18.** No official API;
  the only candidates (`drgmissions`, `drg-deep-dive-tracker`) are
  third-party scrapers, same trust-class problem as the rejected
  Genshin "fan API". See ADR-052.
- ~~Rocket League~~ — **researched 2026-08-18.** No general keyless
  public API for season/rotation data; only a specialized in-match
  telemetry API and third-party tracker sites. See ADR-052.
- ~~Marvel Snap and mobile games generally~~ — **researched
  2026-08-18.** No official public event API found for any mainstream
  mobile title checked. See ADR-052.
- ~~Wargaming (World of Tanks / World of Warships)~~ — **researched
  2026-08-18.** Self-serve key exists (same friction class as
  Riot/Bungie/PUBG), but a real event/season endpoint wasn't confirmed
  in this pass — needs deeper investigation before building. See
  ADR-052.
- ~~osu!~~ — **researched 2026-08-18.** Self-serve OAuth client exists,
  but there's no real time-boxed "event" concept to track (ranking
  cycles aren't live-service events). See ADR-052.
- ~~Call of Duty~~ — no official Activision API; unofficial routes
  need a real account login (not an API key) and don't even expose
  event/playlist data, only player stats. See ADR-006.
- ~~LoR~~ — Riot API returns 403 with the current dev key; needs a
  separate product application on the Riot Developer Portal, unclear
  approval odds/timeline. Revisit if Deniz wants to apply.
- ~~Wild Rift~~ — no known public API at all (403 on every guessed
  endpoint, no official docs). See ADR-009.
- ~~Overwatch 2~~ — no official Blizzard API for event/season data,
  no credible community dataset either. Static/manual calendar was
  considered and rejected (goes stale, violates the real-data-only
  principle). Same rejection profile as Call of Duty. See ADR-012.
- ~~OpenDota~~ (Dota 2, `api.opendota.com`, no key) — re-verified
  2026-08-06: `/leagues` returns every league ever played (16000+
  entries, no active/date filter), same failure mode as Fortnite's
  old `/v1/playlists` problem. Not usable without a second endpoint
  to isolate currently-running tournaments, which doesn't exist.
- ~~Diablo 4~~ — no official Blizzard API. **Reasoning clarified
  2026-08-13:** the original note ("needs a registered client
  id/secret") wasn't actually the blocker — Riot/Bungie/PUBG all
  require a registered key too and that's fine. The real reason:
  Battle.net's Game Data API catalog simply doesn't include Diablo IV
  at all (only WoW, Diablo III, Hearthstone, StarCraft II do — see the
  World of Warcraft entry above, in progress via ADR-043's research).
  Community Helltide/world-boss trackers (helltides.com, d4armory.io)
  are websites, not documented public JSON APIs.
- ~~Clash Royale / Clash of Clans / Brawl Stars~~ (Supercell) —
  **researched 2026-08-13.** Real season/event data exists, but
  Supercell's API keys are IP-locked to a single address — genuinely
  incompatible with Vercel's dynamic serverless egress IPs, same class
  of hard infrastructure blocker as Apex's Discord-linking requirement
  (ADR-005). A proxy service (e.g. RoyaleAPI's) could route around it,
  but that trades one third-party dependency for another, weakening
  the trust chain. Not pursued.
- ~~Genshin Impact / HoYoverse games~~ — **researched 2026-08-13.** No
  official HoYoLab public API for events/banners exists. The only
  option found is a community-run "fan API" aggregating calendar data
  — a materially weaker trust class than CommunityDragon (which
  mirrors Riot's actual game files directly, not a third party's own
  aggregation/guesswork). Inconsistent with this project's
  real/official-source-only principle.
- ~~Elite Dangerous~~ — Frontier has no first-party keyless Community
  Goals API; third-party tools (Inara, ED-API) proxy through their
  own services, which isn't a source ModeAlert can depend on directly.
- ~~Albion Online~~ (`gameinfo.albiononline.com/api/gameinfo`) — no
  key needed, but the only real-time endpoint (`/events`) is a raw
  PvP kill-feed, same too-granular/high-frequency profile as GW2's
  event feed and Warframe's excluded alerts/invasions.
- ~~EVE Online~~ (`esi.evetech.net`) — genuinely keyless and public,
  but neither candidate endpoint fit: `/incursions/` has no
  start/end timestamps (only a `state` enum), and
  `/sovereignty/campaigns/` returns dozens of concurrent, constantly
  churning skirmishes — same rejection class as Albion's kill-feed.
- ~~Brawlhalla~~ — v1.0 dropped the key requirement, but the API only
  covers player/guild stats, no event or season-rotation endpoint.
- ~~Mobile games, deeper per-title pass (16 titles)~~ — **re-researched
  2026-08-18** after the general "mobile has no APIs" conclusion above
  was challenged. Checked individually: PUBG Mobile, Call of Duty
  Mobile, Mobile Legends, Free Fire, Honkai Star Rail/Impact, Zenless
  Zone Zero, Roblox, Candy Crush, Coin Master, Royal Match, Whiteout
  Survival/Last War, Pokémon GO, EA Sports FC Mobile, Stumble Guys, 8
  Ball Pool, Subway Surfers. All 16 confirmed REJECTED for concrete,
  title-specific reasons (no official API / closed allowlist / SSO
  auth-gated / IP-locked / account-scoped only) — see ADR-053.
- ~~Bleach (Brave Souls / Soul Resonance)~~ — no public API from
  either publisher (KLab/Nuverse). See ADR-053.
- ~~Apex Legends, Diablo 4, Overwatch 2, Rocket League, Clash Royale/
  Clans (undocumented first-party JSON hunt)~~ — same technique that
  found LoL's rotating-mode signal (ADR-037) tried on 5 more titles,
  found nothing usable. Apex's own site does load real JSON
  (`gameCampaignsFallback`) but it's literally named "fallback" and
  proved stale on inspection (a July-ended sale still listed in
  August) — rejected as a frozen-snapshot risk, not used. See ADR-053.
- ~~Genshin Impact, take 2~~ — found the real first-party endpoint
  (`hk4e-api-os.hoyoverse.com/.../getAnnList`) this time — the CN
  server variant genuinely works (live-verified). But the Global
  variant, the one that would actually matter, returns `504` from two
  independent networks (this environment and Deniz's own Chrome) —
  confirmed genuinely broken, not a fluke. See ADR-053.
- ~~Path of Exile 2~~ — checked whether `api.pathofexile.com` exposes
  a separate PoE2 realm; the `realm=poe2` query param is silently
  ignored (same `pc` league data comes back either way). Not a real
  second data source yet; PoE's existing provider already covers the
  shared account/league system. See ADR-014.

Evaluated and deferred (keyless, but data source currently broken)

- Guild Wars 2 (`api.guildwars2.com/v2`) — `/v2/worldbosses` and
  `/v2/build` work with no key, but the endpoint that actually matters
  (`/v2/events`, real-time meta-event/world-boss timers) returned
  `503 "API not active"` on a real request — a known, long-standing
  ArenaNet bug, not a fluke (re-checked 2026-08-06, 2026-08-13, and
  again 2026-08-18 — still `503` all three times). Falling back to a
  static rotation table would violate the no-fake-data principle
  (ADR-012). Revisit if ArenaNet ever fixes it. See ADR-013.

Future no-key candidates worth a look (unverified, higher effort)

- ~~PlanetSide 2~~ — **done (2026-08-13, ADR-044).** The "needs a
  websocket" assumption above was wrong — re-checked and a sorted,
  limited REST poll on `world_event` gives the same answer. See the
  Live providers list above.
- Dota 2 — Steam Web API has real endpoints but requires a key (a
  Steam account is needed to generate one), and Dota doesn't really
  have LoL/Valorant-style rotating limited-time modes to begin with
  (its seasonal events like Diretide/New Bloom ship as client updates,
  not something toggled by a live API flag). OpenDota's `/leagues`
  problem (ADR context above) was a separate, already-rejected issue.
  Not pursued 2026-08-13 without a key.
- EverQuest II / DC Universe Online — same Daybreak Census API as
  PlanetSide 2 covers these too (keyless), but they're niche/old
  enough that they don't match Deniz's actual player base. Not
  investigated further.

Done (2026-08-05)

- ~~Per-game detail pages~~ — `/games/[slug]` added. Every `GameCard`
  now links to it. Shows every event ever tracked for that game with
  real history (first tracked, times seen, average duration once
  completed at least once) and — using `eventPredictionService`,
  which existed and was fully implemented but had zero callers
  anywhere (found via the same "written but not connected" audit that
  caught the notification bell, dashboard, and onboarding earlier) —
  an estimated end date + confidence once there's enough data. Right
  now every event shows "not enough history yet" honestly, since the
  event engine only started recording history 2026-08-04.

Future — richer data per existing game (not just more games)

- ~~TFT: only platform status right now~~ — **done (2026-08-13,
  ADR-042).** Real "current Set" signal added, derived from
  CommunityDragon's live game-file mirror (the highest set number
  present) — Data Dragon's versioned data proved stale (still showed
  Set 17 after Set 18 had already launched). Groups successive sets
  under `seriesKey: "tft-set"` for average-duration stats over time.
- ~~Destiny: Vendor rotation (Xûr) not yet mapped~~ — **done
  (2026-08-13, ADR-042).** No live API exists (Xûr isn't a Public
  Milestone, and vendor inventory needs per-character OAuth, out of
  scope). Computed instead from his long-standing Friday 17:00 UTC –
  Tuesday 17:00 UTC weekly schedule, recomputed fresh every sync.
- Valorant: could expand beyond platform status + active acts. —
  **investigated 2026-08-13, no real signal found.** Night
  Market/store rotation is account-scoped (needs OAuth), same
  personalization-scope exclusion as LCU (ADR-001). Still open.

---

# P2 — User Accounts

Status: 🟢 (2026-08-05)

Completed

- Authentication (Auth.js v5 + Prisma adapter, database sessions) —
  Google, Discord, email magic link (Resend). See
  docs/06_DECISIONS.md ADR-005.
- Saved watchlists / notifications / dashboard stats now scoped to
  the real signed-in user instead of the shared "demo" account.
- Closed an IDOR: `/api/notifications`, `/api/watchlists`,
  `/api/dashboard` used to trust a client-supplied `userId`; they now
  derive it from the server-side session and 401 without one.

Future

- Profiles (avatar/display name editing beyond what OAuth provides)
- Preferences
- ~~Notification settings~~ — basic version already live via
  `/dashboard/settings`'s email-notifications toggle (`emailOptOut`).
  The separate, richer `notification-settings.tsx` component this note
  used to point to was actually an empty 0-line stub, deleted
  2026-08-05 (see Bugs section) — this note just never got corrected.
  Per-channel granularity (once Discord/Telegram exist) would be a new
  build, not "finishing" an old component.
- ~~Deniz still needs to create the Google OAuth Client...~~ — Google
  done and live (2026-08-05). Discord deferred: Discord is currently
  blocked from Deniz's location without a VPN, so Discord Developer
  Portal setup is on hold until he's on VPN. `/signin` now only shows
  buttons for providers that are actually configured (see
  docs/06_DECISIONS.md ADR-005 update).

- Email+password sign-up added (`/signup`, 2026-08-05) — fourth auth
  method alongside Google/Discord/magic-link. No "forgot password"
  flow yet — a locked-out or password-less user can always fall back
  to Google or the email magic link to get in. Revisit if this becomes
  a real support burden.

- ~~`/signin` defaulted to the magic-link form, hiding email+password
  behind a "Prefer a password instead?" toggle.~~ — fixed (2026-08-05).
  Since signup already collects email+password together, sign-in now
  shows the same fields by default; magic-link is the toggle instead.
  Google sign-in was also re-tested live in production during this fix
  and works correctly end-to-end — no separate bug found there.

---

# P2 — Monetization

Status: 🟡 (2026-08-13, ADR-041)

Completed

- **Free/Premium paywall shipped** — Free: 5-event watchlist limit +
  email notifications. Premium ($4.99/mo): unlimited watchlist +
  per-event predictions/statistics (average duration, estimated end,
  "typically returns after"). Payment provider: **Lemon Squeezy**
  (Merchant of Record), not Stripe — Stripe doesn't support
  Turkey-based sellers directly, verified via WebSearch. `/pricing`
  page, `/dashboard/settings` subscription section,
  `/api/webhooks/lemonsqueezy` handler, watchlist-limit enforcement
  (`WatchlistLimitError` → 402, handled in onboarding + dashboard UI),
  `PremiumTeaser` blur-gate on `/events/[slug]`/`/games/[slug]`. See
  docs/06_DECISIONS.md ADR-041 for the full design and status → plan
  mapping.

Blocked on Deniz's action

- **Lemon Squeezy store not created yet** — needs an account +
  product/variant at lemonsqueezy.com, then
  `LEMONSQUEEZY_API_KEY`/`LEMONSQUEEZY_STORE_SUBDOMAIN`/
  `LEMONSQUEEZY_VARIANT_ID`/`LEMONSQUEEZY_WEBHOOK_SECRET` in both
  local `.env` and Vercel production (same pattern as Google OAuth's
  ADR-005 rollout). Until then `/pricing`'s upgrade button shows
  "Upgrades aren't live yet" — hidden gracefully, not broken.

Future

- Discord notifications as a Premium perk, once Discord itself is
  built (still blocked on Deniz's Turkey/VPN access, see ADR-003).
- Yearly/lifetime pricing tiers (deliberately deferred — Deniz chose
  monthly-only for launch simplicity).
- First-user acquisition strategy — separate conversation from the
  paywall itself, not yet actioned. See ADR-041's closing note for the
  Reddit/SEO direction discussed.

---

# P2 — Public API

REST

GraphQL (optional)

API Keys

Rate limiting

Documentation

---

# P2 — Browser Extension

Chrome

Firefox

Edge

---

# P3 — Mobile

Future

Android

iOS

Push notifications

---

# P3 — Desktop

Electron

Tray notifications

Background sync

---

# Technical Debt

Current

- Riot endpoint discovery

- ~~No input validation, error handling, rate limiting, or security
  headers~~ — **done (2026-08-13, ADR-045).** Full MVP-to-production
  hardening pass: `zod` validation on every API route that accepts a
  body, consistent `withErrorHandling()` wrapper, Postgres-backed IP
  rate limiting on register/login, real security headers + CSP in
  `next.config.ts`, missing DB indexes added, `npm audit` taken from
  13 vulnerabilities (including 3 high-severity in Next.js itself) to
  0 via a Next 16.2.10→16.3.0 bump, two unauthenticated debug API
  routes deleted, `aria-label` added to every form input. Deliberately
  left out: full WCAG audit, nonce-based CSP, Public API surface,
  external error tracking — see ADR-045's "Yapılmayan" for why each
  one is a real future item, not an oversight.

- ~~Provider test coverage~~ — **done (2026-08-06).** `vitest` added
  (`npm test` / `npm run test:watch`), 51 tests across all 10
  registered providers' pure event-mapper/normalizer functions
  (status transitions, filtering, title formatting). Client/service
  layers (real HTTP calls) deliberately left untested — no mocking
  framework introduced, kept to pure-function coverage for now.

- ~~Notification tests~~ — **done (2026-08-06).** Pure-function
  coverage for the notification pipeline: `message-builder.test.ts`
  (new-event vs status-transition copy), `unsubscribe-token.test.ts`
  (deterministic/per-user HMAC, tamper/empty-token rejection),
  `template.test.ts`. Found and fixed a real bug while writing the
  last one: `buildEmailHtml` interpolated `event.title`/`message`
  (third-party provider data — Riot/CommunityDragon/etc, not
  hardcoded strings) straight into HTML with no escaping. Added
  `escapeHtml()`, now covered by a test asserting `<script>`/`<img
  onerror=...>` in a title renders as inert text, not live markup.
  `notification-trigger.service.ts` itself (DB writes, retry timing)
  stays untested — same "no mocking framework, pure functions only"
  boundary as the provider tests.

- Scheduler tests

- Prisma optimization

- Logging improvements

- ~~Dead "written but not connected" code~~ — **cleaned up
  (2026-08-06).** A sweep for more instances of the pattern that kept
  showing up this session (retry/http client, `getAllHistory`) found
  a fresh batch, all confirmed zero-callers before removal:
  `lib/providers/core/executor.ts` and `base-provider.service.ts`
  (superseded — `provider-sync.service.ts` already does the same job,
  now with retry/health-check on top), `registerProvider()` in
  `registry.ts` (providers are hardcoded, never dynamically
  registered), `lib/helpers/getGame.ts`/`getFeaturedEvents.ts` (unused
  wrappers — the latter also bypassed the repository layer, a real
  architecture-rule violation even if it had been wired in),
  `lib/services/index.ts` (stale/incomplete barrel, nothing imported
  from it), `lib/utils/parallel.ts` (unused). Also deleted
  `lib/events.ts` — unused, and its content was hardcoded fake event
  data ("URF", "Night Market", `live: false`) of exactly the kind
  ADR-007 already had to fix elsewhere; better gone than one accidental
  import away from resurrecting that bug.

- ~~Repo kökünde dokümante edilmemiş, eski bir frontend katmanı var~~ —
  **tamamen temizlendi (2026-08-06).** `crawler/*/get-events.ts`
  (blizzard/epic/riot/steam/twitch) hâlâ boştu diye not düşülmüştü ama
  tam sayım yapılmamıştı — 2026-08-06'daki ölü kod taramasında toplam
  **15 tane 0 byte'lık, sıfır referanslı dosya** bulundu: yukarıdaki 5
  crawler dosyası + `components/marketing/*` (cta/dashboard-preview/
  faq/features/hero/supported-games — gerçek karşılıkları
  `components/landing/*`'te), `components/shared/Container.tsx`+
  `PageHeader.tsx`, `components/watchlist/watchlist.tsx` (gerçeği
  `components/dashboard/watching-list.tsx`), `onboarding/components/
  ChooseGameCard.tsx`, `constants/navigation.ts`. Hepsi silindi —
  yeni bir oyun eklenirken artık sıfırdan yazılacak (Valorant'ta
  yapıldığı gibi), eski iskeletten devralınacak bir şey yok.

- **Riot dev API key 24 saatte bir expire oluyor** — gerçek "low
  maintenance" için production key başvurusu gerekiyor. Şu an manuel
  güncelleniyor. 2026-08-05'te bir kez daha expire oldu (LoL/Valorant
  canlıda "unhealthy" görünüyordu — `/status` sayfası doğru şekilde
  yakaladı), Deniz yeniledi. Bu artık üçüncü/dördüncü kez oluyor — bu
  gerçekten bir "her gün elle yapılan iş" haline geldi, production key
  başvurusu (Riot Developer Portal → Apply for a Production Key)
  bundan sonraki en yüksek öncelikli manuel iş olmalı. **Ön koşul
  giderildi (2026-08-06):** Riot'un başvuru süreci, ürünün gerçek bir
  Terms of Service ve Privacy Policy sayfası olan, kendi domain'inde
  barındırılan çalışan bir uygulama/prototip olmasını şart koşuyor
  (ayrıca doğrulama için ~10 iş günü sürüyor) — `/privacy` ve `/terms`
  artık canlıda, footer'dan bağlı. **Başvuru gönderildi (2026-08-06,
  App ID 867857, Product Game Focus: League of Legends, Status:
  Pending Review).** Domain doğrulaması `public/riot.txt` ile
  yapıldı (Riot'un istediği doğrulama kodu, `/riot.txt`'te canlı).
  Riot Developer Relations incelemesi ~10 iş günü sürüyor — onay
  gelince yeni production key'i `.env`/Vercel'e işlemek kalıyor.

- ~~Auth yok. Her şey `"demo"` adında tek, hardcoded bir kullanıcı
  üzerinden çalışıyor~~ — **çözüldü (2026-08-05)**, bkz.
  docs/06_DECISIONS.md ADR-005 ve "P2 — User Accounts". Google/Discord
  login'in gerçekten çalışması için Deniz'in OAuth app'leri açıp env
  var'ları girmesi bekleniyor; email magic link zaten aktif.

- ~~`components/notifications/*` ve `hooks/use-notifications.ts` yazılmış
  ama hiçbir sayfaya bağlanmamış~~ — **navbar zil ikonu artık gerçek**
  (2026-08-05). `components/layout/notification-bell.tsx` eklendi,
  `components/ui/popover.tsx` (`@base-ui/react/popover` wrapper) üzerine
  kuruldu; navbar'a bağlandı. `use-notifications.ts` içine `markRead` /
  `markAllRead` eklendi (mevcut `PATCH /api/notifications` endpoint'ini
  kullanıyor), `notification-center`/`notification-item`/`empty-state`
  kompakt dropdown görünümüne göre yeniden stillendirildi.
  `notification-settings.tsx` (boş, 0 satırlık bir stub'dı) aynı gün
  silindi — bkz. Bugs bölümü.

---

# Bugs

- ~~No branded 404/error pages — Next.js defaults were used~~ —
  **fixed (2026-08-05).** `app/not-found.tsx` and `app/error.tsx`
  added, matching site design. Also deleted
  `components/notifications/notification-settings.tsx` — an empty
  (0-line) stub, superseded by `/dashboard/settings`.

- ~~Vercel build cache could serve a stale Prisma Client after a schema
  migration~~ — **fixed (2026-08-05).** `package.json` had no
  `postinstall` script, so when Vercel restored a cached `node_modules`
  and npm saw `@prisma/client` as already satisfied, it skipped
  `prisma generate` — the deployed client predated the Account/Session/
  VerificationToken models from the auth migration, so every sign-in
  (Google and email both) crashed with `Cannot read properties of
  undefined (reading 'create')` on `createVerificationToken`. Added
  `"postinstall": "prisma generate"` (root-level scripts always run,
  cache or not) and force-redeployed without cache. See
  docs/06_DECISIONS.md ADR-005.

- ~~`/signin` always showed Google + Discord buttons regardless of
  whether those providers were configured~~ — fixed same day, see
  ADR-005 update.

- ~~Footer "Privacy"/"Terms" links pointed to `#` (dead links)~~ —
  **fixed (2026-08-06).** `/privacy` and `/terms` pages added
  (`app/privacy/page.tsx`, `app/terms/page.tsx`), footer now links to
  them for real. Built primarily to unblock the Riot production key
  application, which requires a real ToS/Privacy page on the app's
  own domain.

- ~~Landing page's dashboard mockup (`DashboardPreview`) overflowed
  and overlapped adjacent cards when a real event title was long
  (e.g. Helldivers 2's Major Order briefings)~~ — **fixed
  (2026-08-06).** The `truncate` class was already there but had no
  effect without `min-w-0` on the flex ancestors — classic Tailwind
  flexbox gotcha. Added `min-w-0`/`shrink-0` where needed in
  `components/landing/dashboard-preview.tsx`.

- ~~LoL event list cluttered with non-events (permanent "Classic
  Player Level"/"Classic Voting Power" features with a 2099 sentinel
  end date, misleadingly-LIVE Mayhem season-pass windows) and
  TFT/Warframe/PoE/Helldivers 2/Foxhole icons falling back to emoji
  that doesn't render reliably in every environment~~ — **fixed
  (2026-08-06), see ADR-020.** Reported by Deniz. CommunityDragon
  normalizer now filters sentinel-dated and rotating-mode-named
  entries; the 5 games without an official brand SVG got real
  react-icons/gi themed icons instead of emoji.

No open bugs.

---

# Ideas

- **Yeni Oyun Araştırması (2026-08-18)** — Deniz "100+ oyuna çıkalım,
  anahtar gerektirmeyen her oyunu ekle" dedi. Sistemli bir tur daha
  yapıldı (mobil oyunlar, Deep Rock Galactic, Guild Wars 2 üçüncü kez,
  Rocket League, Wargaming, osu!, FFXIV, Steam'in kendi API'si).
  **Sonuç:** 100+ gerçek verilerle ulaşılabilir değil — çoğu oyunda,
  özellikle mobilde, hiç public event API'si yok. **Eklendi:** FFXIV
  (12. oyun — sadece login gate açık/kapalı, düşük ama gerçek sinyal)
  ve yeni bir provider türü, `steam-sales` (mevcut Helldivers 2/Foxhole'a
  Valve'ın kendi mağaza API'sinden gerçek indirim event'i). Reddedilenler
  ve gerekçeleri "P2 — Multi Game Support"un "Evaluated and rejected"
  bölümünde. Detay: docs/06_DECISIONS.md ADR-052.

- **Yeni Oyun Araştırması (2026-08-13)** — Deniz "oyunları çok fazla
  arttırmamız lazım" dedi. Geniş bir tarama yapıldı:
  - **Eklendi:** PUBG (ADR-043).
  - **Bekliyor (Deniz'in key alma sorunundan dolayı):** World of
    Warcraft/Battle.net — Mythic+ affix rotasyonu gibi gerçek haftalık
    bir sinyali var, self-serve client id+secret gerekiyor (IP kilidi
    yok, Riot/Bungie ile aynı sürtünme sınıfı). Deniz key almaya
    çalıştı ama şu an çalışmıyor — tekrar denenecek.
  - **Reddedildi — IP kilidi (gerçek teknik engel):** Clash Royale/
    Clash of Clans/Brawl Stars (Supercell). Key'ler tek bir IP'ye
    kilitleniyor, Vercel'in serverless dinamik IP'siyle uyumsuz —
    Apex/Discord'daki gibi gerçek bir altyapı engeli, atlanamaz
    (proxy servisleri var ama üçüncü parti bir bağımlılık eklemek
    aynı güven sınıfını düşürürdü).
  - **Reddedildi — hâlâ kırık:** Guild Wars 2 `/v2/events` tekrar
    canlı test edildi (2026-08-13), hâlâ `503 API not active` —
    ADR-013'ün bulgusu bir hafta sonra da geçerliliğini koruyor.
  - **Reddedildi — sadece resmi olmayan kaynak var:** Genshin
    Impact/HoYoverse oyunları. HoYoLab'ın resmi bir public API'si yok;
    bulunan tek seçenek topluluk yapımı "fan API" (CommunityDragon'dan
    farklı bir güven sınıfı — CommunityDragon Riot'un kendi oyun
    dosyalarının doğrudan aynası, bu ise üçüncü bir tarafın kendi
    agregasyonu). Projenin "sadece gerçek/resmi kaynak" ilkesiyle
    tutarsız, eklenmedi.
  - Diablo 4 için önceki ret (ADR bağlamı, "Blizzard client id
    gerekiyor") bu turda yeniden incelendi: aslında sorun client id
    değilmiş (Riot/Bungie de client id gerektiriyor, sorun değil) —
    gerçek sebep Battle.net'in Game Data API kataloğunda Diablo IV'ün
    hiç yer almaması (sadece WoW/Diablo III/Hearthstone/StarCraft II
    var). Ret kararı doğruydu, gerekçesi netleştirildi.

- ~~u.gg outbound links~~ — **done (2026-08-06).** Deniz asked for a
  u.gg integration. u.gg has no public API (verified — it's a stats/
  build site, nothing to embed/scrape), so this is outbound links
  only: `lib/constants/external-resources.ts` maps gameId → real u.gg
  URLs, rendered on `/games/[slug]` for LoL/TFT/Valorant. First pass
  used URLs typed from memory instead of the ones actually verified
  via WebSearch — caught and fixed before commit (`u.gg/val/tierlist/
  agents` not `u.gg/valorant/tier-list`, `u.gg/tft` not `u.gg/tft/
  tier-list`). Lesson: verify external URLs against the actual search
  result, don't reconstruct them from memory even when the pattern
  looks obvious.

- **Riot account linking (RSO)** — Deniz wants "connect your LoL
  account, show your actual champion" personalization. Researched
  2026-08-06: RSO (Riot Sign-On) requires an **already-approved
  production API key first** — Deniz's production key application is
  still Pending Review (see Technical Debt below). Once approved, RSO
  itself needs a *separate* application: documented user-flow
  (account creation/login/queue-up mockups or a working prototype
  link), mandatory data opt-in functionality, and a public disclaimer
  that account linking makes player data public. Multi-week, two-stage
  process with real product/legal decisions (opt-in UX, disclaimer
  copy) — not something to build blind. Revisit once the production
  key lands.

- ~~**URF/rotating-mode live status**~~ — researched a third time
  (2026-08-06, prompted by Deniz asking why URF isn't shown). Same
  conclusion as ADR-017/ADR-020, now with exhaustive evidence: every
  field `queues.json` exposes was enumerated (`id`, `name`,
  `shortName`, `description`, `detailedDescription`,
  `gameSelectModeGroup`, `gameSelectCategory`, `gameSelectPriority`,
  `isSkillTreeQueue`, `isLimitedTimeQueue`, `isBotHonoringAllowed`,
  `hidePlayerPosition`, `viableChampionRoster`, `pickMode`) — none of
  them carry a date or "active now" signal, not even an unreliable
  one. Also found `isurfback.com`, a third-party site dedicated
  entirely to this question — confirms it's a widely-recognized hard
  problem, but they don't disclose their methodology/API publicly, so
  it's not a source ModeAlert can depend on. **Handling changed
  (2026-08-12, ADR-023):** the "is it in rotation right now" signal is
  still genuinely unavailable — that hasn't changed and hardcoding a
  static row is still rejected for the same fabricated-data reason.
  But per Deniz, URF/Arena/Mayhem's real event-hub entry (the
  battle-pass window) is too important to hide entirely — it's now
  synced and trackable under the new `SEASON_PASS` category, with an
  honest description that it's the pass window only, not a "mode is
  live" claim. **Follow-up same day:** turned out URF currently has no
  entry at all on either the live or PBE event-hub feed (verified
  directly — re-fetched both, 21 identical entries, none named URF;
  current rotation per third-party patch notes is Mayhem/Arena/League
  Classic). So the SEASON_PASS fix alone didn't make URF visible. Added
  a small honest placeholder instead — see ADR-024. See the new Event
  Categories section below. **Superseded (2026-08-13, ADR-037):** the
  "genuinely unavailable" conclusion above turned out to be about the
  wrong data source, not the wrong conclusion for CommunityDragon's
  files specifically — `queues.json`/event-hub.json really don't have
  it, but Riot's separate, unauthenticated `clientconfig.rpg.riotgames.com`
  service does, with real per-region live `isEnabled` flags. The
  isurfback.com lead mentioned above turned out to be the thread that
  led there — inspecting its page source revealed it was already
  querying this exact service. Placeholder rows retired in favor of
  `lib/providers/lol-client-config/`.

- ~~Event popularity heatmap~~ — **done (2026-08-14, ADR-050).**
  `/statistics` now shows a real game × category heatmap built from
  the existing trackedUsers popularity signal (ADR-047) — no new
  data. Same pass also converted the page's plain lists ("Most
  tracked events", "Average duration by game", "Provider uptime")
  into real bar/status charts using the dataviz skill's method.

- ~~Event calendar~~ — **done (2026-08-14, ADR-049).** `/calendar`:
  three real sections (Live now / Estimated to end / Typically
  returns), all from `eventQueryService`/`eventPredictionService`.
  Added `RESEARCHED_CADENCES` as a small, hand-curated fallback for
  when our own tracked history isn't enough yet (only PoE's league so
  far — most rotating events don't have a real fixed cadence, and URF
  specifically was researched and rejected for one). Premium-gated
  dates, same pattern as existing per-event predictions.

- ~~Personalized recommendations~~ — **done (2026-08-13, ADR-047).**
  Real collaborative filtering on Watchlist co-occurrence, see P2 AI
  Features.

- Event calendar

- Discord bot

- Steam integration

- Twitch integration

- ~~Event RSS~~ — **done (2026-08-13, ADR-048).** `/feed.xml`,
  combines real EventHistory + EventChange rows, no new data. Linked
  from the footer and `<link rel="alternate">` in the site metadata.

- ~~Weekly digest~~ — **done (2026-08-13, ADR-046).** See P1 Product
  Analytics & Retention.

---

# DONE

Completed milestones

✅ Provider architecture

✅ Repository architecture

✅ Service architecture

✅ Scheduler skeleton

✅ Notification abstraction

✅ Prisma integration

✅ Dashboard backend

✅ CommunityDragon integration

✅ Riot provider foundation

✅ API routes

✅ Valorant provider (2026-08-04)

✅ Real Event Engine — new/updated/removed detection, source-scoped
  expiry, history lifecycle (2026-08-04)

✅ Email notifications (Resend), per-recipient, DB-persisted
  (2026-08-04)

✅ Postgres migration (Neon) — SQLite was incompatible with Vercel's
  serverless functions (2026-08-04)

✅ Production deploy live — https://modealert.vercel.app, auto-deploy
  on push (2026-08-04)

✅ Daily automated sync (Vercel Cron) (2026-08-04)

✅ Dashboard: real watchlist add/remove, live stats (2026-08-04)

✅ Onboarding flow: Games → Events → Finish, creates real watchlist
  entries (2026-08-04)

✅ Corporate-quality UI pass: real fonts, gradient brand system,
  real brand icons (react-icons/si), FAQ/CTA/How-It-Works sections
  built (were empty placeholder files) (2026-08-04)
