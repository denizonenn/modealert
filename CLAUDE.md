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

## Şu Anki Durum

- Asıl geliştirme `feature/landing-page-v2` branch'inde yapılıyor.
- `main` branch'i şu an sadece create-next-app iskeleti.
- Aktif provider'lar: Riot API, CommunityDragon (live). PBE patchline
  entegrasyonu ve LCU (kişiselleştirme amaçlı, event keşfi için değil)
  yol haritada.

## Belgeleme Kuralı

Mimariyi değiştiren her değişiklik ilgili docs/ dosyasını da güncellemeli
(docs/README.md → "Documentation Rules" bölümüne bak). Kod ile doküman
çelişirse, docs/02_CONSTITUTION.md'nin Article XIV'üne göre biri diğerine
uydurulmalı — sessizce göz ardı edilmez.
