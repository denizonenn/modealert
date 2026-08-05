@AGENTS.md

# ModeAlert — AI Context

Bu bir Next.js SaaS projesi. Kod üzerinde herhangi bir değişiklik yapmadan önce
aşağıdaki sırayla oku:

1. docs/07_AI_CONTEXT.md   — AI asistanlar için kurallar (HER ZAMAN İLK OKUNACAK)
2. docs/00_PROJECT_CONTEXT.md — teknik mimari (katmanlar, klasör sorumlulukları)
3. docs/02_CONSTITUTION.md — değişmez prensipler
4. docs/03_ARCHITECTURE.md — detaylı katman/akış açıklamaları
5. docs/04_DEVELOPMENT_RULES.md — kodlama kuralları
6. docs/05_ROADMAP.md ve docs/09_BACKLOG.md — mevcut durum, öncelikler
7. docs/01_VISION.md ve docs/08_BUSINESS_MODEL.md — ürün vizyonu (gerektiğinde)
8. docs/06_DECISIONS.md — geçmiş mimari kararlar

## Proje Sahibi

Deniz Önen — Management Engineer, yazılım mühendisi değil, sadece Python
biliyor. Buna göre:

- Her zaman TAM dosya ver, TAM path belirt. Asla kısmi/parça kod snippet'i
  verme.
- Manuel düzenleme yapması gerektiğini varsayma — değişikliği sen uygula.
- Terminal komutu gerekiyorsa ne işe yaradığını kısaca açıkla.

## Kritik Mimari Kurallar (özet — detay için docs/00_PROJECT_CONTEXT.md)

- Katmanlar: UI → API Routes → Services → Repositories → Prisma → DB.
  Provider'lar Services'e bağlanır, asla UI/Repository'e değil.
- Business logic SADECE lib/services/ içinde yaşar. API route'ları
  (app/api/) ince kalmalı: validate → service çağır → response dön.
- lib/providers/ asla veritabanına yazmaz, sadece normalize edilmiş veri
  döner. Yazma işini sync service'ler yapar.
- lib/repositories/ sadece veritabanı erişimi yapar, iş kuralı içermez,
  provider çağırmaz.
- Her provider BaseProvider'ı implement eder: fetch(), normalize(),
  health(), name, priority. Bağımsız ve değiştirilebilir olmalı.
- Prisma sadece repository katmanı içinden kullanılır.

## Şu Anki Durum (2026-08-05 itibarıyla)

- Asıl geliştirme `feature/landing-page-v2` branch'inde yapılıyor.
  `main` branch'i hâlâ sadece create-next-app iskeleti.
- **Canlıda:** https://modealert.vercel.app — Vercel'e bağlı, her push
  otomatik deploy ediyor (Settings → Environments → Production →
  Branch Tracking = `feature/landing-page-v2`).
- **Veritabanı:** Neon Postgres (Vercel Storage Marketplace üzerinden).
  Artık SQLite değil — `DATABASE_URL` (pooled) + `DATABASE_URL_UNPOOLED`
  (migration'lar için) kullanılıyor.
- **Aktif provider'lar (3, hepsi gerçek veriyle doğrulandı):** Riot API
  (platform status + champion rotation), CommunityDragon (event-hub,
  live+pbe patchline), Valorant (platform status + act/episode).
  LCU sadece kişiselleştirme için — event keşfi için KULLANILMAZ
  (bkz. docs/06_DECISIONS.md ADR-001).
- **Cron:** `/api/cron/sync` günde 1 kez (Vercel Hobby plan limiti —
  Pro'ya geçilirse saatliğe çekilebilir).
- **Bildirimler:** Email (Resend) canlı, per-recipient gönderim,
  gerçek `Notification` DB kaydı. Discord/Telegram bilinçli olarak
  en sona bırakıldı (Deniz'in isteği — Türkiye'de Discord erişim
  sorunu).
- **Frontend tamamlanan akışlar:** Landing page (Hero/Features/HowItWorks/
  FAQ/CTA — gradient marka sistemi + gerçek fontlar), `/dashboard`
  (gerçek watchlist ekle/çıkar), `/live` (CommunityDragon canlı kontrol),
  `/onboarding` (3 adım: Games → Events → Finish, gerçek watchlist
  kaydı oluşturur).
- **Auth var (2026-08-05).** Auth.js v5 (`@auth/prisma-adapter`, database
  session) — Google ✅ canlı, email magic link ✅ canlı, Discord ⏸️
  ertelendi (Discord Deniz'in konumundan VPN'siz erişilemiyor —
  VPN'e geçince Discord Developer Portal'dan kurulacak, kod tarafı
  hazır). `AUTH_SECRET`/`AUTH_GOOGLE_ID`/`AUTH_GOOGLE_SECRET` hem
  local `.env` hem Vercel production'da set edilmiş durumda.
  Detay: docs/06_DECISIONS.md ADR-005.
- Detaylı karar geçmişi için **docs/06_DECISIONS.md** her zaman en
  güncel ve en güvenilir kaynak — yeni bir oturuma başlarken önce
  orayı oku.

## Belgeleme Kuralı

Mimariyi değiştiren her değişiklik ilgili docs/ dosyasını da güncellemeli
(docs/README.md → "Documentation Rules" bölümüne bak). Kod ile doküman
çelişirse, docs/02_CONSTITUTION.md'nin Article XIV'üne göre biri diğerine
uydurulmalı — sessizce göz ardı edilmez.
