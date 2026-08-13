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

## ⚠️ ŞEMA DEĞİŞİKLİĞİ KURALI — `prisma migrate dev` YASAK, `--shadow-database-url` de YASAK

Bu projede local `.env` ile Vercel production **AYNI Neon
veritabanını** kullanıyor — ayrı bir dev/shadow DB yok. Bu kural iki
ayrı olaydan sonra iki kez sertleştirildi:

- **2026-08-06, olay #1:** `prisma migrate dev` bir unique constraint
  uyarısında interaktif onay isteyip non-interactive terminalde hata
  verdi, ama hata vermeden ÖNCE veritabanını resetledi. Bkz. ADR-019.
- **2026-08-06, olay #2 (aynı gün, birkaç saat sonra):** ADR-019'un
  "güvenli" dediği adım-2 komutu (`prisma migrate diff
  --shadow-database-url "$DATABASE_URL_UNPOOLED"`) da veritabanını
  resetledi — çünkü `DATABASE_URL_UNPOOLED`, prod ile **aynı**
  veritabanı (sadece pooled değil bağlantı), gerçek ayrı bir shadow DB
  değil. Prisma'nın shadow-database mekanizması "ayrı, boş bir DB"
  bekliyor; aynı DB verilince production'ı resetleyip migration'ları
  sıfırdan replay etti — tablo yapıları güncel kaldı ama TÜM VERİ
  silindi, `_prisma_migrations` bile yok oldu. Neon PITR ile
  kurtarıldı. Bkz. ADR-022.

**Sonuç: `--shadow-database-url` bayrağı, gerçekten ayrı/boş bir
veritabanına işaret etmediği sürece `migrate dev` kadar tehlikeli.
Bu projede öyle bir DB yok — o yüzden bu bayrak da YASAK, ta ki Deniz
ayrı bir Neon branch/database kurup connection string'ini verene
kadar.**

**Şema değişikliği gerektiğinde SADECE bu sırayla ilerle:**

1. `schema.prisma`'yı düzenle.
2. Migration SQL'ini **elle yaz** (`prisma migrate diff` kullanma —
   yukarıdaki olay #2 bunun neden yasak olduğunu gösteriyor). Ek
   sütun/tablo/index gibi additive değişiklikler için bu SQL basit ve
   tahmin edilebilir (`ALTER TABLE ... ADD COLUMN`, `CREATE TABLE`,
   `CREATE INDEX` — mevcut `prisma/migrations/*/migration.sql`
   dosyalarındaki formatı örnek al).
3. `prisma/migrations/<timestamp>_<isim>/migration.sql` dosyasını
   oluşturup SQL'i yapıştır.
4. SQL'i tekrar oku, yıkıcı bir şey olmadığından emin ol (DROP/DELETE/
   TRUNCATE yoksa, sadece ADD/CREATE varsa güvenlidir).
5. `npx prisma migrate deploy` ile uygula (non-interactive, reset
   yapmaz).
6. **Deploy'dan hemen önce ve sonra satır sayılarını kontrol et**
   (`SELECT COUNT(*)` birkaç ana tablodan) — beklenmedik bir reset
   olursa hemen fark edilsin.
7. `npx prisma generate` (Windows'ta dev server açıksa önce durdur,
   yoksa dll kilitlenip EPERM verir).

## Şu Anki Durum (2026-08-06 itibarıyla)

- Asıl geliştirme `feature/landing-page-v2` branch'inde yapılıyor.
  `main` branch'i hâlâ sadece create-next-app iskeleti.
- **Canlıda:** https://modealert.vercel.app — Vercel'e bağlı, her push
  otomatik deploy ediyor (Settings → Environments → Production →
  Branch Tracking = `feature/landing-page-v2`).
- **Veritabanı:** Neon Postgres (Vercel Storage Marketplace üzerinden).
  Artık SQLite değil — `DATABASE_URL` (pooled) + `DATABASE_URL_UNPOOLED`
  (migration'lar için) kullanılıyor.
- **Aktif provider'lar (12, hepsi gerçek veriyle doğrulandı):** Riot API
  (platform status + champion rotation), CommunityDragon (event-hub,
  live+pbe patchline), Valorant (platform status + act/episode),
  **Destiny 2** (Bungie API — platform status + haftalık aktif
  milestone'lar/raid rotasyonu, 2026-08-05), **TFT** (Riot API —
  platform status, 2026-08-05, aynı `RIOT_API_KEY`'i kullanıyor),
  **Fortnite** (`fortnite-api.com`, key gerektirmiyor — Item Shop
  rotasyonu, 2026-08-05, bkz. ADR-011), **Warframe**
  (`api.warframestat.us`, key gerektirmiyor — Void Trader, Nightwave,
  Sortie, Archon Hunt, 2026-08-06, bkz. ADR-013), **Path of Exile**
  (`api.pathofexile.com`, key gerektirmiyor — güncel challenge league,
  2026-08-06, bkz. ADR-014), **Helldivers 2** (`api.helldivers2.dev`,
  topluluk aynası, key gerektirmiyor — aktif Major Order'lar,
  2026-08-06, bkz. ADR-015), **Foxhole** (resmi geliştirici API'si,
  key gerektirmiyor — güncel savaş durumu, 2026-08-06, bkz. ADR-016),
  **LoL Live Queue Status** (`clientconfig.rpg.riotgames.com`, Riot'un
  League Client'ın giriş öncesi kullandığı key gerektirmeyen config
  servisi — URF/Arena gibi yıllardır "sinyalsiz" denen rotasyonlu
  modlar için gerçek, bölge bazlı, canlı `isEnabled` verisi,
  2026-08-13, bkz. ADR-037), **PUBG: BATTLEGROUNDS** (resmi KRAFTON
  developer API, key gerekiyor (self-serve, IP kilidi yok) — gerçek
  `isCurrentSeason` bayrağından güncel ranked sezonu, 2026-08-13, bkz.
  ADR-043). `PUBG_API_KEY` şu an sadece local `.env`'de — Vercel
  production'a henüz eklenmedi.
  LCU sadece kişiselleştirme için — event keşfi için KULLANILMAZ
  (bkz. docs/06_DECISIONS.md ADR-001). Call of Duty değerlendirildi ve
  **reddedildi** — Activision'ın resmi bir API'si yok, gayri-resmi
  yollar hesap girişi gerektiriyor ve zaten event verisi sağlamıyor
  (bkz. ADR-006). LoR ve Wild Rift de denendi, Riot API 403 döndü
  (ayrı ürün erişimi gerekiyor / hiç public API yok) — bkz. ADR-009.
  2026-08-06'da ayrıca Diablo 4, Elite Dangerous, Albion Online, EVE
  Online, Brawlhalla, OpenDota ve PoE2 araştırılıp reddedildi (key
  gerekiyor, veri çok granüler, ya da event kavramı yok) — detay
  docs/09_BACKLOG.md'de. **Apex Legends** için Deniz key aldı ama
  apexlegendsapi.com key'i Discord hesabı bağlanmadan aktif olmuyor
  (Discord Türkiye'den VPN'siz erişilemiyor — Discord auth'taki aynı
  engel, ADR-005) — key `.env`'de duruyor, VPN'e geçilince tamamlanır.
  **2026-08-13'te ayrıca** Clash Royale/Clash of Clans/Brawl Stars
  (Supercell — key'ler IP'ye kilitli, Vercel'in dinamik IP'siyle
  uyumsuz) ve Genshin Impact/HoYoverse (resmi API yok, sadece
  güvenilirliği düşük "fan API" var) araştırılıp reddedildi. **World
  of Warcraft** (Battle.net — gerçek haftalık Mythic+ affix rotasyonu)
  gerçek bir aday ama Deniz'in key alma denemesi şu an çalışmıyor,
  tekrar denenecek.
- **`RIOT_API_KEY` dev key, 24 saatte bir expire oluyor.** Production
  key başvurusu **gönderildi (2026-08-06, App ID 867857, Product
  Game Focus: League of Legends, Status: Pending Review)** — Riot'un
  istediği domain doğrulaması `public/riot.txt` ile yapıldı, ön koşul
  olan gerçek `/privacy`+`/terms` sayfaları da eklendi. İnceleme
  ~10 iş günü sürüyor; onaylanınca yeni key `.env`/Vercel'e işlenecek
  (bkz. docs/09_BACKLOG.md).
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
- **Monetization var (2026-08-13), ama ödeme sağlayıcısı henüz canlı
  değil.** Free (5-event watchlist limiti + email) / Premium
  ($4.99/ay — sınırsız watchlist + per-event prediction/statistics)
  paywall'ı kod tarafında tam; ödeme sağlayıcısı **Lemon Squeezy**
  (Stripe DEĞİL — Stripe Türkiye merkezli satıcıları desteklemiyor,
  bkz. ADR-041). Deniz henüz lemonsqueezy.com'da mağaza açmadı —
  `LEMONSQUEEZY_API_KEY`/`LEMONSQUEEZY_STORE_SUBDOMAIN`/
  `LEMONSQUEEZY_VARIANT_ID`/`LEMONSQUEEZY_WEBHOOK_SECRET` set
  edilene kadar `/pricing`'deki "Upgrade" butonu zarifçe "Upgrades
  aren't live yet" gösteriyor, sistem kırılmıyor (Google OAuth'un
  ADR-005'teki rollout'uyla aynı desen). Detay: docs/06_DECISIONS.md
  ADR-041.
- Detaylı karar geçmişi için **docs/06_DECISIONS.md** her zaman en
  güncel ve en güvenilir kaynak — yeni bir oturuma başlarken önce
  orayı oku.

## Belgeleme Kuralı

Mimariyi değiştiren her değişiklik ilgili docs/ dosyasını da güncellemeli
(docs/README.md → "Documentation Rules" bölümüne bak). Kod ile doküman
çelişirse, docs/02_CONSTITUTION.md'nin Article XIV'üne göre biri diğerine
uydurulmalı — sessizce göz ardı edilmez.
