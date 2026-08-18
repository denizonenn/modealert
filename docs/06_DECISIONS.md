# Architectural Decisions

Status: Active

> Bu dosya, ModeAlert için alınmış ve geri dönülmeyecek (veya sadece bilinçli
> olarak revize edilecek) mimari kararları kayıt altına alır. Her karar bir
> ADR (Architecture Decision Record) formatındadır: Bağlam → Karar → Gerekçe
> → Sonuçlar.

---

# ADR-001: Erken Event Tespiti İçin Veri Kaynağı Sıralaması

Status: Accepted

Date: 2026-08-04

## Bağlam

ModeAlert'in temel değer önerisi, Riot yeni bir event/oyun modu (Arena, URF,
Swarm, Cherry, Strawberry, vb.) duyurmadan ÖNCE kullanıcıyı uyarabilmek.
Bunun için en erken sinyali veren veri kaynağını bulmak gerekiyor.

İncelenen adaylar: LCU (League Client API), CommunityDragon (live), Riot
resmi API, PBE (Public Beta Environment), patch/plugin manifestleri,
lokalizasyon (string) tabloları.

Doğrulanan teknik gerçekler:

- LCU `/help` endpoint'i sadece tip tanımları döner, path listesi vermez.
  Endpoint keşfi `/help` üzerinden yapılamaz.
- LCU'da swagger/openapi endpoint'leri yok.
- LCU, kullanıcının bilgisayarına kurulu League istemcisinin İÇİNDEKİ veriyi
  okur. Bu veri, o istemci build'i hangi patch'e sahipse ondan ibarettir —
  istemcinin kendisi yeni bir şey "bilmez", sadece kurulu dosyaları
  yansıtır.
- CommunityDragon da aslında aynı kaynaktan besleniyor: Riot'un client
  paketleri içindeki `plugins/rcp-be-lol-game-data/...` klasörü. CDragon bu
  dosyaları Riot'un CDN'inden (patchline bazlı) çekip aynen sunuyor.
- Riot'un patchline'ları var: `live` (canlı) ve `pbe` (Public Beta
  Environment — test sunucusu). Yeni mod/event içerikleri neredeyse her
  zaman önce PBE'ye, günler/haftalar sonra live'a düşer.
- CommunityDragon, `pbe` patchline'ını da aynalıyor:
  `https://raw.communitydragon.org/pbe/...`
  Şu anki kod (`lib/providers/communitydragon/constants.ts`) sadece
  `latest` (live) patchline'a sabitlenmiş, `pbe` kullanmıyor.
- Resmi Riot API her zaman en geç kaynak: sadece zaten canlıya çıkmış,
  resmi olarak yayınlanmış veriyi (örn. şampiyon rotasyonu) döner. Roadmap
  / preview verisi sağlamaz.

## Karar

1. **En erken pratik sinyal kaynağı: CommunityDragon PBE patchline'ı.**
   LCU değil. LCU, event keşfi için KULLANILMAYACAK — sadece kişiselleştirme
   (mevcut oyun/queue/summoner bilgisi) amacıyla kullanılacak. Bu, zaten
   `docs/05_ROADMAP.md` Phase 2 kapsamıyla ve `CLAUDE.md`'deki mevcut notla
   tutarlı; bu ADR bunu resmi karar olarak sabitliyor.

2. **CommunityDragonProvider, `patchline` parametresi alacak şekilde
   genişletilecek** (`live` | `pbe`). Şu anki tek-patchline yapı
   (`COMMUNITY_DRAGON.BASE_URL` sabit `/latest`) kaldırılacak, provider iki
   patchline'ı da ayrı ayrı çekip normalize edecek.

3. **PBE snapshot'ları ayrı bir diff pipeline'ından geçecek.** PBE'de
   görülen yeni bir queue/mode/event-hub girdisi, live'da henüz yoksa
   "aday event" (candidate) olarak işaretlenecek — kesin/onaylı event
   olarak değil, çünkü PBE'deki her şey canlıya çıkmayabilir (test edilip
   iptal edilen özellikler var).

4. **PBE polling sıklığı, live'dan daha yüksek olacak.** PBE günde birden
   çok kez güncellenebiliyor (test cycle'ları); live ise patch bazlı
   (yaklaşık 2 haftada bir) güncelleniyor.

5. **İkincil/daha erken sinyal olarak plugin manifest / lokalizasyon
   diff'i değerlendirilecek (ileride, P2).** Yeni bir event'in tam JSON
   içeriği PBE'ye düşmeden önce bile, plugin bundle listesine yeni bir
   isim eklenmesi veya string/lokalizasyon tablolarına yeni key'ler
   girmesi, bazen içerikten önce görülebiliyor. Bu, ilk sürümde
   uygulanmayacak ama gelecekte "en erken sinyal" katmanı olarak
   backlog'da tutulacak.

## Gerekçe

- LCU, CommunityDragon'ın önüne geçemez çünkü ikisi de aynı kaynağın
  (Riot'un client bundle'ları) farklı erişim yollarıdır; LCU sadece o an
  kurulu olan tek bir patch'i gösterirken, CDragon PBE tüm test
  patchline'ını sürekli aynalar. Kullanıcının bilgisayarında PBE istemcisi
  çalıştırmadığı sürece LCU asla CDragon PBE'den daha erken veri veremez —
  ve PBE istemcisi çalıştırmak, ayrı bir hesap/kurulum gerektirdiğinden
  düşük bakım ilkesine (`docs/02_CONSTITUTION.md` Article II) aykırı.
- Resmi Riot API zaten en geç kaynak olduğu için "erken tespit" hedefi
  için kullanılamaz; sadece champion rotation gibi zaten-yayınlanmış
  resmi verilerde kalmaya devam edecek.
- Bu karar, mevcut Provider mimarisini bozmuyor: PBE sadece aynı
  `CommunityDragonProvider`'ın bir varyantı/parametresi, yeni bir katman
  veya bağımlılık gerektirmiyor (Article III — modülerlik korunuyor).

## Sonuçlar

- `lib/providers/communitydragon/constants.ts` ve `client.ts`
  `patchline` parametresi alacak şekilde güncellenecek (ayrı bir
  implementasyon görevi — bu ADR sadece kararı sabitler).
- `docs/09_BACKLOG.md` → CommunityDragon bölümüne "PBE patchline desteği"
  eklendi; Riot Local Client bölümünden "event discovery" kaldırıldı
  (LCU'nun kapsamı personalization ile sınırlı).
- Event modeli ileride bir `source`/`patchline` alanı gerektirebilir
  (candidate vs confirmed event ayrımı için) — şu an `prisma/schema.prisma`
  içinde böyle bir alan yok, bu Phase 1 sonrası ele alınacak.

---

# ADR-002: Event Engine Temeli — source Alanı, Expiry Tespiti, Ölü Kod Temizliği

Status: Accepted

Date: 2026-08-04

## Bağlam

CommunityDragon provider'ı gerçek bir `EventProvider` olarak bağlanınca
(ADR-001'in devamı), production'a giden yolda şu somut sorunlar ortaya
çıktı:

1. **İki paralel sync pipeline'ı vardı.** `lib/services/provider-sync.service.ts`
   (gerçekten kullanılan, `/api/cron/sync` tarafından çağrılan) ile
   `lib/scheduler/event-checker.ts` + `lib/scheduler/event-comparator.ts` +
   eski `lib/services/sync.service.ts` (hiçbir route tarafından
   çağrılmayan, tamamen ölü) aynı anda repo'da duruyordu. İkinci registry
   dosyası (`lib/providers/core/provider-registry.ts`) sadece bu ölü
   pipeline tarafından kullanılıyordu.
2. **Game ID tutarsızlığı.** `prisma/seed/seed.ts` League of Legends'ı
   `Game.id = "lol"` olarak seed ediyordu, ama Riot/CommunityDragon
   provider kodu `gameId: "league-of-legends"` üretiyordu — bu FK
   uyuşmazlığı yüzünden hiçbir event DB'ye yazılamıyordu (veritabanı
   tamamen boştu, seed hiç çalıştırılmamıştı).
3. **"Kaldırılan event" tespiti yoktu.** Bir provider daha önce
   raporladığı bir event'i artık raporlamıyorsa (rotasyon bitti, event-hub
   girdisi kayboldu), DB'deki kayıt LIVE/UPCOMING olarak sonsuza kadar
   kalıyordu — manuel temizlik gerektiren bir "low maintenance" ihlali.
4. **Event history lifecycle'ı yanlış tetikleniyordu.** `eventSyncService`
   sadece `status === "TRACKING"` olduğunda history başlatıyordu; LIVE
   event'ler (CommunityDragon'ın ürettiği asıl event tipi) hiç history
   kaydı almıyordu.
5. **Riot champion-rotation endpoint'i her zaman crash ediyordu.**
   `RiotChampionRotationResponse` tipi `freeChampionIds` /
   `freeChampionIdsForNewPlayers` alanlarını varsayıyordu (Riot'un genel
   API dokümantasyonundaki şekil), ama gerçek `tr1.api.riotgames.com`
   yanıtı `{ sr: number[], newplayer: number[] }` şeklinde geliyor.
   Canlı endpoint'e istek atılarak doğrulandı.
6. **Sync hataları hiçbir yerde loglanmıyordu.** `provider-sync.service.ts`
   `Promise.allSettled` sonucunu olduğu gibi dönüyordu; bir provider
   patlarsa ne sebep ne de log kalıyordu — debug etmek imkansızdı.
7. **Vercel Cron auth yanlış header'ı kontrol ediyordu.** `/api/cron/sync`
   `x-cron-secret` header'ı bekliyordu, ama Vercel Cron gerçekte
   `Authorization: Bearer <CRON_SECRET>` gönderiyor (resmi Vercel
   dokümantasyonundan doğrulandı). Düzeltilmeseydi, deploy sonrası cron
   sessizce 401 alıp hiç çalışmayacaktı.

## Karar

1. Ölü pipeline tamamen silindi: `lib/providers/core/provider-registry.ts`,
   `lib/scheduler/event-checker.ts`, `lib/scheduler/event-comparator.ts`,
   `lib/services/sync.service.ts` (eski), `lib/utils/promise.ts` (sadece
   ölü koddan kullanılıyordu). Tek bir registry (`lib/providers/core/registry.ts`)
   ve tek bir sync yolu (`provider-sync.service.ts` → `event-sync.service.ts`)
   kaldı.
2. `lib/constants/games.ts` eklendi (`GAME_IDS.LEAGUE_OF_LEGENDS = "lol"`),
   tüm provider mapper'ları bunu kullanacak şekilde güncellendi — Game.id
   artık tek bir yerden geliyor, bir daha drift edemez.
3. `Event` modeline `source` alanı eklendi (migration:
   `20260804121531_add_event_source`). Her upsert artık hangi provider'dan
   geldiğini kaydediyor. Bu alan olmadan "kaldırılan event" tespiti güvenli
   yapılamazdı (bir provider'ın batch'i başka bir provider'ın event'lerini
   yanlışlıkla "bitti" olarak işaretleyebilirdi).
4. `eventSyncService.sync(events, source)` her senkronizasyondan sonra
   aynı `source`'a ait, gelen batch'te artık görünmeyen ve henüz ENDED
   olmayan event'leri otomatik ENDED'e çeker — DB'de manuel temizlik
   gerektiren "hayalet" event kalmaz.
5. History lifecycle: LIVE veya TRACKING → history başlat; ENDED →
   history kapat; UPCOMING → dokunma.
6. `RiotChampionRotationResponse` gerçek API yanıtına göre düzeltildi
   (`sr`/`newplayer`).
7. `provider-sync.service.ts` artık her provider hatasını `console.error`
   ile loglar ve API yanıtında okunabilir bir `error` mesajı döner.
8. `vercel.json` eklendi, `/api/cron/sync` günde bir kez tetiklenecek
   şekilde (`0 8 * * *`). Route, Vercel'in gerçekte gönderdiği
   `Authorization: Bearer` header'ını kontrol edecek şekilde düzeltildi.

## Gerekçe

Hepsi Article II'nin doğrudan uygulaması: "Maintainability is more
important than speed... Technical debt becomes maintenance cost."
Ölü kod ve sessiz hatalar, "pasif gelir + low maintenance" hedefiyle
doğrudan çelişir — biri fark etmeden aylarca çalışmayan bir cron job,
tam da önlenmesi gereken şey.

## Sonuçlar

- Her iki provider (Riot, CommunityDragon) artık uçtan uca gerçek veriyle
  doğrulandı: DB'de 27 gerçek event, doğru `source`, doğru `gameId`,
  doğru history kayıtları.
- **Vercel Hobby planında cron job'lar günde sadece bir kez çalışabiliyor**
  (saatlik denemesi deploy'u fail ettirir). Şu an günlük olarak
  ayarlandı. Eğer Deniz Pro plana geçerse, `vercel.json`'daki schedule
  saatliğe (`0 * * * *`) çekilebilir — landing page zaten "hourly
  detection" vaat ediyor, bu ileride kapatılması gereken bir fark.
- **Riot dev API key'leri 24 saatte bir expire oluyor.** Şu anki key
  manuel olarak güncellendi. Gerçek "low maintenance" için Deniz'in
  ileride bir Riot Production API key başvurusu yapması gerekecek
  (dev key ile otomasyon sürekli elle müdahale ister — bu, projenin
  "owner should not manually update event data" ilkesine aykırı kalan
  tek nokta).
- Repo kökünde (`app/`, `lib/`, `components/`, `docs/` dışında)
  `constants/`, `crawler/`, `dashboard/`, `features/`, `hooks/`,
  `onboarding/`, `stores/`, `types/` altında, dokümante edilmemiş,
  muhtemelen daha önceki bir AI destekli oturumdan kalma ayrı bir
  frontend katmanı bulundu. **Dashboard kısmı (2026-08-04'te) çözüldü:**
  `hooks/use-dashboard.ts` + `hooks/use-events.ts` + `components/dashboard/*`
  tamamen çalışır durumdaydı, sadece `app/` altında değildi. Root
  `dashboard/page.tsx` silindi, aynı içerik (Navbar/Footer eklenerek)
  `app/dashboard/page.tsx`'e taşındı — artık gerçek, erişilebilir bir
  route ve gerçek DB verisiyle çalışıyor.

  **Onboarding kısmı henüz çözülmedi.** `components/onboarding/*` +
  `stores/onboarding-store.ts` 4 adımlı akışın (Games → Events →
  Notifications → Account) sadece ilk ikisini içeriyor; Notifications ve
  Account (auth gerektirir, henüz yok) adımları hiç yazılmamış.
  `app/onboarding/page.tsx` hâlâ bir placeholder. Yarım bir akışı
  aceleye getirip birleştirmek yerine bilinçli olarak ertelendi —
  auth (Phase 7) netleşmeden Account adımı düzgün yazılamaz.

  `crawler/*/get-events.ts` (blizzard/epic/riot/steam/twitch) hâlâ
  tamamen boş — "tüm oyunlar" için kullanılabilir bir şey değil, her
  yeni oyun provider'ı (Valorant'ta olduğu gibi) sıfırdan yazılıyor.

---

# ADR-003: Bildirim Kanalı Önceliklendirmesi ve Email Provider Seçimi

Status: Accepted

Date: 2026-08-04

## Bağlam

Bildirim motoru (`NotificationProvider`) sadece Console (log) sağlıyordu.
Gerçek kullanıcıya ulaşan ilk kanal seçilirken:

- Deniz Discord'u değil e-postayı öncelikli istedi — gerekçe: Discord'a
  erişim Türkiye'den zaman zaman kesintili/sorunlu, bu da bildirim
  altyapısının en temel garantisi olan "kullanıcıya ulaşır" ilkesini
  zedeler. Discord en sona bırakıldı.
- Mevcut `notificationTriggerService.trigger()` bir event değiştiğinde
  provider'ları event/previous ile çağırıyordu ama **hangi kullanıcıya**
  gönderileceği bilgisini hiç taşımıyordu (`NotificationProvider.send()`
  imzasında recipient yoktu) — email göndermek için bu yeterli değildi.
- `Notification` DB tablosuna hiçbir zaman gerçek bir kayıt yazılmıyordu;
  yazma kodu sadece silinen eski ölü pipeline'da vardı (bkz. ADR-002).
  Bu, dashboard'daki "bildirim geçmişi" özelliğinin hep boş kalacağı
  anlamına geliyordu.

## Karar

1. `NotificationProvider.send()` artık `NotificationRecipient` (id, email)
   alıyor. `notificationTriggerService`, event'i izleyen her watchlist
   kaydı için ayrı ayrı, her provider'ı recipient ile çağırıyor.
2. Her başarılı gönderimden sonra `Notification` DB kaydı oluşturuluyor
   (`channel` = provider id). Bir provider'ın hatası (`try/catch` ile
   yakalanıp loglanıyor) diğer provider'ları veya diğer kullanıcıları
   etkilemiyor.
3. Email provider için **Resend** seçildi (`lib/notifications/email/`).
   Gerekçe: Next.js/Vercel ekosisteminde fiili standart, kurulumu tek
   bir API key'den ibaret (SMTP/DKIM/SPF yönetimi gerektirmiyor),
   ücretsiz katmanı var, "boring/stable technology" ilkesine uyuyor
   (Article XIII). SendGrid/Postmark/ham SMTP değerlendirildi ama
   hepsi ya daha fazla kurulum ya daha az "sıradan" seçenekti.
4. `RESEND_API_KEY` yoksa email provider `enabled: false` olarak
   kaydolur — pipeline'ı bozmadan sessizce devre dışı kalır (Console
   provider'ın 401/hatalı-key durumunda health service'te açıkça
   göründüğü gibi, burada da eksik key durumu gizlenmiyor, sadece
   provider listesine hiç girmiyor).

## Gerekçe

Bir bildirim sisteminin en temel garantisi "kullanıcıya gerçekten
ulaşır" olmalı — Article I ("ModeAlert is a business, not a coding
exercise"). Türkiye'den değişken erişilebilirliği olan bir kanalı
öncelikli yapmak bu garantiyi zedeler. Email evrensel, hesap gerektirmez,
spam klasörü dışında neredeyse her yerde çalışır.

## Sonuçlar

- Uçtan uca doğrulandı: gerçek bir event durum değişikliği tetiklendi,
  doğru recipient'a console bildirimi gitti, doğru `title`/`message`/
  `channel` ile `Notification` DB kaydı oluştu.
- **Güncelleme (2026-08-04, aynı gün içinde):** Deniz resend.com'da
  hesap açıp `RESEND_API_KEY`'i verdi — email artık gerçekten aktif ve
  canlıda çalışıyor. `denizate@gmail.com`'a gerçek bir test maili
  gönderilip doğrulandı (message id: `1eea6a9f-e8c7-4bcb-8ee9-ea173b7a58df`).
  `from` adresi hâlâ varsayılan `onboarding@resend.dev` — kendi domain'ini
  Resend'de doğrulaması deliverability/marka güveni için hâlâ önerilir
  ama artık acil değil.
- Discord/Telegram/Push backlog'da "Future" olarak kaldı, öncelik
  sırası Deniz'in isteğiyle değişti (bkz. docs/09_BACKLOG.md).

---

# ADR-004: Production'a Çıkış — Postgres, Deploy Otomasyonu, Watchlist, Onboarding, Tasarım Sistemi

Status: Accepted

Date: 2026-08-04

## Bağlam

ADR-003'ten sonra aynı gün içinde proje local'den gerçek production'a
taşındı ve "proje gibi duran" bir şeyden gerçekten kullanılabilir bir
ürüne dönüştü. Çok sayıda karar tek oturumda alındığı için burada
toplu özetleniyor — her biri ayrı ayrı ADR açmak yerine, gelecekte
"neden böyle" sorusuna tek yerden cevap vermek için.

## Kararlar

### 1. SQLite → Postgres (Neon, Vercel Storage Marketplace)

Local SQLite dosyası Vercel'in serverless fonksiyonlarında kalıcı
disk olmadığı için tamamen çalışmaz durumdaydı — her cold start'ta
veri sıfırlanırdı. Vercel'in Storage sekmesinden Neon eklendi
(eskiden "Vercel Postgres" denen şeyin ta kendisi, artık marketplace
üzerinden). `DATABASE_URL` (pooled, uygulama için) + `DATABASE_URL_UNPOOLED`
(direct, migration'lar için) — Vercel'in otomatik enjekte ettiği
değişken isimleriyle birebir eşleşecek şekilde kuruldu, elle yeniden
adlandırma gerekmedi. Eski SQLite migration geçmişi silindi, Postgres
için sıfırdan `init_postgres` migration'ı oluşturuldu.

### 2. Vercel deploy otomasyonu — iki kez kırıldı, iki kez düzeltildi

İlk sorun: Vercel'in yeni arayüzünde "Production Branch" ayarı artık
**Settings → Git**'te değil, ayrı bir **Settings → Environments**
sayfasında (Production ortamına tıkla → Branch Tracking). Bu yüzden
`feature/landing-page-v2`'ye push etmek uzun süre sadece **Preview**
deployment üretti, production domain'e (`modealert.vercel.app`) hiç
dokunmadı — "Redeploy" butonu da yardımcı olmadı çünkü o buton aynı
eski commit'i yeniden build ediyor, branch ayarındaki değişikliği
yakalamıyor. Geçici çözüm: Deployments listesinden doğru build'i elle
**"Promote to Production"** yapmak. Kalıcı çözüm: Settings → Environments
→ Production → Branch Tracking'i doğru branch'e ayarlamak (dropdown'dan
seçmek, elle yazıp trailing space hatası yapmamak).

Bu düzeltmeden sonra her push gerçekten otomatik production deploy
tetikliyor — doğrulandı (birden fazla push'ta).

### 3. Watchlist özelliği — vardı ama bağlı değildi, bir de tip hatası vardı

`lib/repositories/watchlist.repository.ts`, `watchlistService`,
`/api/watchlists` route'u zaten tam çalışır haldeydi ama hiçbir UI
bileşeni kullanmıyordu. `hooks/use-watchlist.ts` da gerçek dönen veriyle
(Watchlist join-row, nested `event` alanıyla) uyuşmayan yanlış bir tipe
(`EventWithGame[]`) sahipti — kullanılsaydı runtime'da patlardı.

Hook `toggle()` odaklı, optimistic update yapan basit bir yapıya
yeniden yazıldı. Dashboard'a yıldız butonu eklendi, "Your Watchlist"
(sadece takip edilenler) ve "All Events" (keşfet + ekle/çıkar) olarak
ikiye bölündü. `getDashboardStats` de artık TÜM event'leri değil,
gerçek watchlist'i sayıyor — "Watching: 30" daha önce "sistemde 30
event var" demekti, artık gerçekten "30 şeyi takip ediyorum" demek.

Test sırasında ikinci bir cache bug'ı bulundu: watchlist toggle,
dashboard stat kartlarını güncellemiyordu çünkü `useWatchlist` ve
`useDashboard` ayrı SWR cache key'leri kullanıyordu. `toggle()` artık
`/api/dashboard` cache'ini de global `mutate()` ile invalidate ediyor.

### 4. Onboarding akışı — sitenin ana kırık CTA'sıydı

`/onboarding`, Hero ve CTA bölümlerindeki "Start Tracking" butonlarının
hedefiydi ama placeholder bir sayfaydı ("Event selection flow will be
implemented here"). Bileşenlerin çoğu (`GameSelector`, `EventSelector`,
`SelectableGameCard`, `EventCard`, Zustand store, `Progress`) zaten
yazılmıştı ama hiç birleştirilmemişti — ve `GameSelector`, Prisma
kullanan `gameService.getAllGames()`'i doğrudan bir `"use client"`
component'ten çağırıyordu, yani kullanılsaydı çökerdi.

Düzeltildi: `GameSelector` artık `useGames()` hook'unu kullanıyor.
Store'a `selectedEvents`/`toggleEvent` eklendi. 4 adım 3'e indirildi
(Games → Events → Finish) — eski 4. adım "Create your account"'tı,
ama auth sistemi yok, o yüzden sahte bir vaat vermek yerine kaldırıldı.
Finish adımı seçilen event'leri gerçekten `/api/watchlists`'e yazıyor
ve `/dashboard`'a yönlendiriyor. Uçtan uca tarayıcıda doğrulandı.

### 5. "Yazılmış ama bağlanmamış" örüntüsü — üçüncü kez tekrarlandı

Dashboard (ADR-002), onboarding (bu ADR) ve şimdi de bulunan ama HENÜZ
ÇÖZÜLMEMİŞ üçüncü örnek: `components/notifications/*` (notification-center,
notification-item, notification-settings) ve `hooks/use-notifications.ts`
yazılmış, hiçbir sayfaya bağlanmamış. Navbar'daki zil ikonu dekoratif,
tıklanamıyor. Muhtemelen aynı önceki (GPT destekli) oturumdan kalma —
bu proje boyunca bu örüntüye tekrar tekrar rastlanıyor, gelecekte
"neden bu component var ama kullanılmıyor" sorusu çıkarsa önce bunu
kontrol et.

### 6. Tasarım sistemi — gerçek font bug'ı + gradient marka kimliği

Deniz'in paylaştığı iki HTML template'i (Cyborg, BekoMaster) incelenirken
kritik bir bug bulundu: `globals.css`'teki `--font-heading`/`--font-sans`
CSS değişkenlerine hiçbir yerde gerçek bir font atanmamıştı (`next/font`
kurulumu hiç yapılmamıştı) — bütün başlıklar sessizce tarayıcı
varsayılan **serif** fontunda render oluyordu. `next/font/google` ile
Inter (body) + Space Grotesk (başlıklar) yüklendi, tek bir
`h1-h6 { @apply font-heading }` kuralıyla sitenin her yerinde otomatik
düzeldi.

Template'lerin asset'leri kopyalanmadı (lisans) ama enerjileri
(gradient, kalın tipografi) `text-gradient-brand`/`bg-gradient-brand`
utility'leri (mor→pembe→mavi) olarak kendi sistemine çevrildi — Hero,
CTA, Features kartları, How It Works, dashboard stat kartları, yeni
`SectionEyebrow` component'i. Oyun ikonları da emoji yerine gerçek
marka ikonlarına geçirildi (`react-icons/si`: `SiLeagueoflegends`,
`SiValorant`, `SiFortnite`) — `components/shared/game-icon.tsx` artık
`Game.color`'ı da (daha önce hiç kullanılmıyordu) aksan rengi olarak
kullanıyor.

## Sonuçlar

- Production tamamen doğrulandı: 3 provider, gerçek watchlist,
  tamamlanmış onboarding, gerçek email, otomatik deploy, otomatik
  günlük sync — hepsi `modealert.vercel.app`'te canlı ve test edildi.
- Kalan bilinen açık: auth yok (tek "demo" kullanıcı), notification
  center bağlı değil, Discord/Telegram yapılmadı (bilinçli), daha
  fazla oyun provider'ı yok (crawler/ hâlâ boş).
- "Yazılmış ama bağlanmamış component" örüntüsü artık üç kez görüldü
  (dashboard, onboarding, notifications) — yeni bir component
  klasörüyle karşılaşınca önce "gerçekten bir route'tan import
  ediliyor mu" diye kontrol etmek, doğrudan güvenmemek gerekiyor.

---

# ADR-005: Gerçek Auth — Auth.js (NextAuth v5) + Google/Discord/Email

Status: Accepted

Date: 2026-08-05

## Bağlam

Roadmap'te bir sonraki milestone olarak işaretli (bkz.
`docs/05_ROADMAP.md` Phase 7, `docs/09_BACKLOG.md` "Next milestone"):
her şey hardcoded `"demo"` kullanıcısı üzerinden çalışıyordu — watchlist,
notification, dashboard stats hepsi tek bir paylaşılan hesaba bağlıydı.
Bu hem gerçek çok-kullanıcılı bir SaaS olmanın hem de Phase 8
(Premium/monetization — ödeme almadan önce gerçek hesap gerekir) önünde
tek engeldi.

Auth çözümü seçilirken üç seçenek değerlendirildi: Auth.js (self-hosted,
ücretsiz), Clerk (yönetilen servis, MAU limitine göre ücretli), Supabase
Auth (ayrı bir Postgres/servis bağımlılığı gerektirir — zaten Neon
kullanılıyor). Auth.js seçildi çünkü:

- Ücretsiz, vendor lock-in yok — "passive income + low maintenance"
  hedefiyle en uyumlusu (büyüdükçe maliyet çıkarmıyor).
- Mevcut Prisma/Neon altyapısını doğrudan kullanıyor
  (`@auth/prisma-adapter`), ayrı bir servis eklemiyor.
- `next-auth@5.0.0-beta.32`, Next.js 16 ile resmi olarak uyumlu
  (`peerDependencies: "next": "^16.0.0"` — npm'de doğrulandı).

Login yöntemleri: Google (en düşük sürtünme), Discord (ModeAlert'in
hedef kitlesi gaming — ama Deniz'in notuyla tutarlı olarak sadece login
için, bildirim kanalı olarak DEĞİL, bkz. ADR-003), ve email magic link
(Resend üzerinden — zaten `RESEND_API_KEY` mevcuttu, parola/reset akışı
gerektirmeyen en düşük bakımlı üçüncü seçenek).

## Karar

1. `prisma/schema.prisma`'ya Auth.js'in standart adapter şeması eklendi:
   `Account`, `Session`, `VerificationToken` modelleri + `User`'a
   `emailVerified`/`image` alanları (migration:
   `20260805111829_add_auth_models`, sadece ekleme — mevcut tabloları
   bozmuyor).
2. Kök `auth.ts`: `PrismaAdapter` + database session stratejisi.
   Providers (Google/Discord) sadece ilgili env var'lar (`AUTH_GOOGLE_ID`
   vb.) doluysa listeye giriyor — email provider'daki
   "key yoksa sessizce devre dışı kal" kuralıyla aynı desen (ADR-003).
   Bu sayede kod, Deniz henüz Google/Discord OAuth app'i açmadan da
   çalışıyor — sadece email magic link aktif olarak başlıyor.
3. `app/api/auth/[...nextauth]/route.ts` route handler, `/signin` sayfası
   (Google/Discord butonları + email formu) ve `/signin/check-email`
   (magic link "check your inbox" ekranı) eklendi.
4. **Güvenlik düzeltmesi (auth'un doğal sonucu):** `/api/notifications`,
   `/api/watchlists`, `/api/dashboard` önceden client'ın gönderdiği
   `userId` query/body parametresine güveniyordu — herhangi biri başka
   bir kullanıcının `userId`'sini tahmin edip bildirimlerini/watchlist'ini
   okuyabilir/değiştirebilirdi (IDOR). Üçü de artık `auth()` ile sunucu
   tarafında session'dan `userId` alıyor, session yoksa 401 dönüyor.
   `notification.repository.ts`'teki `markNotificationRead`/
   `deleteNotification` de `userId` ile scope'landı (`updateMany`/
   `deleteMany` where'i) — bir notification ID'sini bilmek artık başkasının
   bildirimini işaretlemeye/silmeye yetmiyor.
5. `hooks/use-notifications.ts`, `hooks/use-watchlist.ts`,
   `hooks/use-dashboard.ts` artık `userId` parametresi almıyor — session
   yoksa SWR key `null` olup hiç fetch atmıyor. Yeni `hooks/use-require-auth.ts`,
   `/dashboard` ve `/onboarding` sayfalarını client tarafında
   `/signin?callbackUrl=...`'e yönlendiriyor (asıl güvenlik sınırı zaten
   API katmanında — bu sadece UX).
6. Onboarding finish adımı artık `DEMO_USER_ID` sabitini değil, gerçek
   `session.user.id`'yi (API üzerinden, örtük) kullanıyor.

## Gerekçe

Article I ("ModeAlert is a business, not a coding exercise") ve
roadmap'in "passive income first" ilkesi doğrudan gerçek kullanıcı
hesaplarını gerektiriyor — paylaşılan `"demo"` kullanıcısıyla ne gerçek
bir watchlist deneyimi ne de ödeme alınabilir. Auth eklemek aynı zamanda
önceden fark edilmemiş bir IDOR açığını (userId'nin client'tan güvenle
kabul edilmesi) kapattı — bu, "foolproof" hedefiyle örtüşen, auth'un
zorunlu kıldığı bir yan etki.

## Sonuçlar

- `tsc --noEmit` ve `eslint` temiz; dev server ayağa kalkıyor;
  `/api/dashboard`, `/api/notifications`, `/api/watchlists` session'sız
  istekte doğru şekilde 401 dönüyor; `/api/auth/providers` sadece
  `resend`'i listeliyor (Google/Discord env var'ları henüz boş).
- **Güncelleme (2026-08-05, aynı gün içinde): Google OAuth canlıda
  aktif.** Deniz Google Cloud Console'da OAuth Client ID'yi açtı,
  `AUTH_GOOGLE_ID`/`AUTH_GOOGLE_SECRET` hem local `.env`'e hem Vercel
  production environment'ına eklendi (`AUTH_SECRET` ile birlikte —
  o da sadece local'de kalmıştı, bu düzeltmeyle prod'a eklendi).
  Tarayıcıda uçtan uca doğrulandı: `/signin` → "Continue with Google"
  → gerçek Google hesap seçim ekranı doğru redirect URI ile açılıyor
  (`redirect_uri_mismatch` hatası yok).

  Bu sırada bir bug bulundu ve düzeltildi: `/signin` sayfası Google ve
  Discord butonlarını hep birlikte, hangi provider'ın gerçekten
  yapılandırıldığından bağımsız olarak gösteriyordu — Discord henüz
  kurulmadığı için tıklayan biri hataya düşerdi. Sayfa artık
  `getProviders()` ile gerçek provider listesini çekip sadece
  gerçekten aktif olanların butonunu gösteriyor.

  **Discord bilinçli olarak ertelendi** — Discord Türkiye'den Deniz'in
  makinesinde şu an erişilemez durumda (bkz. ADR-003'teki aynı erişim
  sorunu, orada bildirim kanalı için, burada OAuth kurulumu için).
  VPN ile Discord Developer Portal'a erişebildiğinde `AUTH_DISCORD_ID`/
  `AUTH_DISCORD_SECRET` eklenip aynı şekilde devreye alınacak — kod
  tarafı zaten hazır, sadece env var eksik.
- Eski `"demo"` kullanıcısı DB'de kalmaya devam ediyor (artık hiçbir
  route ona yazmıyor) — `prisma/seed/seed.ts` hâlâ onu oluşturuyor,
  sadece local seed/test amaçlı, prod trafiğinde kullanılmıyor.
- Sıradaki doğal adım Phase 8 (Premium/monetization) — artık gerçek
  kullanıcı kimliği olduğu için ödeme sağlayıcısı entegrasyonu önündeki
  mimari engel kalmadı.

- **Güncelleme (2026-08-05, aynı gün): Email+şifre ile kayıt eklendi
  (`/signup`).** Google/Discord/magic-link'e ek dördüncü giriş yöntemi.
  Bunu desteklemek için `session.strategy` `"database"`'den
  `"jwt"`'ye çevrildi — Credentials provider, Auth.js'te database
  session stratejisiyle güvenilir çalışmıyor (adapter session
  oluşturma akışı credentials için tasarlanmamış). Bu geçiş
  `session`/`jwt` callback'lerini de değiştirdi (`user.id` yerine
  `token.id`) ama Google ve magic-link akışlarını bozmadı — ikisi de
  yeniden test edildi ve çalışıyor.

  `User` modeline `password` (bcrypt hash, 12 rounds), `failedLoginAttempts`,
  `lockedUntil` eklendi (migration `20260805132904_add_user_password`).
  5 yanlış denemeden sonra hesap 15 dakika kilitleniyor — parola
  eklemek yeni bir brute-force yüzeyi açtığı için asgari ama gerçek bir
  koruma. `/api/auth/register` aynı email'le ikinci kaydı 409 ile
  reddediyor — aksi halde biri, zaten Google ile oluşturulmuş bir
  hesabın email'ini bilip ona şifre "ekleyerek" hesabı ele geçirebilirdi.

  Tarayıcıda uçtan uca doğrulandı: kayıt → otomatik giriş → dashboard,
  çıkış → şifreyle tekrar giriş → dashboard, yanlış şifre → red,
  5 yanlış deneme → kilit, aynı email'le ikinci kayıt → red.

---

# ADR-006: Dördüncü Oyun Provider'ı — Destiny 2 (Bungie API), Call of Duty Reddedildi

Status: Accepted

Date: 2026-08-05

## Bağlam

Deniz yeni oyun provider'ları eklenmesini istedi, örnek olarak Destiny
ve Call of Duty'yi verdi. İkisi de kod yazılmadan önce fizibilite
açısından araştırıldı (bir subagent ile), varsayıma dayanmadan.

**Destiny 2 (Bungie):** Resmi, ücretsiz, dökümante bir API var
(bungie-net.github.io). Bungie.net'te ücretsiz hesap + `bungie.net/en/User/API`'den
API key alımı Riot'un dev portal süreciyle aynı seviyede kolay. Deniz
key'i aldı: `bungie.net/en/User/API` üzerinden bir "app" oluşturup
API Key'i paylaştı.

**Call of Duty (Activision):** Hiç resmi public API'si yok. Topluluk
paketleri (`call-of-duty-api`, `Node-CallOfDuty`) gerçek bir CoD
hesabıyla (email+şifre) login gerektiren, dökümente edilmemiş private
endpoint'leri kullanıyor — API key değil. Üstelik bu endpoint'ler
oyuncu istatistiği için, event/playlist/double-XP verisi için değil —
yani teknik olarak mümkün olsa bile ModeAlert'in ihtiyacını
karşılamıyor. 2019'da Activision bir gecede kırıp üçüncü parti
sitelerin çoğunu çökertmişti, ana npm paketi artık bakımsız.

## Karar

1. **Destiny 2 provider'ı eklendi** (`lib/providers/destiny/`),
   Valorant'ın dosya yapısı birebir şablon alınarak (`client.ts` →
   `types.ts` → `event-mapper.ts` → `service.ts` → `provider.ts`).
2. **Call of Duty eklenmedi.** "Low maintenance" ve "her provider
   dökümente/kararlı bir kaynağa dayanır" ilkelerine açıkça aykırı —
   şifre saklamak yeni bir güvenlik yüzeyi açar, dökümente edilmemiş
   bir private API'ye bağımlı kalmak öngörülemez şekilde kırılabilir,
   ve zaten aradığımız veriyi (event/playlist takvimi) sağlamıyor.
   İleride Activision resmi bir API yayınlarsa yeniden değerlendirilir.
3. **Veri kaynağı seçimi (Bungie API içinde):** `Destiny2.GetPublicMilestones`
   sadece hash döner, isim dönmez — insan-okunur başlık için
   `Destiny2.Manifest`'ten `DestinyMilestoneDefinition` component'i
   ayrıca çekiliyor (tüm manifest DEĞİL — sadece bu component, ~37KB,
   31 kayıt). Manifest'in versiyon path'i her sync'te taze çekiliyor
   (`/Destiny2/Manifest/` → `jsonWorldComponentContentPaths.en.DestinyMilestoneDefinition`),
   sabit bir path hardcode edilmedi — Bungie içerik güncellediğinde
   path değişiyor, versiyonlama/cache'leme karmaşıklığına hiç
   girilmedi, her sync'te taze çekmek yeterince ucuz (37KB).
   Platform durumu için `Settings` endpoint'indeki
   `systems.Destiny2.enabled` kullanıldı (Riot/Valorant'taki platform
   status deseniyle aynı).

## Gerekçe

Article II ("low maintenance") ve mevcut provider mimarisinin
("her provider bağımsız, dökümente bir kaynağa dayanır") doğrudan
uygulanması. Call of Duty'yi zorlamak, projenin "boring/stable
technology" ilkesini (ADR-003) ihlal ederdi — şifre tabanlı, dökümente
edilmemiş bir entegrasyon, gelecekte "neden bu bir gecede kırıldı"
sorusuna sebep olacak türden bir teknik borç.

## Sonuçlar

- `GAME_IDS.DESTINY_2 = "destiny"`, `Game` tablosuna eklendi (seed.ts
  güncellendi, prod DB'ye ayrıca tek satır upsert ile eklendi — seed.ts
  DESTRUCTIVE, tüm tabloları siliyor, prod'a karşı ÇALIŞTIRILMADI).
- Uçtan uca doğrulandı: `/api/providers/health` → `destiny` `healthy: true`,
  gerçek cron sync → 13 gerçek event (platform status + 12 aktif
  raid/milestone, örn. "Vault of Glass", "King's Fall", "The Desert
  Perpetual"), `/games` sayfasında kart doğru render oluyor.
- `BUNGIE_API_KEY` local `.env` + Vercel production'a eklendi.
- Call of Duty backlog'da "değerlendirildi, reddedildi" olarak
  kayıtlı — resmi bir API çıkmadan yeniden gündeme gelmemeli.

---

# ADR-007: Ana Sayfadaki Sahte Veriler — Gerçek Veriyle Değiştirildi, Gerçek Unsubscribe Eklendi

Status: Accepted

Date: 2026-08-05

## Bağlam

Deniz iki somut, doğru tespit yaptı: (1) ana sayfadaki "ModeAlert
Dashboard" önizleme widget'ı URF'ü sabit olarak "LIVE" gösteriyordu —
gerçekte URF o an live olmayabilirdi, tamamen hardcoded bir mockup'tı.
(2) `/games` kartlarındaki "players tracking" sayıları (120K, 95K, 40K)
`prisma/seed/seed.ts`'te elle yazılmış sahte pazarlama rakamlarıydı,
gerçek watchlist verisiyle hiç bağlantısı yoktu. Bunları düzeltirken
aynı kategoriden üçüncü bir sorun bulundu: `/signin` sayfası "Unsubscribe
anytime" diye söz veriyordu ama hiçbir unsubscribe mekanizması yoktu —
tüm oturum boyunca avladığımız "yanlış vaat" bug'larının aynısı.

## Karar

1. **Ana sayfa önizleme widget'ı artık gerçek veri kullanıyor.**
   `Hero` component'i (`components/landing/hero.tsx`) async bir Server
   Component'e çevrildi, `eventQueryService.getAll()` ile gerçek
   event'leri çekip oyun başına en öncelikli durumdaki event'i
   (LIVE > UPCOMING > TRACKING) seçiyor, `DashboardPreview`'a prop
   olarak geçiyor. "Events currently monitored" sayısı da gerçek
   (ENDED olmayan event sayısı).
2. **Bu, ana sayfayı statik-ama-bayat yapardı — ISR eklendi.**
   Sayfa DB'ye doğrudan bağlandığı için Next.js onu build anında
   dondurup statik HTML'e gömüyordu (bir sonraki deploy'a kadar hiç
   değişmezdi). `app/page.tsx`'e `export const revalidate = 1800`
   eklendi — event'ler günde bir senkronize olduğu için 30 dakikalık
   pencere fazlasıyla yeterli, hâlâ CDN cache'inin performans
   avantajını koruyor.
3. **"Players tracking" artık gerçek.** `getTrackedUserCountsByGame()`
   (`lib/repositories/watchlist.repository.ts`) her oyun için gerçek,
   distinct kullanıcı sayısını (watchlist'e göre) hesaplıyor.
   `gameService.getAllGames()` bunu `Game.activeUsers` alanının
   yerine koyuyor — DB'deki seed değeri artık hiç okunmuyor.
   Sayılar şu an küçük (erken aşama, gerçek), bu bilinçli — sahte
   sosyal kanıt yerine dürüstlük tercih edildi.
4. **Gerçek unsubscribe mekanizması eklendi.** `User.emailOptOut`
   (migration `20260805145019_add_email_opt_out`). Her bildirim
   e-postasının altında imzasız, DB'de ayrı bir token tablosu
   gerektirmeyen bir link var: `HMAC-SHA256(userId, AUTH_SECRET)` ile
   üretilen bir token, `/api/unsubscribe?userId=&token=` — sabit
   zamanlı karşılaştırma (`timingSafeEqual`) ile doğrulanıyor, tahmin
   edilemez. `notification-trigger.service.ts` artık email göndermeden
   önce `emailOptOut` kontrolü yapıyor (in-app `Notification` kaydı
   etkilenmiyor — sadece email kanalı atlanıyor). `/unsubscribed`
   sayfası tek tıkla "resubscribe" seçeneği de sunuyor.
5. **Ana sayfadaki "Games" bölümü artık sadece gerçek provider'ı olan
   oyunları gösteriyor** (`GAMES_WITH_PROVIDER` filtresiyle) — Fortnite
   hâlâ `/games` sayfasında "Tracking coming soon" olarak görünüyor,
   sadece ana sayfa teaser'ından çıkarıldı (dikkat dağıtmasın diye).

## Gerekçe

Article I ve bu oturum boyunca tekrar eden tema: kullanıcıya (ve
arama motorlarına, ve şimdi de e-posta alıcılarına) yanlış bilgi
vermemek. Sahte "40K kullanıcı" rakamı klasik bir "dark pattern" —
gerçek olmayan sosyal kanıt. Unsubscribe vaadi verip mekanizma
kurmamak ise hem güven hem pratik bir sorun (e-posta teslim
edilebilirliği, spam şikayetleri — çoğu sağlayıcı unsubscribe linki
olmayan gönderenleri cezalandırır).

## Sonuçlar

- Yerel ortamda uçtan uca doğrulandı: ana sayfa gerçek event'leri
  gösteriyor (ör. "Destiny 2 — Root of Nightmares — LIVE"), `/games`
  gerçek sayıları gösteriyor (ör. "0 players tracking" — dürüst,
  erken aşama rakamı), unsubscribe/resubscribe döngüsü DB'yi doğru
  güncelliyor, geçersiz token reddediliyor.
- `SITE_URL` artık `lib/constants/site.ts`'te tek bir yerden geliyor
  (önceden `app/layout.tsx`, `app/robots.ts`, `app/sitemap.ts`'te ayrı
  ayrı tanımlıydı) — email linkleri de aynı sabiti kullanıyor.

---

# ADR-008: Hesap Ayarları Sayfası (`/dashboard/settings`)

Status: Accepted

Date: 2026-08-05

## Bağlam

Auth (Phase 7) tamamlandıktan sonra ortaya çıkan bir boşluk: giriş
yapmış bir kullanıcının hesabıyla ilgili hiçbir şeyi yönetebileceği
bir yer yoktu — email'ini göremiyor, Google/magic-link ile girenler
şifre ekleyemiyor, bildirim tercihini (yeni eklenen `emailOptOut`)
sadece email'deki unsubscribe linkinden değiştirebiliyordu, hesabını
silemiyordu. "Foolproof + mükemmel ürün" hedefi doğrultusunda Deniz'in
onayıyla eklendi.

## Karar

1. `/dashboard/settings` — `useRequireAuth` ile korunan, `/dashboard`
   altındaki diğer sayfalarla aynı desende bir sayfa.
2. Üç yeni API route: `GET/DELETE /api/account` (hesap bilgisi + silme),
   `PATCH /api/account/password` (şifre belirle/değiştir — mevcut
   şifre varsa doğrulanıyor, yoksa direkt set ediliyor), `PATCH
   /api/account/notifications` (`emailOptOut` toggle — unsubscribe
   linkiyle aynı alanı kullanıyor, iki mekanizma tutarlı).
3. **Hesap silme, şemadaki eksik bir cascade'i ortaya çıkardı.**
   `Account`/`Session`'da `onDelete: Cascade` vardı ama
   `Watchlist.user`/`Notification.user`'da yoktu — bir kullanıcıyı
   watchlist'i varken silmeye çalışmak foreign key hatasıyla
   patlardı. İkisine de `onDelete: Cascade` eklendi (migration
   `20260805152517_cascade_delete_user_data`).
4. E-posta hâlâ değiştirilemiyor (bilinçli — OAuth kimliğiyle bağlı,
   değişimi doğru yapmak ayrı bir doğrulama akışı gerektirir, şimdilik
   kapsam dışı).

## Sonuçlar

- Tarayıcıda uçtan uca doğrulandı: yanlış mevcut şifreyle red, doğru
  şifreyle güncelleme, bildirim toggle'ının DB'ye yansıması, hesap
  silmenin gerçek bir watchlist kaydını da (cascade ile) temizlediği
  ve silme sonrası doğru şekilde sign-out olup ana sayfaya
  yönlendirdiği.
- Navbar'daki kullanıcı adı/email'i artık `/dashboard/settings`'e
  link veriyor (masaüstü ve mobil drawer'da).

---

# ADR-009: Beşinci Oyun Provider'ı — TFT (Riot API), LoR/Wild Rift Denendi ve Reddedildi

Status: Accepted

Date: 2026-08-05

## Bağlam

Deniz para kazanma/monetization'ı şimdilik ertelemeyi, bunun yerine
oyun/event sayısını ve feature'ları artırmayı istedi ("site ücretsiz
olması normal, oyun ve event sayısını artırmamız lazım"). Aynı gün
içinde Riot dev API key'i tekrar expire olmuştu (24 saatlik bilinen
sınırlama) — Deniz yeni bir key verdi, bu hem mevcut Riot/Valorant
provider'larını düzeltti hem yeni Riot ailesi oyunları test etmeyi
mümkün kıldı.

Canlı key ile üç aday test edildi (kod yazmadan önce, doğrudan curl
ile):
- **TFT**: `tft/status/v1/platform-data` → **200 OK**, LoL'ünkiyle
  birebir aynı yapı ve auth (`X-Riot-Token`).
- **LoR** (Legends of Runeterra): `lor/status/v1/platform-data` →
  **403 Forbidden** — mevcut dev key ile erişim yok, ayrı bir ürün
  başvurusu gerekiyor.
- **Wild Rift**: denenen endpoint → **403 Forbidden** — bilinen
  herhangi bir public API'si yok.

## Karar

1. **TFT provider'ı eklendi** (`lib/providers/tft/`), Valorant/Destiny
   şablonuyla birebir aynı yapıda. Şu an sadece platform status
   (LoL/Valorant'taki gibi) — TFT'nin "set rotasyonu" gibi zengin bir
   ikinci veri kaynağı yok, canlı API'de doğrulanabilen bir şey
   bulunmadı. `RIOT_API_KEY`'i tekrar kullanıyor, yeni bir env var
   gerekmedi.
2. **LoR ve Wild Rift eklenmedi.** LoR için Deniz'in Riot Developer
   Portal'da ayrı bir ürün başvurusu yapması gerekiyor (onay süresi
   belirsiz) — talep gelirse yeniden değerlendirilir. Wild Rift için
   bilinen bir public API yolu yok, backlog'da "muhtemelen imkansız"
   olarak işaretlendi.
3. **Bu arada iki küçük "foolproof" eklentisi yapıldı** (aynı oturumda,
   ilişkili): markalı `app/not-found.tsx` ve `app/error.tsx` (önceden
   Next.js'in varsayılan, markasız hata sayfaları kullanılıyordu) ve
   `components/notifications/notification-settings.tsx` silindi (boş,
   0 satırlık bir stub — `/dashboard/settings` onun yerini çoktan
   almıştı, dururken kafa karıştırıcıydı).
4. **Pazarlama metni tekrar güncellendi** — bu oturumda daha önce
   "Fortnite" yerine "Destiny 2" yazan tüm yerler düzeltilmişti (3
   gerçek oyun); şimdi TFT eklenince aynı yerler tekrar güncellendi
   (FAQ, hero, `/features`, `/games`, `/live`, ana sayfa meta/JSON-LD,
   OG image) — 4 gerçek oyunu doğru sayıyor.

## Gerekçe

Article II ve "doğrulamadan yazma" — TFT eklenmeden önce gerçekten
çalıştığı canlı key ile doğrulandı, LoR/Wild Rift için de "olmuyor"
varsayılmadı, gerçekten denenip 403 alındı. Bu, ADR-006'daki Call of
Duty araştırmasıyla aynı disiplin.

## Sonuçlar

- Uçtan uca doğrulandı: `/api/providers/health` → `tft: healthy`,
  gerçek cron sync → gerçek "Platform Status" event'i, `/games` ve
  `/live` sayfalarında TFT kartı/satırı doğru render oluyor
  (`♟️` emoji fallback, `game-icon.tsx`'teki boyutlama düzeltmesi
  sayesinde düzgün görünüyor — react-icons/si'de TFT logosu yok).
- `GAMES_WITH_PROVIDER.size` artık 4 — ana sayfadaki stats bar
  ("Games tracked") otomatik olarak güncellendi, elle dokunulmadı.
- Riot dev key'in 24 saatte bir expire olma sorunu hâlâ çözülmedi —
  production key başvurusu backlog'da kalmaya devam ediyor.
- **Güncelleme (aynı gün):** Deniz `♟️`'nin kendi cihazında bozuk
  göründüğünü bildirdi — bu sembol Unicode'un "Miscellaneous Symbols"
  bloğundan, tek renkli/eksik glyph olarak render edilme riski diğer
  oyunlarda kullanılan tam-renkli emoji'lere (🚀, 🎯 vb.) göre çok daha
  yüksek. `🎲` (zar) ile değiştirildi — hem seed hem prod DB'de.

---

# ADR-010: Oyun Detay Sayfaları (`/games/[slug]`) — Geçmiş + Tahmin

Status: Accepted

Date: 2026-08-05

## Bağlam

Deniz her oyun için ayrı bir sayfa istedi — geçmişte event'lerin ne
zaman geldiğini ve tahmini ne zaman geleceğini gösteren. Kod tabanını
incelerken `lib/services/event-prediction.service.ts`'in **tamamen
implemente edilmiş** ama **hiçbir yerden çağrılmadığı** bulundu —
bu oturun boyunca beşinci veya altıncı kez karşılaşılan "yazılmış ama
bağlanmamış" örüntüsü (bildirim zili, dashboard, onboarding, provider
health, unsubscribe'dan sonra).

## Karar

1. `/games/[slug]` eklendi — `gameService.getBySlug()` (yeni,
   `Game.slug` üzerinden lookup) ile oyunu bulup
   `eventQueryService.getByGame()` ile tüm event'lerini çekiyor, her
   biri için `eventStatisticsService` (geçmiş: ilk görülme, kaç kez
   görüldü, ortalama süre) ve `eventPredictionService` (tahmini bitiş
   + güven skoru) paralel olarak hesaplanıyor.
2. `GameCard` artık `/games/[slug]`'a link veriyor (hem ana sayfadaki
   teaser'da hem `/games`'te).
3. **Yetersiz veri durumu dürüstçe gösteriliyor.** `eventPredictionService.predict()`
   sadece geçmişte en az bir kez tamamlanmış (endedAt dolu) bir kayıt
   varsa gerçek bir tahmin döndürüyor; yoksa `confidence: 0` ile
   "tahmin yok" durumuna düşüyor. Şu an event engine sadece
   2026-08-04'ten beri history tutuyor, yani her event "yeterli
   geçmiş verisi yok" mesajı gösteriyor — bu doğru ve beklenen, sahte
   bir tahmin uydurmak yerine.
4. `sitemap.ts` artık her oyunun detay sayfasını da içeriyor
   (`gameService.getAllGames()` ile dinamik olarak).

## Gerekçe

Article II ("yazılmış ama bağlanmamış" örüntüsünün her bulunduğunda
düzeltilmesi) ve bu oturun boyunca tekrar eden "sahte veri yerine
dürüst 'yeterli veri yok' mesajı" ilkesi (players tracking, dashboard
preview widget'ında olduğu gibi).

## Sonuçlar

- Uçtan uca doğrulandı: `/games/destiny-2` gerçek event'leri
  (Root of Nightmares, Platform Status, vb.) doğru sırayla (LIVE önce)
  gösteriyor, geçersiz slug 404 dönüyor, kart tıklaması doğru sayfaya
  gidiyor.
- JSX'te bir whitespace bug'ı bulundu ve düzeltildi: `{game.name} —`
  şeklinde bir ifadeden sonra yeni satırda başlayan metin, JSX'in
  satır-başı boşluk trim kuralı yüzünden boşluğu yutuyordu
  ("Destiny 2— current" gibi görünüyordu) — `{" "}` ile açıkça
  düzeltildi.

---

# ADR-011: Altıncı Oyun Provider'ı — Fortnite (fortnite-api.com), Kapsam Bilinçli Olarak Item Shop'la Sınırlandı

Status: Accepted

Date: 2026-08-05

## Bağlam

Deniz üç yeni oyun istedi: Fortnite, Apex Legends, Overwatch 2. Kod
yazılmadan önce bir subagent ile üçü de araştırıldı. Sonuç: Fortnite
için `fortnite-api.com` var — key gerektirmiyor, uzun süredir ayakta,
iyi dökümente. Ama LTM (limited-time mode) verisi güvenilir değil:
`/v1/playlists` 744 kayıt dönüyor (oyunun bugüne kadar var olan TÜM
playlist'leri, sadece şu an aktif olanlar değil) ve `isLimitedTimeMode`
alanı gerçek zamanlı hiçbir kayıtta `true` dönmüyor — yani "şu an aktif
LTM" sinyali olarak kullanılamaz, kanıtlanmadan varsayılmadı, gerçekten
istek atılıp kontrol edildi. Buna karşılık `/v2/shop` (item shop)
gerçek, güncel, doğrulanmış veri: her gün yenilenen `entries` listesi,
her item'ın kendi `inDate`/`outDate`'i var.

## Karar

1. **Fortnite provider'ı eklendi** (`lib/providers/fortnite/`), aynı
   5-dosya şablonu (client/types/constants/event-mapper/service/provider).
   Key gerekmiyor, `enabled: true` sabit (Valorant'taki keyless desenle
   aynı).
2. **Kapsam bilinçli olarak Item Shop'la sınırlı.** Tek event:
   `fortnite-item-shop`, başlık `Item Shop (N items)`, status hep
   `LIVE` — LoL'daki champion rotation ile birebir aynı desen (sabit id,
   içerik günlük değişiyor, "her zaman canlı ama içeriği değişen"
   event). LTM tracking'e GİRİŞİLMEDİ çünkü kaynak veri bunu
   desteklemiyor — sahte/güvenilmez bir "aktif LTM" listesi göstermek
   yerine dürüstçe tek, doğrulanmış sinyalle başlandı.
3. **`Game.supportedEvents` artık gerçek sayı.** Bu provider eklenirken
   fark edildi: `supportedEvents` hâlâ seed.ts'teki elle yazılmış
   sayıydı (ADR-007'de `activeUsers` için düzeltilen aynı sınıf hata,
   `supportedEvents` o zaman atlanmıştı). `lib/repositories/event.repository.ts`'e
   `getEventCountsByGame()` eklendi (`getTrackedUserCountsByGame()` ile
   aynı desen, `prisma.event.groupBy`), `game.service.ts` artık her
   oyun için gerçek event sayısını dönüyor.

## Gerekçe

ADR-006/ADR-009'daki "dökümente edilmiş kaynak, veri iddiasından önce
gerçekten doğrulanmış" disiplini. `isLimitedTimeMode` alanının var
olması yeterli değildi — gerçek istekle kontrol edilip güvenilmez
çıktı, bu yüzden kapsam dışı bırakıldı. Bu, oturun boyunca tekrarlanan
"sahte veri yerine dürüst, sınırlı ama gerçek veri" ilkesinin (ADR-007,
ADR-010) doğrudan uygulanması.

## Sonuçlar

- Uçtan uca doğrulandı: `/api/providers/health` → `fortnite`
  `healthy: true`, cron sync → 1 gerçek event kaydedildi, `/games/fortnite`
  "Item Shop (268 items)" — LIVE olarak gösteriyor, `/games`'te artık
  "Tracking coming soon" değil gerçek kart.
  `supportedEvents` düzeltmesi sonrası tüm oyunlarda sayılar gerçek
  (örn. Destiny 2: 13, LoL: 23, TFT: 1, Valorant: 3, Fortnite: 1) —
  seed.ts'teki eski elle yazılmış sayılar artık hiçbir yerde
  gösterilmiyor.
- `GAME_IDS.FORTNITE = "fortnite"` eklendi, `fortnite` Game satırı
  zaten seed.ts'te placeholder olarak vardı (id/slug/logo/color aynen
  kullanıldı), prod DB'de zaten mevcuttu.
- Apex Legends ve Overwatch 2 bu ADR'a dahil değil — bkz. ADR-012
  (Overwatch 2 reddedildi) ve backlog (Apex, Deniz'in
  apexlegendsapi.com'da Discord ile key alması bekleniyor).

---

# ADR-012: Overwatch 2 Reddedildi — Resmi/Güvenilir Bir API Yok

Status: Rejected

Date: 2026-08-05

## Bağlam

Deniz'in istediği üç yeni oyundan biri Overwatch 2'ydi. Araştırma
(subagent ile): Blizzard'ın OW2 event/sezon takvimi için hiçbir resmi
public API'si yok — eski topluluk API'leri yıllar önce kapatıldı.
Bilinen güvenilir/aktif bakımı yapılan bir topluluk JSON kaynağı da
yok. Gerçekçi tek alternatifler: (1) sezon tarihlerini elle/statik
girip periyodik güncellemek, ya da (2) Blizzard'ın haber/patch notu
RSS'ini scrape etmek.

## Karar

Overwatch 2 provider'ı **eklenmedi**. Deniz'e iki seçenek sunuldu
(reddet vs. statik takvim dene), Deniz reddi seçti.

## Gerekçe

Bu durum ADR-006'daki Call of Duty red kararıyla birebir aynı profil:
resmi API yok, dökümente edilmemiş/kırılgan bir workaround'a bağımlı
kalmak gerekiyor. Statik takvim seçeneği de reddedildi çünkü projenin
"sahte veri yok" ilkesine (ADR-007, ADR-010, ADR-011) aykırı — elle
girilen tarihler bayatlar ve gerçek zamanlı değildir, ki bu tam olarak
bu oturun boyunca tekrar tekrar düzeltilen hata sınıfı.

## Sonuçlar

- Overwatch 2 backlog'da "değerlendirildi, reddedildi" olarak kayıtlı
  — Call of Duty gibi, resmi bir API çıkmadan yeniden gündeme
  gelmemeli.
- Hiçbir kod değişikliği yapılmadı, hiçbir placeholder `Game` satırı
  eklenmedi.

---

# ADR-013: Yedinci Oyun Provider'ı — Warframe (warframestat.us), Key Gerektirmeyen Kaynaklar İçin Genel Tarama

Status: Accepted

Date: 2026-08-06

## Bağlam

Deniz'in isteği somut ve genişletilebilir bir kural olarak geldi: key
almak için kayıt gerektirmeyen HER oyundan veri çek (Fortnite'ta
olduğu gibi). ADR-011'den beri değerlendirilmemiş, keyless adaylar
tarandı:

- **Warframe** — `api.warframestat.us`, Digital Extremes'in kendi
  worldstate feed'inin topluluk tarafından işletilen aynası, tamamen
  public, hiçbir key/kayıt yok. Gerçek istekle doğrulandı
  (`/pc` endpoint'i): `voidTrader` (Baro Ki'Teer, 2 haftada bir 48
  saatlik ziyaret — `activation`/`expiry` net), `nightwave`
  (aktif/intermission sezon durumu), `sortie` (günlük rotasyon,
  `boss`/`expired`), `archonHunt` (haftalık rotasyon) — hepsi net
  başlangıç/bitiş zaman damgalı, gerçek zamanlı, dökümente.
- **Guild Wars 2** (`api.guildwars2.com/v2`) değerlendirildi ve
  ERTELENDİ — `/v2/worldbosses` ve `/v2/build` key gerektirmeden
  çalışıyor, ama asıl ihtiyaç duyulan `/v2/events` endpoint'i gerçek
  istekte `503 {"text":"API not active"}` döndü (ArenaNet'in bilinen,
  uzun süredir çözülmemiş bir sorunu — worldboss/meta-event zamanlayıcı
  API'si aylardır kırık). Statik bir rotasyon tablosuna düşmek
  ADR-012'deki "sahte/bayat veri yok" ilkesini ihlal eder. `/v2/build`
  tek başına bir "event" değil, sadece oyun versiyon numarası —
  ModeAlert'in kapsamına girmiyor. API tekrar çalışır hale gelirse
  yeniden değerlendirilebilir.
- Apex Legends (key gerekiyor, ADR-011/backlog'da zaten "Deniz'in
  aksiyonu bekleniyor" olarak kayıtlı) ve Call of Duty/Overwatch
  2/LoR/Wild Rift (ADR-006/ADR-009/ADR-012'de reddedildi) bu taramaya
  dahil değil — hiçbiri keyless değil ya da zaten kapalı karar.

## Karar

1. **Warframe provider'ı eklendi** (`lib/providers/warframe/`), aynı
   5-dosya şablon (client/types/constants/event-mapper/service/provider),
   `enabled: true` sabit (Fortnite/Valorant'taki keyless desenle aynı).
2. **4 gerçek event map edildi**, hepsi net zaman damgalı:
   `warframe-void-trader` (LIVE/UPCOMING, `activation`/`expiry`
   aralığına göre), `warframe-nightwave` (LIVE/TRACKING, `active`
   flag'ine göre), `warframe-sortie` ve `warframe-archon-hunt`
   (LIVE, `expired` alanı `true` gelirse dışlanıyor). Alerts/invasions
   bilinçli olarak DIŞLANDI — çok sık değişen, düşük sinyal/gürültü
   oranlı veri, "3-4 net event" deseninin (Destiny milestone'ları,
   Fortnite item shop) dışına taşırdı.
3. Platform olarak `pc` sabitlendi (console/mobile cross-save'de birkaç
   saat geriden geliyor — `constants.ts`'te not edildi).

## Gerekçe

ADR-011'deki disiplinin aynısı: veri iddiasından önce gerçek istekle
doğrulama (`voidTrader`/`nightwave`/`sortie`/`archonHunt` hepsi canlı
veriyle kontrol edildi, alan isimleri ve null/false durumları elle
incelendi). GW2'nin bozuk `/v2/events` endpoint'i üzerine statik veri
koymak yerine dürüstçe ertelenmesi, ADR-012'nin Overwatch 2 kararıyla
aynı ilke.

## Sonuçlar

- `GAME_IDS.WARFRAME = "warframe"` eklendi (`lib/constants/games.ts`),
  provider registry'ye kaydedildi (`lib/providers/core/registry.ts`).
- `warframe` `Game` satırı `seed.ts`'e eklendi VE prod DB'ye ayrıca
  tek satır upsert ile eklendi (ADR-006'daki aynı yöntem — `seed.ts`
  DESTRUCTIVE olduğu için prod'a karşı çalıştırılmadı).
- Uçtan uca doğrulandı: provider gerçek 4 event döndü (Void Trader
  UPCOMING, Nightwave TRACKING, Sortie/Archon Hunt LIVE), bu 4 event
  `eventSyncService.sync()` ile prod DB'ye gerçekten yazıldı
  (`event-sync.service.ts` üzerinden, source-scoped).
- Marka ikonu yok — `react-icons/si` içinde `SiWarframe` bulunmuyor,
  `GameIcon` zaten emoji fallback'ine sahip (bkz. backlog "Destiny
  ikonu" düzeltmesi), 🌌 emoji kullanılıyor.
- GW2 backlog'a "ertelendi, `/v2/events` API'si düzelirse yeniden
  değerlendir" olarak eklendi.

---

# ADR-014: Sekizinci Oyun Provider'ı — Path of Exile (api.pathofexile.com), Kapsam Güncel Challenge League'le Sınırlandı

Status: Accepted

Date: 2026-08-06

## Bağlam

ADR-011/013'teki aynı keyless-tarama disiplini sürdürüldü. Grinding
Gear Games'in resmi `api.pathofexile.com` API'si tamamen public,
key/kayıt gerektirmiyor — sadece dökümantasyonda kibarlık olarak
açıklayıcı bir `User-Agent` isteniyor (zorunlu değil, `client.ts`'te
uygulandı).

`/leagues?type=main` endpoint'i gerçek istekle doğrulandı: 16 satır
dönüyor — her kalıcı lig (Standard/Hardcore/SSF/Ruthless) ve o anki
geçici challenge league'in Hardcore/SSF/Ruthless/NoParties/HardMode
varyantları dahil. Aynı sezonun 8 varyantı aynı `startAt`/`endAt`
tarihlerini paylaşıyor — sadece kendi `category.id`'si kendi `id`'sine
eşit olan tek satır (softcore, ana varyant) event olarak sürüldü,
diğerleri modifikatör olduğu için dışlandı. Gerçek istekte güncel
challenge league `"Allflame"` olarak döndü, `startAt` geçmişte ve
`endAt` null — yani LIVE.

## Karar

1. **PoE provider'ı eklendi** (`lib/providers/poe/`), aynı 5-dosya
   şablon (client/types/constants/event-mapper/service/provider),
   `enabled: true` sabit.
2. **Tek event map edildi**: `poe-current-league`, güncel challenge
   league'in başlangıç/bitiş zaman damgasına göre
   LIVE/UPCOMING/ENDED. Ladder/race event'leri (kısa süreli, ayrı
   uç noktalar gerektiren) bilinçli olarak DIŞLANDI — Warframe'deki
   alerts/invasions kararıyla aynı gerekçe: düşük sinyal, yüksek
   gürültü.
3. Marka ikonu yok — `react-icons/si` içinde PoE ikonu bulunmuyor,
   `GameIcon` emoji fallback'ine düşüyor, 🔥 kullanılıyor.

## Gerekçe

ADR-011/013'teki disiplinin aynısı: veri iddiasından önce gerçek
istekle doğrulama. 8 varyantı tek event'e indirgeme kararı, ham API
yanıtını elle inceleyip `category.id === id` eşleşmesinin canonical
softcore satırı işaretlediğini doğrulayarak alındı.

## Sonuçlar

- `GAME_IDS.PATH_OF_EXILE = "poe"` eklendi (`lib/constants/games.ts`),
  provider registry'ye kaydedildi (`lib/providers/core/registry.ts`).
- `poe` `Game` satırı `seed.ts`'e eklendi VE prod DB'ye ayrıca tek
  satır upsert ile eklendi (ADR-006/013'teki aynı yöntem — `seed.ts`
  DESTRUCTIVE olduğu için prod'a karşı çalıştırılmadı).
- Uçtan uca doğrulandı: provider gerçek 1 event döndü (`Allflame
  League`, LIVE), `eventSyncService.sync()` ile prod DB'ye gerçekten
  yazıldı (source-scoped, `source: "poe"`).

---

# ADR-015: Dokuzuncu Oyun Provider'ı — Helldivers 2 (api.helldivers2.dev), Sadece Major Order'lar

Status: Accepted

Date: 2026-08-06

## Bağlam

Aynı keyless-tarama disiplini sürdürüldü. Arrowhead'in Helldivers 2
için resmi bir public API'si yok, ama `api.helldivers2.dev` —
topluluğun oyunun kendi backend'ini (aynı Warframe worldstate.us
deseni) ayna gibi sardığı, key gerektirmeyen, yaygın kullanılan bir
proje — mevcut. Sadece kimlik amaçlı `X-Super-Client`/`X-Super-Contact`
header'ları istiyor (ileride `X-Super-Client` zorunlu olacak,
User-Agent kibarlığının HTTP header eşdeğeri — key değil).

`/api/v1/assignments` (Major Order/Personal Order) gerçek istekle
doğrulandı: şu anda 2 aktif emir dönüyor, ikisi de net bir
`expiration` zaman damgasıyla (`title`/`briefing` alanlarıyla
birlikte). `/api/v1/campaigns` de denendi ama gezegen bazında onlarca
satır dönüyor, sürekli değişen düşük sinyal/gürültü oranlı veri —
Warframe'deki alerts/invasions ve GW2'nin event feed'i kararlarıyla
aynı sınıf, kapsam dışı bırakıldı.

## Karar

1. **Helldivers 2 provider'ı eklendi** (`lib/providers/helldivers2/`),
   aynı 5-dosya şablon (client/types/constants/event-mapper/service/
   provider), `enabled: true` sabit.
2. **Aktif Major Order'ların tamamı map edildi** (genelde 1-2 tane),
   her biri `helldivers2-assignment-{id}` id'siyle, LIVE durumda.
   Başlangıç zaman damgası yok — sadece `expiration` — bu yüzden
   response'ta görünen her assignment tanım gereği LIVE; süresi
   dolunca bir sonraki response'ta düşer ve `eventSyncService`'in
   stale-event temizliği onu otomatik ENDED yapar (Warframe Sortie/
   Archon Hunt'takiyle aynı desen).
3. `title` alanı `${label}: ${briefing}` olarak birleştirildi,
   `briefing` 100 karakterde kesiliyor (bazı Major Order metinleri
   uzun paragraflar).
4. Marka ikonu yok — `react-icons/si` içinde Helldivers ikonu
   bulunmuyor, `GameIcon` emoji fallback'ine düşüyor, 🪖 kullanılıyor.

## Gerekçe

ADR-011/013/014'teki disiplinin aynısı: veri iddiasından önce gerçek
istekle doğrulama, gürültülü/çok-taneli uç noktaları (campaigns)
bilinçli olarak dışlama.

## Sonuçlar

- `GAME_IDS.HELLDIVERS_2 = "helldivers2"` eklendi
  (`lib/constants/games.ts`), provider registry'ye kaydedildi
  (`lib/providers/core/registry.ts`).
- `helldivers2` `Game` satırı `seed.ts`'e eklendi VE prod DB'ye
  ayrıca tek satır upsert ile eklendi (ADR-006/013/014'teki aynı
  yöntem — `seed.ts` DESTRUCTIVE olduğu için prod'a karşı
  çalıştırılmadı).
- Uçtan uca doğrulandı: provider gerçek 2 event döndü (bir MAJOR
  ORDER, bir STRATEGIC THREAT, ikisi de LIVE),
  `eventSyncService.sync()` ile prod DB'ye gerçekten yazıldı
  (source-scoped, `source: "helldivers2"`).

---

# ADR-016: Onuncu Oyun Provider'ı — Foxhole (war-service-live.foxholeservices.com), Tek Bir "Güncel Savaş" Event'i

Status: Accepted

Date: 2026-08-06

## Bağlam

Foxhole'un geliştiricisi Clapfoot, oyunun sürekli devam eden "World
Conquest" savaş durumunu resmi, key gerektirmeyen bir REST API
üzerinden yayınlıyor (`war-service-live.foxholeservices.com`) —
Warframe/Helldivers 2'nin aksine bu topluluk aynası değil, doğrudan
geliştiricinin kendi servisi. `/api/worldconquest/war` gerçek istekle
doğrulandı: `warNumber`, `winner`, `conquestStartTime`/
`conquestEndTime`/`resistanceStartTime` (epoch ms), `scheduledConquestEndTime`
alanlarıyla net bir tekil savaş durumu dönüyor (o an "War #137",
`winner: "NONE"`, `conquestEndTime: null` — yani LIVE).

## Karar

1. **Foxhole provider'ı eklendi** (`lib/providers/foxhole/`), aynı
   5-dosya şablon, `enabled: true` sabit.
2. **Tek event map edildi**: `foxhole-current-war`, `winner` ve
   `conquestEndTime`/`resistanceStartTime` alanlarına göre
   LIVE/TRACKING/ENDED (PoE'nin "current league" desenine çok yakın —
   epoch-ms zaman damgaları JS `Date`'e çevrildi).
3. Marka ikonu yok, ⚔️ emoji kullanılıyor.

## Gerekçe

ADR-011/013/014/015'teki disiplinin aynısı: veri iddiasından önce
gerçek istekle doğrulama. Bu sefer topluluk aynası bile değil,
doğrudan geliştiricinin kendi resmi endpoint'i — en güvenilir
kaynak sınıfı.

## Sonuçlar

- `GAME_IDS.FOXHOLE = "foxhole"` eklendi (`lib/constants/games.ts`),
  provider registry'ye kaydedildi (`lib/providers/core/registry.ts`).
- `foxhole` `Game` satırı `seed.ts`'e eklendi VE prod DB'ye ayrıca
  tek satır upsert ile eklendi (ADR-006/013/014/015'teki aynı yöntem
  — `seed.ts` DESTRUCTIVE olduğu için prod'a karşı çalıştırılmadı).
- Uçtan uca doğrulandı: provider gerçek 1 event döndü (`War #137`,
  LIVE), `eventSyncService.sync()` ile prod DB'ye gerçekten yazıldı
  (source-scoped, `source: "foxhole"`).

---

# ADR-017: PBE Aday Event Senkronizasyonu Tamamlandı — ve URF'ün Neden Hâlâ Yakalanamadığı

Status: Accepted

Date: 2026-08-06

## Bağlam

ADR-001, en erken sinyal kaynağı olarak CommunityDragon'ın `pbe`
patchline'ını belirlemiş ve şunu planlamıştı: PBE'de görülüp live'da
henüz olmayan bir event-hub girdisi "aday event" olarak
işaretlenecek. Ama ADR-001'in "Sonuçlar" bölümü bunu "ayrı bir
implementasyon görevi" olarak bıraktı — ve o görev hiç yapılmadı.
Gerçek kodda `communityDragonService.getEvents()` (yani
`eventSyncService.sync()`'e giden, DB'ye yazılan, dolayısıyla
onboarding/dashboard'da seçilebilir hale gelen tek yol) hep `live`
patchline'ına sabit kalmıştı. `pbe` patchline'ı sadece
`getCurrentStatus()` üzerinden `/live` sayfasının salt-görüntüleme
`pbeCandidates` listesine gidiyordu — hiçbir zaman bir `Event`
satırına dönüşmüyordu, dolayısıyla asla track edilebilir olmuyordu.

Deniz'in somut örneği URF'tü — ama gerçek isteklerle doğrulandı ki
**URF'ün buradan yakalanması zaten mümkün değil**, PBE/live farkı
düzeltilse bile:

- `event-hub.json` (hem `live` hem `pbe`) şu an sadece Season
  Pass/Battle Pass/Activity Center/Hall of Legends içeriğini
  kapsıyor (2026-08-06'da gerçek istekle: 21 girdi, hepsi bu
  tiplerden, ikisi arasında hiçbir fark yok). URF/Arena/ARAM Mayhem
  gibi rotasyonlu "featured game mode"lar bu feed'de HİÇ yok.
- `queues.json` (hem live hem pbe aynı) URF/ARURF dahil TÜM kuyruk
  tanımlarını (420 tane) döndürüyor — ama "şu an aktif mi" bilgisi
  yok, tıpkı reddedilen OpenDota/eski Fortnite playlists sorunuyla
  aynı sınıf (bkz. docs/09_BACKLOG.md). `isLimitedTimeQueue` alanı
  bile URF girdilerinde `false` geliyor, güvenilmez.
- LCU zaten ADR-001'de event keşfi için reddedilmişti.
- Riot'un "şu an rotasyonda olan featured mode" bilgisini public,
  keyless bir endpoint üzerinden sunduğu bilinen bir kaynak yok
  (WebSearch ile arandı, sonuç çıkmadı).

## Karar

1. **PBE aday event senkronizasyonu tamamlandı** —
   `communityDragonService.getPbeCandidateEvents()` eklendi
   (`normalizer.ts` → `mapPbeCandidates`), `pbe` ve `live`
   patchline'larını karşılaştırıp sadece PBE'de olanları döndürüyor.
2. **Ayrı bir provider olarak kaydedildi**: `communitydragon-pbe`
   (`lib/providers/communitydragon/pbe-provider.ts`) — aynı `lol`
   `gameId`'sine yazıyor ama farklı bir `source` ile, böylece
   confirmed-live event'lerle asla karışmıyor/üzerine yazmıyor.
   Event ID'leri `communitydragon-pbe-{eventId}`, başlık `(PBE
   Preview)` son ekiyle işaretleniyor.
3. **URF benzeri rotasyonlu mod tespiti kapsam dışı bırakıldı** —
   çözülebilir bir veri kaynağı yok. Bu ADR-012/013'teki "sahte veri
   koymaktansa dürüstçe ertelemek" ilkesiyle aynı.

## Gerekçe

Event-hub tabanlı PBE senkronizasyonu, ADR-001'in planladığı gerçek
bir iyileştirme (Season Pass/Battle Pass içeriği artık live'a
düşmeden görülebilecek) — o yüzden tamamlandı. Ama URF'ü
"çözülmüş" gibi göstermek yanlış olurdu; kullanıcıya yanlış bir
güvence vermek yerine, hangi veri kaynağının bunu neden
karşılamadığı burada net şekilde kayıt altına alındı.

## Sonuçlar

- Uçtan uca doğrulandı: gerçek istekle `communitydragonPbeProvider.getEvents()`
  çağrıldı, `eventSyncService.sync()` ile senkronize edildi — şu an
  PBE ile live birebir aynı olduğu için 0 aday event döndü (beklenen
  davranış, hata değil).
- `lib/providers/communitydragon/normalizer.test.ts`'e `mapPbeCandidates`
  testleri eklendi.
- Eğer ileride Riot/CommunityDragon rotasyonlu mod verisi için
  keyless bir kaynak sunarsa, bu ADR'a yeni bir provider olarak
  eklenmeli — bkz. docs/09_BACKLOG.md.

---

# ADR-018: Event.description Alanı — Her Event'e Gerçek Açıklama

Status: Accepted

Date: 2026-08-06

## Bağlam

Deniz'in geri bildirimi: onboarding'de bir event'i track etmeden
önce "bu ne, bir skin mi, ne bunlar" sorusuna cevap yoktu.
`components/cards/event-card.tsx`'teki "description" alanı aslında
`event.game.name`'i (oyun adını) gösteriyordu — event'in KENDİSİNİ
açıklamıyordu. Aynı geri bildirimde ikinci bir bulgu: `/`
landing page'indeki `DashboardPreview` mockup'ı, uzun bir event
başlığında (Helldivers 2'nin Major Order briefing'i) komşu kartların
üzerine taşıyordu — `truncate` class'ı vardı ama flex ata elemanlarda
`min-w-0` eksikti (klasik Tailwind/flexbox tuzağı), o yüzden hiç işe
yaramıyordu.

## Karar

1. **`Event.description` (nullable `String`) eklendi** — migration
   `20260806102457_add_event_description`. `ProviderEvent` tipine
   opsiyonel `description?: string` eklendi, `upsertEvent`
   repository fonksiyonu bunu persist ediyor.
2. **10 provider'ın tamamına gerçek açıklama eklendi**, hiçbiri
   uydurma değil — her biri kendi ham API verisinden türetildi:
   - PoE: API zaten `description` alanı döndürüyordu, hiç
     kullanılmıyordu — direkt bağlandı.
   - Destiny: Bungie milestone definition'larının
     `displayProperties.description` alanı vardı, `name` gibi
     `types.ts`'e eklenip kullanıldı.
   - Fortnite: shop entry'lerinin `brItems[].name` alanı vardı
     (`types.ts`'e eklendi) — "Featuring: X, Y, Z, and N more."
   - CommunityDragon: ham feed'de serbest metin açıklama YOK, sadece
     `eventHubType` (4 sabit değer: kSeasonPass/
     kActivityCenterMilestones/kHallOfLegends/kDemaciaPass) — bu
     küçük, sabit enum'dan okunabilir bir kategori etiketine çevrildi
     (uydurma değil, var olan bir alanın çevirisi).
   - Riot/Valorant/TFT platform status: durum bilgisinden (
     maintenance var/yok) türetilen bağlamsal cümle.
   - Warframe/Foxhole: worldstate/war-state alanlarından (activation/
     expiry, requiredVictoryTowns, winner) türetilen açıklama.
   - Helldivers 2: `briefing` alanı artık title'a değil description'a
     gidiyor — bu aynı zamanda taşma bug'ının kök nedenini çözüyor
     (title kısa "MAJOR ORDER" kalıyor, tam metin description'da).
3. **Layout bug düzeltildi**: `components/landing/dashboard-preview.tsx`'e
   `min-w-0`/`shrink-0` eklendi.
4. **UI'da gösterildi**: onboarding `EventCard`'ı artık gerçek
   description gösteriyor (oyun adı ayrı, küçük bir etiket olarak
   üstte kaldı); `/games/[slug]` sayfasında her event kartına
   description paragrafı eklendi; kompakt dashboard listesinde
   (`EventStatusCard`) layout'u bozmamak için `title` HTML attribute'u
   (native tooltip) olarak eklendi.

## Gerekçe

"Sahte veri yok" ilkesi (ADR-012) burada da geçerli: description'lar
ya API'de zaten var olan ama kullanılmayan bir alandan, ya da mevcut
alanlardan (durum, sayısal değerler, enum) türetilmiş bağlamsal
metinden geliyor — hiçbir provider için içerik uydurulmadı.

## Sonuçlar

- Uçtan uca doğrulandı: 10 provider'ın tamamı gerçek istekle
  çalıştırıldı, hepsi %100 description kapsamıyla prod DB'ye
  senkronize oldu (`Riot Games: 2/2`, `CommunityDragon: 21/21`,
  `Valorant: 3/3`, `Destiny 2: 13/13`, `TFT: 1/1`, `Fortnite: 1/1`,
  `Warframe: 4/4`, `PoE: 1/1`, `Helldivers 2: 2/2`, `Foxhole: 1/1`).
- Tarayıcıda görsel olarak doğrulandı: onboarding event kartları,
  `/games/helldivers-2` (artık taşma yok), `/dashboard` (kompakt
  liste de taşmıyor).
- `npx tsc --noEmit`, `npx eslint .`, `npx vitest run` (53 test),
  `npx next build` hepsi temiz.

---

# ADR-019: OLAY — `prisma migrate dev` Prod DB'yi Sıfırladı; Artık Sadece `migrate deploy` Kullanılacak

Status: Accepted (Incident Postmortem)

Date: 2026-08-06

## Ne oldu

`Event.slug` alanı eklenirken `npx prisma migrate dev --name
add_event_slug` çalıştırıldı. Komut, yeni unique index'in
(`Event_slug_key`) teorik olarak başarısız olabileceğine dair bir
uyarı verdi ve interaktif onay istedi. Terminal non-interactive
olduğu için komut "Prisma Migrate has detected that the environment
is non-interactive" hatasıyla durdu — ama **bu hatadan önce,
arka planda veritabanını resetlemişti**. Proje tek bir paylaşılan
Neon DB kullanıyor (local `.env` = Vercel production, ayrı bir dev
DB yok — bkz. CLAUDE.md), yani bu reset **doğrudan canlı veritabanını
sıfırladı**: tüm `User`/`Account`/`Session`/`Watchlist`/
`Notification`/`Game`/`Event` satırları silindi, `/api/games` canlıda
`[]` döndü.

Kök neden: `_prisma_migrations` tablosunun o an tutarsız/eksik bir
durumda olması + `migrate dev`'in "drift" tespit ettiğinde
(migration history ile şema uyuşmadığında) interaktif onaydan ÖNCE
resetleme adımını deneyebilmesi. Bu proje bağlamında `migrate dev`
hiçbir zaman güvenli değil çünkü **local ortam = prod ortam**.

## Kurtarma

Deniz, Neon Console'dan **point-in-time restore** ile veritabanını
olay öncesi bir ana (13:30) geri aldı. Restore noktası
`add_event_description` migration'ından sonra ama description'ların
gerçek veriyle senkronize edildiği andan önceydi — restore sonrası
tüm provider'lar tekrar çalıştırılıp (`eventSyncService.sync`)
description'lar yeniden dolduruldu. Kullanıcı hesapları/watchlist/
session verisi restore ile tam olarak geri geldi (3 user, 23
watchlist — hiçbiri kayıp değil). `slug` migration'ı, bu sefer
aşağıdaki güvenli yöntemle sorunsuz uygulandı.

## Karar — Bundan sonra ŞEMA DEĞİŞİKLİĞİ İÇİN TEK YÖNTEM

**`prisma migrate dev` bu projede BİR DAHA ASLA çalıştırılmayacak.**
Yerine:

1. `schema.prisma`'yı düzenle.
2. SQL diff'i üret (hiçbir şeye dokunmaz, sadece SQL yazdırır):
   ```
   npx prisma migrate diff \
     --from-migrations prisma/migrations \
     --to-schema-datamodel prisma/schema.prisma \
     --shadow-database-url "$DATABASE_URL_UNPOOLED" \
     --script
   ```
3. Çıktıyı elle oku — yıkıcı bir şey var mı (DROP COLUMN, DROP TABLE,
   NOT NULL'a çeviren bir ALTER, vb.) kontrol et.
4. `prisma/migrations/<timestamp>_<isim>/migration.sql` dosyasını
   elle oluştur, SQL'i oraya yapıştır.
5. `npx prisma migrate deploy` ile uygula — bu komut SADECE bekleyen
   migration'ları sırayla uygular, asla reset/drift-resolve yapmaz,
   interaktif onay istemez. Bu proje için tek güvenli uygulama yolu.
6. `npx prisma generate` ile client'ı yenile (Windows'ta dev server
   çalışıyorsa dll kilitlenip `EPERM` verebilir — önce durdur).

## Gerekçe

`migrate dev` "geliştirme deneyimi" için tasarlanmış ve gerektiğinde
sessizce/yarı-sessizce resetleyebilen bir araç — ayrı bir dev
veritabanı olduğu varsayımıyla güvenli. Bu projede öyle bir ayrım
yok, o yüzden `migrate dev`'in HİÇBİR kullanımı güvenli kabul
edilmemeli. `migrate deploy` ise tam olarak "production'a uygula"
senaryosu için var: additive-only, non-interactive, reset yapmaz.

## Sonuçlar

- Bu ADR, gelecekteki her oturum için CLAUDE.md'nin "Kritik Mimari
  Kurallar" bölümüne taşındı (oradan HER ZAMAN okunuyor) — sadece
  burada kalırsa yeterince görünür olmaz.
- `Event.slug` migration'ı (`20260806104809_add_event_slug`) yukarıdaki
  güvenli yöntemle başarıyla uygulandı, veri kaybı olmadı.

---

# ADR-020: LoL Event-Hub Gürültüsü Filtrelendi — ADR-017'nin Gözden Kaçırdığı Mayhem Girdileri

Status: Accepted

Date: 2026-08-06

## Bağlam

Deniz'in geri bildirimi: LoL event listesinde "dummy" çok fazla şey
var, gerçekten oynanan event'lere bakılmalı; ayrıca diğer oyunların
(LoL/Valorant/Fortnite/Destiny dışındakilerin) icon'ları "çalışmıyordu."

Gerçek event-hub verisi (`raw.communitydragon.org/latest/.../event-hub.json`,
2026-08-06'da 21 girdi) incelendiğinde iki gerçek sorun bulundu:

1. **"Classic Player Level" ve "Classic Voting Power"** — `endDate`
   `2099-12-30T00:00:00Z`. Bu gerçek bir event değil, Classic modun
   kalıcı bir hesap özelliği (seviye/oy gücü takibi) — event-hub'a
   yanlışlıkla karışmış, sonsuza kadar LIVE görünüyordu.
2. **"Mayhem Progression Track" / "Mayhem Set 2"** (`kSeasonPass`) —
   **ADR-017'nin "URF/Arena/ARAM Mayhem gibi rotasyonlu modlar bu
   feed'de HİÇ yok" tespiti eksikti** — bu ikisi feed'de gerçekten
   var, sadece jenerik "Season pass" açıklamasıyla gizlenmiş
   (başlıkta "Mayhem" geçtiği için o oturumda gözden kaçmış). Ama
   ADR-017'nin asıl sonucu hâlâ doğru: bu girdiler "Mayhem şu an
   rotasyonda" demiyor, sadece o moda bağlı ~4 aylık battle pass
   penceresinin açık olduğunu söylüyor — modun bugün gerçekten
   oynanabilir olup olmadığına dair hâlâ güvenilir bir sinyal yok.
   4 ay boyunca LIVE göstermek, "URF/Mayhem şu an açık" gibi yanlış
   bir izlenim veriyordu.

Icon tarafında gerçek bir render hatası yoktu (DOM'da doğru SVG/emoji
vardı), ama emoji fallback'i (🌌🔥🎲🪖⚔️) bazı ortamlarda (özellikle
Windows font substitution) düzgün render olmuyor/tanınmıyor —
LoL/Valorant/Fortnite/Destiny'nin gerçek marka SVG'leri varken
diğerlerinin sadece emoji olması zaten tutarsızdı.

## Karar

1. **`lib/providers/communitydragon/normalizer.ts`** — `isTrackableEntry()`
   filtresi eklendi, üç export'ta da (`normalizeEventHub`,
   `mapPbeCandidates`, `toDisplayEvents`) uygulanıyor:
   - `endDate` yılı ≥2090 olan girdiler atlanıyor (kalıcı özellik,
     event değil).
   - Başlığında "Mayhem"/"URF"/"Arena" geçen girdiler atlanıyor
     (isimle eşleşen sabit liste — bu dosyanın zaten kullandığı
     `EVENT_HUB_TYPE_LABELS` gibi açık/hardcoded stil).
   - Var olan "source artık raporlamıyorsa event'i ENDED yap"
     pipeline'ı (ADR-002) sayesinde ekstra kod gerekmeden, bir sonraki
     sync'te bu 4 event otomatik ENDED oldu — gerçek istekle
     doğrulandı (`saved: 21` → `saved: 17`, 4 event DB'de ENDED).
2. **`components/shared/game-brand-icons.tsx`** — TFT/Warframe/PoE/
   Helldivers 2/Foxhole için react-icons/gi'den tematik SVG ikonlar
   eklendi (resmi marka SVG'si yok, ama emoji fallback'inden daha
   güvenilir): `GiChessKnight`, `GiRobotHelmet`, `GiHoodedFigure`,
   `GiSpartanHelmet`, `GiTrenchSpade`. Artık 9 oyunun 9'u da gerçek
   SVG ikonla render oluyor, emoji fallback'e düşen yok.

## Gerekçe

Sahte/yanıltıcı veri göstermektense dürüstçe filtrelemek — ADR-012/
ADR-017 ile aynı ilke. "Mayhem" gibi rotasyonlu modların gerçek
"şu an oynanabilir mi" durumu hâlâ bilinmiyor (ADR-017'nin sonucu
değişmedi), ama en azından artık yanlışlıkla LIVE göstermiyoruz.

## Sonuçlar

- `lib/providers/communitydragon/normalizer.test.ts`'e sentinel-tarih
  ve rotasyonlu-mod-adı testleri eklendi (9/9 test geçiyor).
- Gerçek sync ile doğrulandı: LoL LIVE event sayısı 21→17'ye düştü,
  4 event (Classic Player Level, Classic Voting Power, Mayhem
  Progression Track, Mayhem Set 2) DB'de ENDED durumuna geçti.
- Champion Rotation kasıtlı olarak dokunulmadı — Deniz "önemli değil"
  dedi ama bu gerçek, kullanılan veri (dashboard/`/live`'da referans
  alınıyor); kaldırmak ayrı bir ürün kararı, bu ADR'ın kapsamı değil.

---

# ADR-021: `/admin` — Şema Değişikliği Olmadan Basit Email-Listesi Gate

Status: Accepted

Date: 2026-08-06

## Bağlam

P1 — Admin backlog kalemi (Manual Sync, Provider Status, vb.) hiç
başlanmamıştı. İlk admin-only sayfa olduğu için, projede daha önce
hiç var olmayan bir "kim admin" kavramı gerekiyordu — `User`
modelinde `role` alanı yok.

## Karar

1. **Şema değişikliği yapılmadı.** `ADMIN_EMAILS` (virgülle ayrılmış
   email listesi, `lib/config/env.ts`) + `lib/auth/is-admin.ts`
   (`isAdminEmail()`, case-insensitive) ile basit bir gate kuruldu.
   Tek admin şu an `denizate@gmail.com`, `.env`'de tanımlı.
2. **`/admin` sayfası `notFound()` döndürüyor**, redirect/403 değil —
   admin olmayan biri için sayfa hiç var olmamış gibi davranıyor,
   "buraya erişimin yok" bilgisini bile sızdırmıyor.
3. **`POST /api/admin/sync`, `CRON_SECRET`'tan ayrı, session+admin
   gate'li yeni bir endpoint** — `/api/cron/sync` zaten var ama
   Vercel Cron için `CRON_SECRET` bearer token'ıyla korunuyor; bu
   secret'ı tarayıcıya/client JS'e taşımak güvenlik açığı olurdu.
   Yeni endpoint aynı `providerSyncService.syncAll()`'u çağırıyor,
   sadece farklı bir yoldan (oturum) korunuyor.
4. **"Clear Cache" ve "Rebuild Data" kasıtlı olarak yapılmadı** — cache
   katmanı yok (buton dekorasyon olurdu), "rebuild" ise neyin neyden
   yeniden kurulacağı tanımsız/riskli bir aksiyon; Deniz'den somut bir
   tanım gelmeden yazılmadı. "Logs" da aynı sebeple yapılmadı — Vercel
   serverless log'ları geçici, kalıcı bir log görüntüleyici ayrı bir
   altyapı işi.

## Gerekçe

`role` alanı eklemek gelecekte gerçek bir ihtiyaç olabilir (çoklu
admin, farklı yetki seviyeleri), ama şu an tek kullanıcı (Deniz) için
bunun için migration riskine girmek (ADR-019) gereksiz. Env-var gate
şu anki ihtiyacı tam karşılıyor, geri dönüşü kolay (env var
değiştirmek, migration değil).

## Sonuçlar

- Gerçek istekle doğrulandı: `/admin` oturumsuz istekte 404, `POST
  /api/admin/sync` oturumsuz istekte 401 döndürüyor.
- `lib/auth/is-admin.test.ts` eklendi (case-insensitivity, çoklu
  email, null/undefined — 4/4 geçiyor).
- **Deniz'in yapması gereken:** `ADMIN_EMAILS=denizate@gmail.com`
  Vercel production environment variables'a eklenmeli — şu an sadece
  local `.env`'de var, canlıda `/admin` şu anki haliyle herkese
  (admin dahil) 404 döner.

---

# ADR-022: OLAY #2 — ADR-019'un "Güvenli" Adım 2'si de Prod DB'yi Sıfırladı

Status: Accepted (Incident Postmortem)

Date: 2026-08-06

## Ne oldu

`/statistics`'teki "Provider uptime" boşluğunu kapatmak için yeni bir
`ProviderHealthCheck` tablosu eklerken, ADR-019'un tam olarak
belgelediği "güvenli" süreç izlendi:

1. `schema.prisma`'ya model eklendi.
2. **Adım 2:** `npx prisma migrate diff --from-migrations
   prisma/migrations --to-schema-datamodel prisma/schema.prisma
   --shadow-database-url "$DATABASE_URL_UNPOOLED" --script` çalıştırıldı
   — ADR-019'da "hiçbir şeye dokunmaz" diye belgelenmiş adım.
3. SQL üretildi (temiz, sadece `CREATE TABLE`/`CREATE INDEX`),
   migration dosyasına yapıştırıldı.
4. `npx prisma migrate deploy` çalıştırıldı → `P3005: database schema
   is not empty` hatası verdi.
5. Hata sonrası kontrol edilince: **`User`/`Event`/`Game`/`Watchlist`/
   `Notification`/`EventHistory`/`Account`/`Session` tablolarının
   HEPSİ 0 satır** — tablo yapıları (Event.slug dahil) güncel ve
   duruyordu, ama tüm veri silinmişti. `_prisma_migrations` tablosu
   da tamamen yok olmuştu.

## Kök neden

`DATABASE_URL_UNPOOLED`, `DATABASE_URL` ile **aynı** Neon
veritabanını gösteriyor — sadece pooled değil, direkt bağlantı.
ADR-019'un "adım 2 hiçbir şeye dokunmaz" varsayımı, `--shadow-
database-url`'in her zaman ayrı/boş bir veritabanı olduğu öncülüne
dayanıyordu — ama bu projede öyle bir DB hiç kurulmamıştı, aynı DB
verilmişti. Prisma'nın shadow-database mekanizması: migration
geçmişinden şemayı yeniden inşa etmek için verilen URL'i "boş,
harcanabilir" kabul edip resetler/yeniden oluşturur. Aynı DB
verilince, bu resetleme doğrudan production'a uygulandı — tablo
yapıları migration'lardan yeniden kurulduğu için güncel görünüyordu,
ama tüm satırlar (ve migration bookkeeping'in kendisi) gitmişti.

Yani: **ADR-019'un çözümü tamamlanmamıştı.** `migrate dev`'i
yasaklamak doğruydu ama "güvenli alternatif" olarak önerilen adım da
aynı sınıfta bir riskti — sadece daha az bilinen bir yoldan.

## Kurtarma

Deniz, olayı fark ettikten (~14:46 UTC / 17:46 TR) hemen sonra Neon
Console'dan point-in-time restore ile veritabanını **17:30 TR
(14:30 UTC)** anına geri aldı — olaydan önceki bir nokta. Doğrulandı:
tüm sayılar tam (3 user, 49 event, 9 game, 23 watchlist, 6
notification, 33 event history, aynı gün içindeki `Event.slug`
backfill'i dahil), `_prisma_migrations` 7 migration'la sağlıklı
durumda. Hiçbir veri kaybı olmadı.

`ProviderHealthCheck` migration'ı hiç uygulanmamıştı (deploy P3005
ile hata verip durdu) — `schema.prisma`'dan geri alındı, oluşturulan
migration klasörü silindi. Bu özellik bu ADR kapsamında yapılmadı,
aşağıdaki düzeltilmiş süreçle yeniden ele alınmalı.

## Karar — Düzeltilmiş süreç

**`prisma migrate diff --shadow-database-url` artık YASAK**, ta ki
Deniz gerçekten ayrı bir Neon database/branch kurup connection
string'ini verene kadar. Yerine: migration SQL'i elle yazılacak
(additive değişiklikler için — yeni tablo/sütun/index — bu SQL basit
ve mevcut migration dosyalarından örneklenebilir), sonra doğrudan
`migrate deploy` ile uygulanacak. Ayrıca: **deploy'dan hemen önce ve
sonra birkaç ana tablonun satır sayısı kontrol edilecek** — beklenmedik
bir reset anında yakalansın. Tam güncellenmiş süreç: CLAUDE.md →
"ŞEMA DEĞİŞİKLİĞİ KURALI".

## Gerekçe

İki olay da aynı kök nedenden geliyor: bu projede gerçek bir dev/
shadow veritabanı yok, ve Prisma'nın "development"/"shadow" araçları
bunu varsayıyor. Elle SQL yazmak bu varsayımı tamamen ortadan
kaldırıyor — Prisma'nın hiçbir arka plan DB-reset mekanizmasına
güvenmiyoruz, sadece `CREATE`/`ALTER ADD` gibi additive, insan
tarafından doğrulanmış SQL'i doğrudan `migrate deploy` ile
uyguluyoruz.

## Sonuçlar

- CLAUDE.md "ŞEMA DEĞİŞİKLİĞİ KURALI" bölümü güncellendi — olay #2
  ve düzeltilmiş 7 adımlık süreç eklendi.
- **`ProviderHealthCheck` düzeltilmiş süreçle aynı oturumda tekrar
  denendi ve başarılı oldu.** Elle yazılan SQL doğrudan `migrate
  deploy` ile uygulandı, `migrate diff` hiç çağrılmadı. Deploy'dan
  hemen önce ve sonra 8 ana tablonun satır sayısı doğrulandı (hepsi
  birebir aynı: 3 user, 49 event, 9 game, 23 watchlist, vb.), yeni
  tablo 0 satırla boş başladı. Gerçek bir sync tetiklenip 11
  provider'ın hepsi için gerçek health-check kaydı oluştuğu, `/statistics`
  sayfasında uptime %'nin göründüğü doğrulandı. Bkz. docs/09_BACKLOG.md
  P1 — Statistics / Health Monitoring.
- Deniz'e gerçek bir Neon shadow database/branch kurması hâlâ önerilir
  — kurulursa `migrate diff` güvenle tekrar kullanılabilir hale gelir;
  o zamana kadar elle SQL yazmak tek yöntem.

---

# ADR-023: Event.category Alanı — Gerçekten Oynanan Event'i Gürültüden Ayırmak, URF'ü Dürüstçe Geri Getirmek

Status: Accepted

Date: 2026-08-12

## Bağlam

Deniz'in geri bildirimi: takip edilen event listesinde kimsenin
oynamadığı bir sürü "salak" event var (Platform Status, Champion
Rotation gibi her zaman LIVE görünen, oyuncu için anlamsız satırlar);
her event'in bir kategorisi olmalı (playable, season vb.); onboarding'de
kullanıcı bunları kategoriye göre filtreleyebilmeli, örnekleriyle
birlikte; ve gerçekten oynanan event'ler ended olsa bile listenin
başında görünmeli — hem onboarding'de hem anasayfada.

Ayrıca özel olarak: LoL seçildiğinde URF'ün en başta görünebilmesi
gerektiğini belirtti. Bu, ADR-017/ADR-020'nin vardığı sonuçla doğrudan
çelişiyordu — URF/Arena/Mayhem'in şu an rotasyonda olup olmadığına dair
hiçbir güvenilir API sinyali yok, bu yüzden bu üç modun event-hub'daki
season-pass-penceresi girdisi (`kSeasonPass`, başlıkta "Mayhem"/"URF"/
"Arena" geçen) normalizer'da tamamen filtreleniyordu. Deniz'e bu çelişki
soruldu (bkz. bu oturumun başındaki AskUserQuestion): cevap — "URF her
türlü görünebilmeli, en önemli parçalardan biri bu." Önerilen çözüm
(dürüst "Season/Battle Pass" kategorisi, LIVE/oynanabilir iddiası değil)
onaylandı.

## Karar

1. **`lib/constants/event-category.ts`** (yeni) — 5 sabit kategori:
   `PLAYABLE`, `SEASON_PASS`, `ROTATION_MILESTONE`, `COSMETIC_SHOP`,
   `PLATFORM_STATUS`. Her biri için öncelik sırası
   (`EVENT_CATEGORY_PRIORITY`), etiket ve örnek metni, ve tek bir
   `categorySortKey(category, statusPriority)` fonksiyonu — kategori
   önceliği status'u her zaman domine edecek şekilde ağırlıklandırılmış
   (`categoryPriority * 10 + statusPriority`). Bu, "gerçekten oynanan
   event ended olsa bile önce gelsin" kuralını tek bir yerde kodluyor.
2. **`Event.category` sütunu** — additive migration
   (`20260812063724_add_event_category`, `ADD COLUMN ... DEFAULT
   'PLAYABLE'`), CLAUDE.md'nin elle-SQL sürecine göre uygulandı; deploy
   öncesi/sonrası 4 ana tablonun satır sayısı doğrulandı (51 event, 4
   user, 23 watchlist, 36 history — birebir aynı).
3. **`ProviderEvent.category` zorunlu alan** oldu — 10 provider'ın
   `event-mapper`/`normalizer` dosyalarının hepsi güncellendi:
   - `PLAYABLE`: CommunityDragon'ın bilinmeyen/varsayılan event-hub
     girdileri, Hall of Legends, Activity Center Milestones, PoE lig,
     Helldivers 2 Major Order, Foxhole savaşı — oyuncunun fiilen
     içinde olduğu şeyler.
   - `SEASON_PASS`: kSeasonPass/kDemaciaPass event-hub girdileri
     (gerçek sezon geçişleri: Season 1-3, Spirit Blossom, Welcome to
     Noxus — gerçek sync'te doğrulandı), Valorant Act, Warframe
     Nightwave.
   - `ROTATION_MILESTONE`: Champion Rotation, Destiny haftalık
     milestone'lar, Warframe Void Trader/Sortie/Archon Hunt.
   - `COSMETIC_SHOP`: Fortnite Item Shop.
   - `PLATFORM_STATUS`: Riot/Valorant/TFT/Destiny platform status.
4. **URF/Arena/Mayhem artık gizlenmiyor.**
   `lib/providers/communitydragon/normalizer.ts`'teki
   `ROTATING_MODE_TITLE_MATCHES` filtresi kaldırıldı (sentinel-tarih
   filtresi — 2099 gibi kalıcı özellikler için — kaldı). Bu üç modun
   season-pass girdisi artık `SEASON_PASS` kategorisiyle, açıklamasında
   dürüstçe "This is the battle-pass window only — whether the mode
   itself is in rotation today isn't something Riot exposes a reliable
   signal for yet" notuyla geri geldi. ADR-017'nin asıl teknik sonucu
   değişmedi (hâlâ "şu an rotasyonda mı" sinyali yok) — değişen, bunu
   nasıl sunduğumuz: tamamen gizlemek yerine, doğru kategori ve dürüst
   açıklamayla göstermek.
5. **Onboarding** (`components/onboarding/event-selector.tsx`) — üstte
   5 kategori filtre kartı, her biri örnek event isimleriyle;
   varsayılan tüm kategoriler seçili; event listesi `categorySortKey`
   ile sıralanıyor (ended bir PLAYABLE/SEASON_PASS event, LIVE bir
   PLATFORM_STATUS'un önüne geçiyor).
6. **Dashboard** (`watching-list.tsx`) — mevcut LIVE/UPCOMING/TRACKING/
   ENDED bölümleme korundu, her bölüm içinde artık kategoriye göre de
   sıralanıyor.
7. **Homepage** (`components/landing/hero.tsx`) — oyun başına "en iyi"
   event seçimi artık salt status'a değil `categorySortKey`'e göre
   yapılıyor; ended bir PLAYABLE event artık LIVE bir Platform
   Status'u geçebiliyor (önceden ENDED event'ler bu seçimden tamamen
   hariç tutuluyordu).
8. **`app/games/[slug]/page.tsx`** — aynı `categorySortKey` sıralaması,
   artı her event satırında kategori rozeti.
9. Kart bileşenlerine (`EventCard`, `EventStatusCard`) kategori rozeti
   eklendi — her event'in kategorisi artık her zaman görünür.

## Yan temizlik

`lib/providers/riot/normalizer.ts` + testi silindi — sıfır çağıran,
"yazılmış ama bağlanmamış" kalıbının bir örneği daha (bkz.
docs/09_BACKLOG.md Technical Debt), yeni zorunlu `category` alanıyla
uyumlu hale getirmek yerine kaldırıldı. `RiotEventResponse`/
`RiotEventsResponse` tipleri de aynı sebeple `types.ts`'ten kaldırıldı.

## Gerekçe

Sahte/yanıltıcı veri göstermektense dürüstçe göstermek — ADR-012/
ADR-017/ADR-020 ile aynı ilke — ama bu sefer "gizle" değil "doğru
etiketle göster" kararı verildi, çünkü Deniz bu event'lerin ürün için
gerçekten önemli olduğunu belirtti. Kategori sistemi hem bu isteği hem
"gürültüyü azalt" isteğini tek bir mekanizmayla çözüyor: aynı öncelik
sıralaması hem "önemli event'i öne çıkar" hem "önemsiz event'i geriye
it" sonucunu veriyor.

## Sonuçlar

- 70/70 test geçti (`npx vitest run`), `npx tsc --noEmit` ve `npm run
  build` temiz.
- Gerçek sync ile doğrulandı: LoL'de "Mayhem Set 2" artık LIVE +
  SEASON_PASS olarak görünüyor (önceden tamamen filtreleniyordu),
  gerçek sezon geçişleri (Season 1-3, Spirit Blossom Beyond, Welcome to
  Noxus) doğru şekilde SEASON_PASS, Hall of Legends/Swain's Hot Chicken
  gibi tek seferlik gerçek event'ler PLAYABLE.
- **Bilinen sınırlama:** senkronizasyon sırasında Riot dev key expire
  olmuştu (401) — Riot/Valorant/TFT provider'ları bu sync'te
  çalışmadı, o yüzden LoL'ün "Platform Status"/"Champion Rotation" ve
  Valorant/TFT platform-status satırları migration'ın varsayılan
  `PLAYABLE` etiketiyle kalmaya devam ediyor (kod doğru
  `PLATFORM_STATUS`/`ROTATION_MILESTONE` atıyor, testlerle doğrulandı —
  sadece bu satırlar bir sonraki başarılı Riot sync'ine kadar
  güncellenmeyecek). Key yenilenince (veya bekleyen production key
  onaylanınca) bir sonraki sync'te kendiliğinden düzelir, ekstra işlem
  gerekmiyor.
- **Aynı gün, aynı oturumda düzeltildi:** 401 nedeniyle stale kalan 6
  satır (`riot-platform-TR1`, `riot-champion-rotation`,
  `tft-platform-TR1`, `valorant-platform-EU`, 2 Valorant Act'i) elle
  tek seferlik bir `prisma.event.update` betiğiyle doğru kategoriye
  çekildi — kodun zaten üreteceği değerle birebir aynı, sadece Riot
  key'in düzelmesini beklemeden.

---

# ADR-024: URF için "Bilinen Ama Şu An Sinyali Olmayan Mod" Placeholder'ı — İlk Provider-Dışı Event Satırı

Status: Accepted

Date: 2026-08-12

## Bağlam

ADR-023 deploy edildikten hemen sonra Deniz gerçek siteye baktı:
CommunityDragon'ın gerçek event-hub verisi incelendiğinde URF'ün ne
live ne de PBE feed'inde hiçbir girdisi olmadığı görüldü (ikisi de bu
oturumda tekrar çekildi, birebir aynı 21 girdi — hiçbirinde "URF"
geçmiyor). WebSearch ile üçüncü taraf patch-notu kaynakları da bunu
doğruladı: mevcut patch'te rotasyondaki featured modlar ARAM Mayhem,
Arena ve League Classic — URF değil. Yani ADR-023'ün "Mayhem/URF/Arena
artık gizlenmiyor" kararı teknik olarak doğruydu ama pratikte hiçbir
şey değiştirmedi, çünkü feed'de zaten yalnızca Mayhem'in penceresi
açıktı — URF'ün kendisi hiç görünmüyordu.

Deniz'in tepkisi netti: "urf olmayacak zaten ama urf görülmesi ve
seçilebilmesi lazım" — URF'ün şu an oynanamaz olduğunu, ended
kategorisinde olması gerektiğini kabul ediyor, ama ended olsa bile
sistemde bir "şey" olarak var olmasını, seçilebilir/takip edilebilir
olmasını istiyor. Gerekçesi: gelecekte "ne kadar live kalıyor",
"PBE'den live'a geçiş ne kadar sürüyor" gibi analizler yapılacak — bu
yüzden URF'ün DB'de bir kimliği olması lazım, ilk gerçek görünüşünden
itibaren.

Bu, projenin en sert şekilde savunduğu ilkeyle doğrudan gerilimde:
"gerçek veri, asla uydurma" — bkz. `lib/events.ts`'in tam bu sebeple
silinmesi (hardcoded "URF" verisi), ADR-007, ADR-012, ADR-017, ADR-020.
Bugüne kadar her Event satırı bir provider'ın o an gözlemlediği gerçek
veriden geliyordu.

## Karar

Yeni, minimal bir provider: `lib/providers/rotating-modes/provider.ts`
(`id: "rotating-modes"`, registry'ye eklendi). Statik, elle yazılmış
tek bir satır döndürüyor (URF), ama şu kurallara kesinlikle uyarak:

- **Asla `status: "LIVE"` demiyor.** Her zaman `ENDED` — "şu an
  oynanabilir değil" gerçeğinin dürüst karşılığı, ADR-023'ün
  `categorySortKey`'i sayesinde ended olsa bile `PLAYABLE`
  kategorisiyle listelerin başında çıkıyor.
- **Asla tarih uydurmuyor.** `startDate`/`endDate` yok — sadece
  id/title/description/status/category var, tıpkı diğer provider'lar
  gibi `ProviderEvent` şeklinde.
- Açıklama dürüstçe "Riot şu an için bir sinyal sunmuyor" diyor ve
  gelecekteki gerçek mekanizmayı anlatıyor: CommunityDragon feed'i
  (live ya da PBE) bir gün gerçekten "URF" adlı bir girdi
  raporladığında, o girdi kendi `communitydragon`/`communitydragon-pbe`
  source'uyla ayrı bir satır olarak gerçek veriyle senkronize olacak;
  bu placeholder onunla çakışmıyor (farklı id/source), sadece kendi
  köşesinde "hâlâ sinyal yok" demeye devam ediyor.
- Her `syncAll()` çağrısında bu provider de çalışıp aynı satırı tekrar
  upsert ediyor — bu yüzden `eventSyncService`'in "kaynak artık
  raporlamıyorsa ENDED yap" temizlik mantığı bu satırı hiç
  tetiklemiyor, ekstra özel durum kodu gerekmedi.

Aynı oturumda ayrıca gerçek veri incelenirken bir kategorilendirme
hatası bulundu: `kActivityCenterMilestones` tipindeki "Classic Pass
Token Bank" girdisi (pass-para birimi takip eden, oynanabilir bir şey
olmayan bir satır) varsayılan olarak `PLAYABLE`'a düşüyordu.
Normalizer'a "Token Bank" başlık eşleşmesi eklendi, artık
`SEASON_PASS`.

## Gerekçe

Bu bir istisna, kural değişikliği değil: "gerçek veri" ilkesinin
ihlal ettiği tek şey, önceki olaylarda (lib/events.ts, ADR-007) hep
aynıydı — **sahte bir "şu an LIVE/aktif" iddiası.** Bu placeholder o
iddiayı hiç yapmıyor; tam tersi, "aktif değil, sinyal yok" diyor ve
bunu asla değiştirmiyor kendi başına. Riskli olan kısım (yanlış "bu
şu an oynanıyor" izlenimi) bilinçli olarak dışarıda bırakıldı.
Bununla birlikte bu, codebase'deki ilk provider-dışı/statik Event
satırı — ileride başka "bilinen ama sinyali olmayan" modlar (Arena da
aynı durumda — cherry-lobby.json'da da tarih yok) eklenmek istenirse
aynı `rotating-modes` provider'ına eklenmeli, yeni bir mekanizma
icat edilmemeli.

## Sonuçlar

- Gerçek sync ile doğrulandı: `rotating-mode-urf` artık DB'de
  (`source: "rotating-modes"`, `status: ENDED`, `category: PLAYABLE`,
  gerçek bir `slug` ile — `/events/lol-urf-...` üzerinden de
  erişilebilir). `categorySortKey` sayesinde LoL için onboarding,
  dashboard, homepage ve `/games/lol` sayfalarının hepsinde en üstte
  çıkıyor (ended olsa bile, aynı Deniz'in istediği gibi).
- 71/71 test geçiyor (`Token Bank` kategorisi için yeni bir test
  eklendi), `tsc`/`next build` temiz.
- Arena'nın da URF ile aynı durumda olduğu (cherry-lobby.json'da tarih
  yok) not edildi ama Deniz'in isteği kapsamına girmediği için
  eklenmedi — istenirse aynı provider'a tek satır eklemek yeterli.

---

# ADR-025: Kalıcı Modlar (Sihirdar Vadisi, ARAM) + Varsayılan Filtre PLAYABLE'a Çekildi

Status: Accepted

Date: 2026-08-12

## Bağlam

Deniz, LoL client'ının mod seçim ekranının (Sihirdar Vadisi, ARAM,
Arena, Classic Vadi, TFT — bazıları kilitli/limited-time ikonuyla)
ekran görüntüsünü attı: asıl istediği, oyuncunun oynayabileceği TÜM
modların (sadece rotasyonlu/event olanların değil) görünmesi —
"aram sihirdar vadisi vb. tüm oynanabilirler arasından hangisi açık
hangisi limited time." Ayrıca: onboarding'de varsayılan olarak
`EVENT_CATEGORY_ORDER`'daki 5 kategorinin hepsi seçili geliyordu
(ADR-023'te öyle kurulmuştu) — Deniz'in asıl istediği "başta sadece
playable görülsün, istersen sen genişlet" idi, tersi değil.

## Karar

1. **`lib/providers/rotating-modes/provider.ts` genişletildi** —
   artık sadece "bilinen ama sinyali olmayan" modları değil, "bilinen
   ve yapısal olarak her zaman açık" modları da tutuyor
   (`KnownMode.status` artık sabit `ENDED` değil, her girdi kendi
   status'unu taşıyor):
   - **Summoner's Rift** ve **ARAM** — `status: LIVE`, kalıcı, yıllardır
     kesintisiz oynanabilir modlar. Bu bir "şu an aktif mi" iddiası
     değil, oyunun yapısal bir gerçeği (Warframe'in Sortie'sinin her
     gün var olması gibi bir sınıf) — canlı doğrulama gerektirmiyor.
   - **URF** — `status: ENDED`, ADR-024'teki gibi, değişmedi.
   - Arena eklenmedi — Deniz bu mesajda özellikle adını vermedi,
     ayrıca kalıcı mı rotasyonlu mu olduğu (cherry-lobby.json'da tarih
     yok) net değil; yanlış "her zaman açık" iddiası riskli olurdu.
2. **`lib/providers/communitydragon/normalizer.ts`** — `kDemaciaPass`
   açıklaması "League Classic'in battle pass'i, aynı zamanda League
   Classic modunun ne zaman oynanabilir olduğuna dair elimizdeki en
   iyi gerçek sinyal" diye netleştirildi (önceden sadece "Classic-mode
   battle pass" diyordu, hangi gerçek moda karşılık geldiği
   belirsizdi).
3. **Varsayılan kategori filtresi `PLAYABLE`'a çekildi** — hem
   `components/onboarding/event-selector.tsx` hem
   `components/dashboard/watching-list.tsx`'in "All Events"
   bölümünde. "Your Watchlist" bölümü bundan etkilenmiyor — kullanıcı
   zaten ne izlemeyi seçtiyse kategoriden bağımsız hep gösteriliyor,
   filtre sadece keşif/gözat listesini daraltıyor.
4. Filtre kartları tekrar kullanılabilir hale getirildi:
   `components/shared/category-filter-bar.tsx` (önceden
   `event-selector.tsx` içine gömülüydü), artık iki yerde de aynı
   bileşen.
5. Dashboard event kartlarına (`EventStatusCard`) `slug` eklendi,
   başlık artık `/events/[slug]`'a linkleniyor — Deniz'in istediği
   "her event için ayrı bir statistics sayfası" zaten var
   (`app/events/[slug]/page.tsx`: first tracked, times seen, average
   duration, tahmini bitiş/son görülme, ve her occurrence'ın
   start→end + süresini gösteren tam timeline) ama dashboard'dan
   ulaşılamıyordu, sadece `/games/[slug]`'dan linkliydi.

## Gerekçe

"Hangi modlar şu an client'ta seçilebilir/kilitli/countdown'lu"
sorusunun tam cevabı (ekran görüntüsündeki gibi) hâlâ mümkün değil —
bu veri LCU'dan geliyor (bkz. ADR-001, kişiselleştirme dışı kullanımı
yasak) ve hiçbir public API'de karşılığı yok (bu oturumda
event-passes.json/cherry-lobby.json/regalia.json + WebSearch ile bir
kez daha arandı, bulunamadı). Ama bunun ortasında gerçekten
söylenebilecek bir gerçek var: Sihirdar Vadisi ve ARAM'ın yıllardır
kesintisiz açık olduğu — bu, her istekte doğrulanması gereken bir şey
değil, oyunun bilinen yapısı. Bunu eklemek "gerçek veri" ilkesini
ihlal etmiyor, tam tersi tamamlıyor: kullanıcının "tüm oynanabilirler"
listesi artık gerçekten anlamlı bir taban içeriyor.

## Sonuçlar

- Gerçek sync ile doğrulandı: LoL'ün `PLAYABLE` kategorisi artık
  Summoner's Rift (LIVE), ARAM (LIVE), URF (ENDED) + gerçek
  event-hub'dan gelen tek seferlik event'leri (Hall of Legends,
  Arcane Anniversary, Swain's Hot Chicken — hepsi ENDED) içeriyor.
  Varsayılan filtreyle bir kullanıcı artık önce LIVE iki kalıcı modu,
  sonra URF'ü, sonra geçmiş event'leri görüyor — Platform
  Status/Champion Rotation/Season Pass gürültüsü tamamen filtre
  dışında (istenirse tek tıkla açılabiliyor).

---

# ADR-026: Queue Seviyesinde Gerçek Mod Listesi (queues.json) + Mayhem/Classic PLAYABLE'a Taşındı

Status: Accepted

Date: 2026-08-12

## Bağlam

Deniz, LoL client'ının mod seçim ekranından bir ekran görüntüsü daha
attı ve netleştirdi: "ben aram görmek istemiyorum, aramda 3 farklı mod
var: aram, aram şamata, aram şamata klasik gibi — bunları görücem,
sihirdar vadiside 4 farklı mod var, bunları görmek istiyorum." Yani
ADR-025'teki tek "ARAM" / tek "Summoner's Rift" satırı yetersizdi —
istenen, client'taki gerçek queue granularitesi.

Bu, `queues.json`'u (public, keyless, ADR-017'de zaten incelenmiş)
farklı bir amaçla yeniden değerlendirmeyi gerektirdi. ADR-017 doğru
şekilde "hiçbir alan 'şu an aktif' bilgisi taşımıyor" demişti — ama
bu, dosyanın TAMAMEN işe yaramaz olduğu anlamına gelmiyor. 420 kayıt
arasında `isLimitedTimeQueue` diye bir bayrak var: bu bir "şu an
açık mı" sinyali değil, ama "bu queue TÜRÜ yapısal olarak kalıcı mı,
rotasyonlu mu" diye sabit bir sınıflandırma — farklı bir soru, ve
cevabı gerçek/güvenilir.

Bu bayrağı körü körüne güvenmek de riskli: "ARAM: Mayhem" (id 2400)
`isLimitedTimeQueue: false` olarak işaretli, ama gerçekte sürekli
açık DEĞİL — kendi gerçek event-hub pas-penceresi verisi (Mayhem
Progression Track → bitti → Mayhem Set 2 → şu an açık) bunun
rotasyonlu olduğunu zaten kanıtlıyor. Yani bayrak tek başına yeterli
değil, ancak bağımsız olarak yıllardır kesintisiz bilinen modlar
(Sihirdar Vadisi'nin temel kuyrukları, ARAM'ın kendisi) için ek bir
doğrulama katmanı olarak kullanılabilir.

## Karar

1. **`lib/providers/rotating-modes/provider.ts`** queue-seviyesinde
   gerçek isimlerle genişletildi (hepsi `queues.json`'dan, uydurma
   değil):
   - Sihirdar Vadisi'nin 4 kalıcı kuyruğu → hepsi `LIVE`: Normal
     (Draft Pick, id 400), Ranked Solo/Duo (id 420), Ranked Flex
     (id 440), Swiftplay (id 480).
   - ARAM (id 450) → `LIVE`.
   - ARAM: Mayhem Classic-ish (id 2450) → `ENDED` — Riot'un kendi
     verisinde özellikle `isLimitedTimeQueue: true` işaretli (ekran
     görüntüsündeki kilitli/saat ikonlu varyantla eşleşiyor), canlı
     sinyal yok.
   - URF → `ENDED`, değişmedi (ADR-024).
   - Eski tek "Summoner's Rift" satırı listeden çıkarıldı — bir
     sonraki sync'te `eventSyncService`'in var olan "source artık
     raporlamıyorsa ENDED yap" temizliği sayesinde otomatik ENDED
     oldu, ekstra kod gerekmedi.
2. **ARAM: Mayhem'in kendisi ayrı bir statik satır değil** — zaten
   gerçek, tarihli event-hub verisi var (`Mayhem Set 2`), o
   kullanılıyor.
3. **`lib/providers/communitydragon/normalizer.ts`** —
   `isRotatingModeWrapper` (Mayhem/URF/Arena) eşleşen entry'ler ve
   `kDemaciaPass` (League Classic'in pass'i) artık kategori olarak
   `SEASON_PASS` değil **`PLAYABLE`**. Gerekçe: Deniz'in tekrar
   tekrar netleştirdiği gibi bunlar gerçekten bir mod temsil ediyor,
   sadece bir ödül takip sistemi değil — "battle-pass window only"
   dürüstlüğü kategori yerine açıklama metninde kalmaya devam
   ediyor. Genel `kSeasonPass` (Season N: Act X, Spirit Blossom
   Beyond gibi anlatı içerikli pas'lar) hâlâ `SEASON_PASS` — bunlar
   gerçekten bir mod değil, ödül takip sistemi.

## Gerekçe

`isLimitedTimeQueue` bayrağı tek başına "şu an aktif mi" sorusuna
cevap vermiyor (ADR-017'nin sonucu hâlâ geçerli) — ama "bu queue
TÜRÜ hangi sınıfa ait" sorusuna cevap veriyor, ve bu genel bilgiyle
birlikte bağımsız olarak doğrulanabilir gerçekler (Sihirdar
Vadisi/ARAM'ın yıllardır kesintisiz açık olması) kombine edilerek
dürüst bir liste kuruldu. Hiçbir satırda tarih uydurulmadı, hiçbir
satır "şu an aktif" diye yanlış iddia etmiyor.

## Sonuçlar

- Gerçek sync ile doğrulandı: LoL `PLAYABLE` kategorisinde artık 7
  LIVE satır var (Normal, Ranked Solo/Duo, Ranked Flex, Swiftplay,
  ARAM, Mayhem Set 2, Classic Pass: Act I) — ekran görüntüsündeki
  Sihirdar Vadisi'nin 4 modu ve ARAM'ın 3 modu (Mayhem Set 2 = "ARAM
  Şamata", ARAM: Mayhem Classic-ish = "ARAM Şamata: Classic Gibi")
  birebir eşleşiyor.
- 72/72 test, `tsc --noEmit`, `npm run build` temiz.

---

# ADR-027: Event.isLimitedTime + Pass-Tier Başlıkları Gerçek Mod Adına Çevrildi

Status: Accepted

Date: 2026-08-12

## Bağlam

İki ayrı geri bildirim aynı anda geldi:

1. "Mayhem classic-ish hala gözükmüyor" — DB'de gerçekten vardı
   (`status: ENDED, category: PLAYABLE`), ama dashboard'un "All
   Events" listesi ENDED bölümünü 6 kayıtla sınırlıyordu
   (`ENDED_DISPLAY_LIMIT`), kalanı statik, tıklanamayan bir "+N more"
   metninin arkasında kayboluyordu — gerçek bir UI bug'ı.
2. "hangileri limited time hangileri değil, ayırmak lazım" — kategori
   sistemi (PLAYABLE/SEASON_PASS/vb.) "ne tür içerik" sorusuna cevap
   veriyor ama "kalıcı mı rotasyonlu mu" sorusuna cevap vermiyor.
3. Ayrıca (aynı konuşmada) "mayhem set 2 battle pass gibi... direkt
   sadece aram mayhem olması lazım" — event-hub'ın kendi başlığı
   ("Mayhem Set 2", "Classic Pass: Act I") gerçek ama pas-seviyesi bir
   isim, oyuncunun tanıyacağı mod adı değil.

## Karar

1. **`Event.isLimitedTime` sütunu** eklendi (additive migration,
   `20260812084500_add_event_is_limited_time`, `DEFAULT true` —
   deploy öncesi/sonrası 59 event/4 user/25 watchlist/44 history
   satırı birebir doğrulandı). `ProviderEvent.isLimitedTime: boolean`
   zorunlu alan oldu, 10 provider'ın hepsi güncellendi:
   - `false` (kalıcı): Sihirdar Vadisi'nin 4 kuyruğu, ARAM, Platform
     Status (4 oyun), Champion Rotation.
   - `true` (limited-time): CommunityDragon event-hub'ın TÜM
     girdileri (hepsinin gerçek başlangıç/bitiş tarihi var —
     yapısal olarak zaman sınırlı), URF, ARAM: Mayhem Classic-ish,
     Valorant Act, Destiny milestone'lar, Fortnite Item Shop, Warframe'in
     4 içeriği, PoE lig, Helldivers 2 Major Order, Foxhole savaşı.
2. **`components/shared/rotation-badge.tsx`** (yeni) — "Permanent"
   (yeşil) / "Limited Time" (amber) rozeti; onboarding, dashboard,
   `/games/[slug]`'ın hepsinde event kartlarına eklendi.
3. **`ENDED_DISPLAY_LIMIT` (6) kaldırıldı** — dashboard'un "All
   Events" listesi artık hiçbir statusu gizli tıklanamaz bir "+N
   more" arkasına saklamıyor. Varsayılan PLAYABLE filtresiyle zaten
   liste makul boyutta kalıyor.
4. **`lib/providers/communitydragon/normalizer.ts`** —
   `canonicalModeTitle()` eklendi: event-hub'ın pas-seviyesi başlığı
   yerine `queues.json`'dan doğrulanmış gerçek mod adı gösteriliyor
   ("Mayhem Set 2"/"Mayhem Progression Track" → "ARAM: Mayhem",
   "Classic Pass: Act I" → "League Classic"). Tarih/status hâlâ
   event-hub'ın gerçek, tarihli girdisinden geliyor — sadece
   görünen isim değişti.
5. Ayrıca fark edilen küçük bir hata düzeltildi: dashboard/oyun
   sayfasındaki kategori rozeti `hidden ... sm:inline-block` ile
   mobilde/tarayıcı küçükken tamamen gizleniyordu — kaldırıldı,
   artık her ekran boyutunda görünüyor.

## Bilinen sınır — kayıt tekrarı

"ARAM: Mayhem" adını hem eski "Mayhem Progression Track" (artık
ENDED) hem yeni "Mayhem Set 2" (LIVE) satırı taşıyor — event-hub'da
bunlar farklı ID'li iki ayrı pas penceresi (Şubat-Haziran, Haziran-
Ekim), her ikisi de aynı gerçek moda karşılık geldiği için aynı ada
çevrildi. Sonuç: listede "ARAM: Mayhem" iki kez görünüyor, biri LIVE
biri ENDED. `categorySortKey` LIVE olanı önce gösteriyor ama tam bir
tekilleştirme yapılmadı — Deniz isterse "aynı canonical isimli
satırlardan sadece en güncelini göster" mantığı ayrı bir işte
eklenebilir.

## Sonuçlar

- 73/73 test, `tsc --noEmit`, `npm run build` temiz.
- Gerçek sync ile doğrulandı: "ARAM: Mayhem" (LIVE), "League Classic"
  (LIVE) gerçek isimleriyle görünüyor; "ARAM: Mayhem Classic-ish"
  artık ENDED_DISPLAY_LIMIT kaldırıldığı için gerçekten görünür.

---

# ADR-028: "ARAM: Mayhem Classic-ish" — Statik Sabit ENDED Yerine League Classic'in Gerçek Pas Penceresine Bağlandı

Status: Accepted

Date: 2026-08-12

## Bağlam

Deniz iki ekran görüntüsü attı: biri ModeAlert'te "ARAM: Mayhem
Classic-ish" kartının `ENDED` gösterdiğini, diğeri kendi LoL
client'ında bu modun ARAM sekmesinde seçilebilir bir sırada
göründüğünü kanıtlıyordu (saat ikonu vardı ama listeden çıkarılmış/
kilitli değildi). "Neden ended gözüküyor, oynanabilir, düzeltmek
lazım" dedi.

Kök sebep: ADR-026'da bu satırı statik `rotating-modes`
provider'ında sabit `status: "ENDED"` olarak eklemiştim, çünkü ona
özel bir event-hub girdisi yoktu (live/PBE feed'de "Classic-ish"
geçen hiçbir şey yok — ikisi de bu oturumda tekrar kontrol edildi).
Ama bu, hiçbir zaman kendini güncelleyemeyen, kalıcı olarak yanlış
kalabilecek bir tasarımdı — ve Deniz'in ekran görüntüsü tam da bunu
kanıtladı: mod şu an gerçekten aktif, ben sabit "ENDED" gösteriyordum.

## Karar

"ARAM: Mayhem Classic-ish" statik listeden tamamen kaldırıldı.
Yerine: `lib/providers/communitydragon/normalizer.ts`'te, her
`kDemaciaPass` (League Classic'in pas'ı) girdisi işlendiğinde bir
"kardeş" event üretiliyor — aynı gerçek `startDate`/`endDate`'i
kullanarak `computeStatus()` ile hesaplanan status'u paylaşıyor.
Gerekçe: bu, Classic-mode temalı bir ARAM Mayhem crossover'ı —
kendi event-hub girdisi olmasa da, League Classic'in penceresiyle
aynı promosyon dönemine bağlı olduğu, hem tema hem Deniz'in gerçek
gözlemiyle (Classic Pass açıkken bu varyant da seçilebilirdi)
destekleniyor. `id` aynı kaldı (`lol-mode-aram-mayhem-classic`),
sadece `source` `rotating-modes`'tan `communitydragon`'a geçti —
slug/geçmiş kesintisiz devam ediyor.

Açıklama metninde bu çıkarımın **doğrulanmış bir doğrudan sinyal
olmadığı**, League Classic'in penceresine bağlı en iyi tahmin olduğu
açıkça belirtiliyor — yanlış çıkarsa (örn. bu varyant gerçekte
Classic Pass'ten bağımsız kapanırsa/açılırsa) düzeltilmesi gereken
bir varsayım olarak işaretli.

## Gerekçe

Statik, hiç güncellenmeyen bir "ENDED" placeholder'ın temel sorunu:
yanlış olduğunda kendini asla düzeltemiyor — tam da bu oturumda
olduğu gibi. Gerçek, tarihli bir veriye (League Classic'in pas'ı)
bağlamak, yanlış olma ihtimali sıfır olmasa da, kendi kendini
güncelleyen ve gerekçesi açık bir sinyale dönüştürüyor. URF için aynı
yaklaşım uygulanmadı çünkü URF'ün böyle bağlanabileceği hiçbir gerçek,
tarihli kardeş event yok — o yüzden hâlâ statik/ENDED kalıyor
(dürüst, ama Deniz'in bu oturumda gösterdiği gibi, potansiyel olarak
yanlış kalabilir günü gelince — URF gerçekten dönerse aynı sorunla
karşılaşılabilir, o zaman yeniden değerlendirilmeli).

## Sonuçlar

- 74/74 test (yeni test: companion'ın League Classic LIVE'ken LIVE,
  ENDED'ken ENDED olduğunu doğruluyor), `tsc --noEmit`, `npm run
  build` temiz.
- Gerçek sync ile doğrulandı: "ARAM: Mayhem Classic-ish" artık
  `status: LIVE`, `source: communitydragon` (League Classic'in pas'ı
  şu an açık olduğu için) — Deniz'in ekran görüntüsüyle eşleşiyor.
- Rozet görünürlüğü ayrıca doğrulandı: canlı `/games/league-of-legends`
  HTML'inde "Playable"/"Limited Time" rozetleri gerçekten mevcuttu —
  Deniz'in ekran görüntüsünde eksik görünmesi kod hatası değil, deploy
  henüz bitmeden bakılmış olmasıydı.

---

# ADR-029: ARAM Mayhem + League Classic Kalıcı Mod Olarak Doğrulandı (WebSearch) — Ayrı Gerçek Girdiler Aldı

Status: Accepted

Date: 2026-08-12

## Bağlam

Deniz, ARAM Mayhem ve League Classic'in "Limited Time" etiketiyle
gösterilmesinin doğru olup olmadığını sorguladı — "sadece API
verisine bakma, interneti de tara." Bu haklı bir şüpheydi: bu ikisi
event-hub'da hâlâ `kSeasonPass`/`kDemaciaPass` tipinde, tarihli
"pass" girdileri olarak görünüyordu, ve bu oturumda daha önce
(ADR-026/ADR-028) bu pass pencerelerini modun kendisinin sinyali
olarak kullanmıştım — ama bu, modun GERÇEKTEN kalıcı hale gelmiş
olma ihtimalini hiç sorgulamamıştı.

WebSearch ile doğrulandı:
- **ARAM: Mayhem** — Riot'un Mart 2026 dev update'i: "kalmaya devam
  ediyor, şu an için bir bitiş tarihi düşünülmüyor" (dotesports,
  gamegrin, sheepesports, resmi Riot support sayfası — birden fazla
  bağımsız kaynak). Başlangıçta limited-time bir testti, artık
  kalıcı.
- **League Classic** — 29 Temmuz 2026'da, wiki'nin "a permanent game
  mode" dediği, Arena/URF ile aynı mod seçim kategorisinde, ayrı
  client gerektirmeyen bir mod olarak piyasaya sürüldü. Arena/orijinal
  Mayhem gibi "limited-time test" olarak değil, baştan kalıcı olarak
  tasarlanmış — ama henüz 2 haftalık, Summoner's Rift/ARAM'ın
  onlarca yıllık geçmişi kadar kanıtlanmış değil.
- **Arena** (karşılaştırma için kontrol edildi) — Haziran 2026'ya
  kadar garantiliydi, o tarihten sonrası (şu an=12 Ağustos 2026) net
  değil. Kalıcı olarak eklenmedi, belirsizlik sürüyor.

## Karar

1. `lib/providers/rotating-modes/provider.ts`'e iki yeni kalıcı satır
   eklendi: **ARAM: Mayhem** ve **League Classic** (`status: LIVE`,
   `isLimitedTime: false`), Summoner's Rift/ARAM'ın yanına.
2. `lib/providers/communitydragon/normalizer.ts`'te bu ikisi artık
   event-hub'ın pass penceresinden **çıkarılmadı/yeniden
   kategorize edilmedi** — `kDemaciaPass` kategorisi `SEASON_PASS`'e
   geri döndü, "Mayhem" başlık eşleşmesi
   `UNCONFIRMED_ROTATING_MODE_TITLE_MATCHES`'ten kaldırıldı (artık
   sadece `["URF", "Arena"]`). Bu ikisinin pass girdileri artık
   sadece kendi gerçek Riot başlıklarıyla ("Mayhem Set 2", "Classic
   Pass: Act I"), düz `SEASON_PASS` olarak görünüyor — dürüstlük
   hedge'i de kaldırıldı çünkü artık modun kendisi ayrı, doğrulanmış
   bir satırla temsil ediliyor, pass'in bunun için proxy olmasına
   gerek kalmadı.
3. "ARAM: Mayhem Classic-ish" companion mantığı (ADR-028) değişmedi
   — o hâlâ League Classic'in pass penceresine bağlı, çünkü bu
   spesifik crossover varyantının kendisinin kalıcı olduğuna dair
   ayrı bir kanıt yok.

## Gerekçe

ADR-026/ADR-028'in "pass penceresi = modun sinyali" yaklaşımı,
modun kendisi doğrulanmamışken makul bir vekildi. Ama artık iki mod
için de bağımsız, güvenilir doğrulama var — vekil sinyale gerek
kalmadı, ve onu kullanmaya devam etmek yanlıştı: bir pass biterse
(örn. Classic Pass 23 Eylül'de kapanırsa) modun kendisi hâlâ kalıcı
olarak orada olacak, ama vekil mantık onu yanlışlıkla ENDED
gösterirdi. Ayrı, doğrudan doğrulanmış bir satır bu riski ortadan
kaldırıyor.

## Sonuçlar

- 79/79 test (`Mayhem`/`Classic` kategorizasyon testleri güncellendi,
  yeni bir URF-özel test eklendi), `tsc --noEmit`, `npm run build`
  temiz.
- Gerçek sync ile doğrulandı: LoL'de artık 7 kalıcı LIVE mod var
  (Normal, Ranked Solo/Duo, Ranked Flex, Swiftplay, ARAM, ARAM:
  Mayhem, League Classic) — hiçbiri "Limited Time" değil, hepsi
  "Permanent". "Mayhem Set 2"/"Classic Pass: Act I" ayrı, doğru
  şekilde `SEASON_PASS` satırlar olarak duruyor, isim çakışması yok.

---

# ADR-030: Event.predictNextArrival — "Ne Zaman Geri Gelir" Tahmini

Status: Accepted

Date: 2026-08-12

## Bağlam

Deniz'in aynı mesajdaki ikinci isteği: her event için bir istatistik
sayfası — "daha önceki yıllarda ne zaman gelmiş, ne kadar aktif
kalmış, tahmini aktif kalma süresi, tahmini sonraki gelme süresi."
`/events/[slug]` sayfası bunun çoğunu zaten yapıyordu (first
tracked, times seen, average duration, tam timeline, "estimated to
end" — `eventPredictionService.predict()`), ama "ne zaman geri
gelir" eksikti — sadece "şu anki occurrence ne zaman biter" tahmini
vardı, "bir sonraki occurrence ne zaman başlar" yoktu.

## Karar

`lib/services/event-prediction.service.ts`'e yeni bir fonksiyon:
`predictNextArrival(eventId)`. Mantığı:

- Sadece event şu an aktif DEĞİLKEN anlamlı (aktifken zaten "ne
  zaman biter" sorusu daha alakalı — mevcut `predict()` bunu
  yanıtlıyor).
- `computeRecurrence()` (yeni, saf/test edilebilir fonksiyon): tüm
  geçmiş occurrence'lar arasında, bir occurrence'ın bitişiyle bir
  sonrakinin başlangıcı arasındaki gerçek boşlukları hesaplıyor,
  ortalamasını alıyor. Art arda gelen (boşluksuz, örn. Act I'den
  Act II'ye direkt geçiş) occurrence'lar hariç tutuluyor — bunlar
  "ne kadar sürede geri gelir" sorusuna gürültü katardı.
  - En az 2 tamamlanmış occurrence yoksa: `nextExpectedAt: null`,
    dürüstçe "yeterli geçmiş yok" gösteriliyor.
  - Varsa: `nextExpectedAt = son bitiş + ortalama boşluk`, confidence
    boşluk sayısına göre ölçekleniyor (`gapCount * 20`, max 100).
- `/events/[slug]` sayfasına "Typically returns after" kutusu
  eklendi (sadece event aktif değilken ve tahmin mümkünken
  gösteriliyor), yetersiz veri durumunda dürüst bir mesaj.

## Bilinen sınırlama

Bu, TEK BİR event ID'sinin geçmişini kullanıyor. CommunityDragon'ın
LoL pass girdileri (Mayhem Set 1, Set 2, ...) her sezon YENİ bir
Riot UUID'siyle geliyor — yani "Mayhem Set 2" kendi geçmişini
tutuyor ama "bir önceki Mayhem sezonu"nu otomatik bağlamıyor.
PoE ligi, Warframe Nightwave, Foxhole savaşı gibi SABİT id kullanan
provider'larda bu sorun yok (aynı id yıllarca aynı kalıyor, gerçek
tekrar geçmişi doğal olarak birikiyor). LoL'ün sezon geçişli
pass'leri için "yıllar boyunca aynı şeyin farklı occurrence'ları"
diye gruplamak, ayrı bir "seri anahtarı" mekanizması gerektirir —
bu oturumda eklenmedi, istenirse ayrı bir iş.

## Sonuçlar

- 79/79 test (`computeRecurrence` için 5 yeni, saf-fonksiyon testi:
  yetersiz veri, tek boşluk, çoklu boşluk ortalaması, art arda
  occurrence'ların hariç tutulması, aktif occurrence'ın hariç
  tutulması), `tsc --noEmit`, `npm run build` temiz.
- Gerçek veriyle doğrulanamadı — geçmiş takibi 2026-08-04'te
  başladığı için DB'de henüz 2+ TAMAMLANMIŞ occurrence'ı olan hiçbir
  event yok (en yakın adaylar hâlâ aktif/ongoing). Mantık saf
  fonksiyon testleriyle doğrulandı; gerçek tahminler zaman geçtikçe
  doğal olarak dolacak.

---

# ADR-031: Event.seriesKey — Gerçek Riot Verisiyle Sezonlar Arası Gruplama (İnternet Araştırması Yerine)

Status: Accepted

Date: 2026-08-12

## Bağlam

Deniz'in isteği: "seri gruplama doğru ise ekle, istatistik için ise
internette bunun hakkında bulunan tüm verilere tüm oyun modları için
bak." Yani hem (1) ADR-030'da bahsedilen "seri gruplama" fikrini
onayladı hem de (2) geçmiş istatistikleri zenginleştirmek için harici
web araştırması istedi.

Ama event-hub feed'i tekrar (canlı) çekilince ortaya çıktı ki: **buna
hiç gerek yok** — CommunityDragon'ın kendi event-hub.json'u zaten
2024-06-12'ye kadar giden GERÇEK geçmiş pas pencerelerini
döndürüyor, tek bir istekte:

- "Season 3: Act I" hem 2025-08-27 hem 2026-07-29 tarihli iki ayrı
  girdi olarak var — aynı ismin gerçekten tekrarlandığının kanıtı.
- "Hall of Legends" (2024) ve "Hall of Legends 2025" — aynı yıllık
  event'in iki gerçek görünüşü.
- "Mayhem Progression Track" (Şubat 2026) → "Mayhem Set 2" (Haziran
  2026) — aynı pas sisteminin ardışık iki gerçek seti.

Bunların hepsi zaten ayrı Event satırları olarak DB'ye senkronize
oluyordu (her biri kendi Riot UUID'sine sahip) — sadece "bunlar aynı
tekrarlayan şeyin farklı occurrence'ları" diye gruplanmıyorlardı.
Yani ihtiyaç duyulan şey harici/internet verisi değil, zaten elde
olan gerçek Riot verisinin doğru gruplanmasıydı — bu hem daha doğru
hem "sadece gerçek veri" ilkesine tam uyumlu (harici, doğrulaması
zor kaynaklar eklemeden).

## Karar

1. **`Event.seriesKey` sütunu** eklendi (additive migration,
   `20260812093000_add_event_series_key`, nullable — satır sayıları
   deploy öncesi/sonrası doğrulandı: 61 event/4 user/25 watchlist/47
   history, birebir aynı). `ProviderEvent.seriesKey?: string`
   opsiyonel alan (çoğu provider hiç set etmiyor, sadece
   CommunityDragon normalizer'ı).
2. **`deriveSeriesKey()`** (`lib/providers/communitydragon/
   normalizer.ts`) — sadece gerçekten aynı tekrarlayan şeyin
   parçası olan kalıplar gruplanıyor:
   - `kHallOfLegends` tipi → `lol-hall-of-legends`
   - `kDemaciaPass` (Classic Pass) → `lol-classic-pass`
   - Başlığında "Mayhem" geçen `kSeasonPass` → `lol-mayhem-pass`
   - "Season N: Act X" kalıbı → `lol-ranked-season-pass`
   - "URF"/"Arena" geçenler → `lol-urf-pass`/`lol-arena-pass`
     (şu an hiç girdi olmasa da, ileride biri çıkarsa hazır olsun diye)

   **Bilinçli olarak gruplanmayan:** "Welcome to Noxus", "Spirit
   Blossom Beyond", "Swain's Hot Chicken", "Arcane Anniversary" gibi
   tek seferlik anlatı kampanyaları — bunlar her seferinde FARKLI
   içerik, aynı şeyin tekrarı değil. Gruplamak "bunlar tekrarlayan
   bir şey" gibi yanlış bir izlenim verirdi.
3. **Repository/servis katmanı seri-farkında hale getirildi**:
   `getHistoryBySeriesKey()`, `eventStatisticsService.getBySeriesKey()`,
   `eventPredictionService.predictBySeriesKey()`/
   `predictNextArrivalBySeriesKey()` — hepsi mevcut tek-event
   fonksiyonlarıyla aynı saf hesaplama mantığını (`computeStatistics`,
   `computeRecurrence`) paylaşıyor, sadece veri kaynağı farklı
   (tek event'in geçmişi yerine, seriesKey paylaşan tüm event'lerin
   birleşik geçmişi).
4. **`/events/[slug]`** artık `event.seriesKey` varsa seri-genelinde
   istatistik/tahmin/timeline gösteriyor, yoksa eskisi gibi tek
   event'e özel. Timeline'da her occurrence'ın kendi başlığı da
   gösteriliyor (örn. "Season 1: Act I", "Season 2: Act I" farklı
   satırlar olduğu için).

## Gerekçe

Riot'un kendi feed'i zaten yıllarca geriye giden gerçek tarihli veri
sağlıyorken harici/internet kaynağına başvurmak hem gereksiz hem daha
riskli olurdu (doğrulaması zor, güncelliği belirsiz üçüncü taraf
veri). Bu proje boyunca tekrarlanan ilke aynı kaldı: gerçek, birinci
elden veri varsa onu kullan.

## Sonuçlar

- 83/83 test (4 yeni `seriesKey` testi: Mayhem gruplama, yıllar
  arası Season gruplama, yıllar arası Hall of Legends gruplama, tek
  seferlik kampanyaların gruplanmadığının doğrulanması), `tsc
  --noEmit`, `npm run build` temiz.
- Gerçek sync ile doğrulandı: `lol-ranked-season-pass` serisinde 8
  satır (2025 + 2026, Season 1-3, Act I-II hepsi), `lol-mayhem-pass`
  2 satır, `lol-hall-of-legends` 2 satır — hepsi gerçek Riot
  verisinden, uydurma yok.
- İstatistikler hâlâ dürüst: `getBySeriesKey("lol-ranked-season-pass")`
  şu an `appearanceCount: 1` dönüyor çünkü ModeAlert'in kendi geçmiş
  takibi 2026-08-04'te başladı — geçmiş yıllardaki occurrence'lar
  Event satırı olarak var ama EventHistory'de değil (ModeAlert o
  zaman henüz onları gözlemlemiyordu). Zaman geçtikçe gerçek veri
  doğal olarak birikecek.

---

# ADR-032: Limited Time Her Zaman Üstte + Ayrı Limited/Permanent Filtresi

Status: Accepted

Date: 2026-08-12

## Bağlam

Deniz: "her zaman limited'lar üstte çıksın ve limited/permanent
filtresi olsun." Kategori sistemi "ne tür içerik" sorusuna cevap
veriyordu ama sıralamada limited-time/permanent ayrımının bir ağırlığı
yoktu — aynı kategoride (örn. PLAYABLE) kalıcı modlar (Sihirdar
Vadisi) ile nadir/kaçırılabilecek olanlar (URF) durum bazlı
sıralanıyordu, "nadir olan öne çıksın" mantığı yoktu.

## Karar

1. **`categorySortKey()` üç parametreli oldu**: `(category,
   isLimitedTime, statusPriority)`. Ağırlıklandırma: kategori (×100)
   > limited/permanent (×10, limited önce) > status (tie-break).
   Kategori hâlâ en baskın sıralama ekseni, ama artık aynı kategori
   içinde limited-time olanlar her zaman permanent olanların önünde.
   Tüm çağıran yerler güncellendi (onboarding, dashboard, homepage,
   `/games/[slug]`).
2. **`components/shared/rotation-filter-bar.tsx`** (yeni) —
   `CategoryFilterBar` ile aynı desende, "Limited Time"/"Permanent"
   çoklu-seçim rozetleri. Onboarding'e ve dashboard'un "All Events"
   bölümüne eklendi, varsayılan ikisi de seçili (filtre yok, sadece
   sıralama etkisi varsayılan).

## Sonuçlar

- 83/83 test, `tsc --noEmit`, `npm run build` temiz.

---

# ADR-033: URF'ün Gerçek Tarihi Araştırıldı (Uydurma Kesinlik Yok) + Diğer Oyunlara Kalıcı Modlar + Destiny 2 Bulgusu

Status: Accepted

Date: 2026-08-12

## Bağlam

Deniz'in isteği üç parçalıydı: (1) URF için internetten gerçek
historical data oluşturulabilir mi, (2) diğer oyunlarda da gerçekten
oynanan/beklenen modları araştır, (3) limited/permanent sıralama+
filtre (ADR-032'de yapıldı).

## (1) URF'ün gerçek tarihi — bulunan ama kullanılmayan veri

WebSearch + resmi Riot patch notes sayfası (`leagueoflegends.com/
.../patch-26-2-notes`) doğruladı: **ARURF, 22 Ocak 2026'da Patch
26.2 ile başladı** (orijinal planı Patch 26.3/4 Şubat'tı, öne
çekildi). Patch 26.4'te hâlâ aktif olduğu doğrulandı. Ama **kesin
bir bitiş tarihi hiçbir kaynakta bulunamadı** — sadece "Patch
26.11'de artık aktif değil" gibi geniş bir pencere biliniyordu
(önceki oturumdan). Patch aralığından (~2 hafta) tahmini bir bitiş
tarihi uydurmak mümkündü ama bu **gerçek değil, tahmin** olurdu.

**Karar: EventHistory'ye sahte kesinlikte bir satır eklenmedi.**
Bunun yerine URF'ün açıklaması gerçek, kaynaklı bilgiyle
güncellendi ("son bilinen başlangıcı 22 Ocak 2026, Patch 26.2"),
ama `predictNextArrival`'ın kullandığı EventHistory tablosuna
elle satır eklenmedi — çünkü bu, "gerçek gözlem" ile "internetten
bulunan ama kesinliği belirsiz bilgi"yi aynı veri kaynağında
karıştırırdı, ve bu proje boyunca korunan "gösterilen sayılar gerçek
gözleme dayanır" ilkesini zedelerdi.

## (2) Diğer oyunlara kalıcı mod ekleme

LoL'deki Sihirdar Vadisi/ARAM örneğiyle aynı titizlikte, WebSearch ile
doğrulanan, yıllardır değişmemiş kalıcı modlar eklendi
(`lib/providers/rotating-modes/provider.ts`, hepsi `LIVE`/
`isLimitedTime: false`):

- **Valorant**: Competitive, Unrated (2026'da hâlâ orijinal kalıcı
  modlar arasında, doğrulandı).
- **Fortnite**: Battle Royale, Zero Build (Zero Build 2022'den beri
  kalıcı, 2026'da hâlâ aktif geliştiriliyor — doğrulandı).
- **TFT**: Normal, Ranked, Hyper Roll — bunlar için yeni web
  araştırması gerekmedi, zaten bu oturumda `queues.json`'dan çekilmiş
  gerçek queue id'leri (1090/1100/1130) kullanıldı.

Eklenmeyenler: Destiny 2 (Crucible/Gambit) — aşağıdaki bulgu
yüzünden bilinçli olarak ertelendi. Warframe/PoE/Helldivers 2/Foxhole
— bu oyunların "hep orada olan" şeyi zaten oyunun kendisi, LoL/
Valorant/TFT'deki gibi temiz bir alt-mod ayrımı yok.

## (3) Önemli yan bulgu: Destiny 2 canlı içerik geliştirmesi bitti

Destiny 2 için kalıcı mod araştırması yapılırken bulundu:
**Bungie, 9 Haziran 2026'da "Monument of Triumph" (Update 9.7.0) ile
Destiny 2'nin planlı canlı-servis içerik güncellemelerini resmen
sonlandırdı.** Sunucular KAPANMIYOR, oyun oynanabilir durumda kalıyor,
ama:
- Düzenli sezon döngüleri, expansion'lar, canlı-servis makinesi
  tamamen duruyor — "9 Haziran'da ne görüyorsan sonsuza kadar o."
- Festival of the Lost, The Dawning, Guardian Games, Solstice gibi
  sezonluk event'ler kalıcı olarak emekliye ayrıldı.
- Ama Trials of Osiris (Iron Banner aktif olmadığı her hafta sonu) ve
  Iron Banner (her 4 haftada bir) **sabit bir döngüde devam ediyor** —
  resmi Bungie duyurusu.

Bu, ModeAlert'in Destiny 2 provider'ının (`lib/providers/destiny/`)
hâlâ gerçek veri döndürdüğünü (bu oturumdaki gerçek sync'lerde 13
milestone alındı, doğrulandı) ama CLAUDE.md/docs'daki "haftalık aktif
milestone'lar" açıklamasının artık eksik bir bağlamı olduğunu
gösteriyor — oyun artık "canlı geliştirme" değil "dondurulmuş, sabit
döngü" modunda. **Kod tarafında bir değişiklik yapılmadı** — bu,
Deniz'in bilmesi/karar vermesi gereken bir ürün bulgusu (örn. Trials/
Iron Banner'ı sabit bilinen döngüleriyle statik kalıcı entry'ler
olarak mı eklemeli, yoksa mevcut canlı milestone API'sine mi
güvenmeye devam etmeli), tek taraflı bir mimari karar değil.

## Sonuçlar

- 83/83 test, `tsc --noEmit`, `npm run build` temiz.
- Gerçek sync ile doğrulandı: Valorant (Competitive, Unrated),
  Fortnite (Battle Royale, Zero Build), TFT (Normal, Ranked, Hyper
  Roll) hepsi `LIVE`/`Permanent` olarak DB'de.
- Destiny 2 bulgusu docs/09_BACKLOG.md'ye ayrı bir madde olarak
  işlendi, Deniz'in dikkatine sunuldu.

---

# ADR-034: Destiny 2 — Iron Banner, Gerçek Duyurulmuş Takvimden Hesaplanan Statü

Status: Accepted

Date: 2026-08-12

## Bağlam

ADR-033'te flag'lenen Destiny 2 sorusuna Deniz'in cevabı: "sonraki
adım ne olmalıysa onu yap." Önce iki şeyi ayırt etmek gerekti:

1. **Trials of Osiris** — Bungie'nin Public Milestones API'sinde
   gerçek bir tanımı var (`milestoneHash` 2311040624, "Trials
   Returns", doğrulandı). Bugünkü sync'te görünmüyor çünkü bugün
   (2026-08-12, Çarşamba) Trials'ın aktif olduğu bir gün değil —
   mevcut `mapActiveMilestones` pipeline'ı bu, aktif olduğunda zaten
   doğru yakalayacak. **Kod değişikliği gerekmedi.**
2. **Iron Banner** — Bungie'nin 31 kayıtlık milestone tanım
   tablosunda **hiç yok**. Bu mekanizma üzerinden asla
   yakalanamayacak, gerçek bir boşluk.

Iron Banner için WebSearch ile resmi bir kaynak bulundu: Bungie'nin
kendi `@DestinyTheGame` hesabı doğrudan duyurmuş — "Iron Banner will
return on June 30, 2026, and then every 4 weeks after." Destiny 2'nin
canlı içerik geliştirmesi bittiği için (ADR-033) bu takvim artık
kalıcı ve değişmeyecek.

## Karar

`lib/providers/destiny/event-mapper.ts`'e `mapIronBanner(now)`
eklendi — gerçek çapa tarihinden (30 Haziran 2026) ve gerçek
periyottan (4 hafta, ~7 günlük pencere) LIVE/ENDED durumunu
hesaplıyor. Canlı bir API sinyali değil ama tahmin de değil —
Bungie'nin kendi resmi, tarihli duyurusundan deterministik bir
formül. Pencereler arası durum bilinçli olarak `UPCOMING` değil
`ENDED` — `eventSyncService`'in `syncHistoryForStatus`'u sadece
`ENDED`'de `finish()` çağırıyor, `UPCOMING` kullansaydım geçmiş kaydı
hiç kapanmaz, `predictNextArrival` (ADR-030) hiç çalışmazdı. Sıradaki
gerçek tarih açıklama metninde ayrıca gösteriliyor.

## Gerekçe

Bu, URF'ten kasıtlı olarak farklı bir karar: URF'ün gerçek bir
periyodu/formülü yok (araştırıldı, yok — ADR-033), o yüzden statik
"ENDED, sinyal yok" placeholder olarak kaldı. Iron Banner'ın ise
gerçek, resmi, tarihli bir çapa noktası ve periyodu var — bu,
tahmin değil hesaplama. Format Warframe'in `voidTrader`/`nightwave`
mantığıyla aynı aile: gerçek zaman damgalarından LIVE/UPCOMING
hesaplamak, sadece kaynak canlı API yerine resmi bir duyuru.

## Sonuçlar

- 88/88 test (5 yeni `mapIronBanner` testi: pencere içi LIVE, pencere
  son günü LIVE, pencereler arası ENDED + sıradaki tarih, sonraki 2
  döngüde tekrar LIVE), `tsc --noEmit`, `npm run build` temiz.
- Gerçek sync ile doğrulandı: `status: ENDED`, açıklama "This window
  ended Tue Aug 04 2026. Next expected Tue Aug 25 2026" — WebSearch'te
  bulunan gerçek pencerelerle (28 Temmuz - 4 Ağustos aktifti, sıradaki
  25 Ağustos) birebir eşleşiyor.
- docs/09_BACKLOG.md'deki `⚠️ Needs Deniz's attention` notu
  güncellendi/kapatıldı.

---

# ADR-035: Kalan Oyunlar Araştırıldı — Warframe'e Yeni Gerçek Sinyal (Deep Archimedea), Diğerlerinde Kullanılabilir Bir Şey Bulunamadı

Status: Accepted

Date: 2026-08-12

## Bağlam

"Sonraki aşama ne" sorusuna Deniz'in seçimi: kalan oyunları (Warframe,
PoE, Helldivers 2, Foxhole) URF/Iron Banner'daki gibi gerçek,
doğrulanabilir sinyaller için araştır. Her biri ayrı ayrı incelendi.

## Bulgular

- **Path of Exile** — sıradaki lig (3.30) için "Kasım sonu/Aralık
  başı, muhtemelen 27 Kasım" deniyor ama bu GGG'nin resmi bir
  duyurusu değil, fan sitelerinin tahmini ("expected... likely").
  Iron Banner'daki gibi resmi/tarihli bir kaynak değil — bu güven
  eşiğini geçmiyor. **Hiçbir şey eklenmedi**, mevcut "current league"
  takibi zaten gerçek verilerle çalışıyor.
- **Helldivers 2** — bulunanlar içerik güncellemeleri/roadmap
  (yeni biome'lar, warbond'lar) — "Galactic War campaigns" zaten
  mevcut Major Order API'sinin kapsadığı şey. **Yeni bir şey yok.**
- **Foxhole** — savaş süresi ortalama 20-30 gün ama 1-5 hafta arası
  değişebiliyor, sabit bir takvim yok (Iron Banner'ın aksine).
  **Hesaplanabilir bir şey yok**, mevcut "current war" gerçek zamanlı
  takibi zaten en iyi sinyal.
- **Warframe** — WebSearch "Deep Archimedea"nın haftalık sıfırlanan,
  kalıcı bir endgame aktivitesi olduğunu doğruladı. Bu projenin zaten
  kullandığı `api.warframestat.us` worldstate API'sinde gerçekten
  var olup olmadığı kontrol edildi (canlı istek, 2026-08-12) —
  `archimedeas` alanı gerçekten dönüyor, gerçek `activation`/`expiry`
  zaman damgalarıyla (2026-08-10 → 2026-08-17, haftalık pencereyle
  tutarlı). Bu, zaten var olan bir API alanının hiç kullanılmıyor
  olması — "written but not connected" kalıbının bir varyantı, ama
  bu kez "hiç yazılmamış, ama zaten orada duran gerçek veri."

## Karar

`lib/providers/warframe/event-mapper.ts`'e `mapArchimedea()` eklendi
— Void Trader/Sortie/Archon Hunt ile aynı desen (`activation`/
`expiry`'den `isWithin` ile LIVE/ENDED hesaplama), tamamen gerçek
canlı API verisi, tahmin/statik değil. API'nin döndürdüğü 2 eşzamanlı
girdi (muhtemelen Deep + Temporal varyantları, `type` alanları
`"C T_ L A B"`/`"C T_ H E X"` gibi okunaksız kodlar — hangisinin
hangisi olduğunu ayırt edecek temiz bir isim yok) tek bir "Deep
Archimedea" event'i olarak birleştirildi, çünkü ikisi de aynı gerçek
pencereyi paylaşıyor ve API'de güvenilir bir ayrım yapacak veri yok.

## Sonuçlar

- 91/91 test (3 yeni: pencere içi LIVE, pencere dışı ENDED, veri
  yokken hiç üretilmemesi), `tsc --noEmit`, `npm run build` temiz.
- Gerçek sync ile doğrulandı: `warframe-archimedea` DB'de
  `status: LIVE`, gerçek API verisinden (`ROTATION_MILESTONE`,
  `isLimitedTime: true`).
- PoE/Helldivers 2/Foxhole için kod değişikliği yapılmadı — araştırma
  yapıldı, güven eşiğini geçen bir şey bulunmadı, bu bilinçli bir
  "eklenmedi" kararı, atlanmış bir araştırma değil.

---

# ADR-036: Bilinen Duplicate-Title Sınırı Çözüldü — (gameId, title) Bazlı Collapse, seriesKey Değil

Status: Accepted

Date: 2026-08-13

## Bağlam

ADR-027'nin "Bilinen sınır — kayıt tekrarı" notu ve docs/09_BACKLOG.md'nin
"Known duplicate-title issue (ADR-027)" maddesi, "ARAM: Mayhem"ın
listede iki kez (biri ENDED biri LIVE) göründüğünü, tekilleştirme
yapılmadığını söylüyordu. Bu oturumda önce doğrulandı: ADR-029'un aynı
gün içindeki kararı (Mayhem'in pas-penceresi başlığını artık yeniden
adlandırmaması, kendi ayrı kalıcı satırına sahip olması) bu spesifik
örneği zaten çözmüştü — gerçek canlı event-hub verisiyle doğrulandı,
"ARAM: Mayhem" adı artık sadece `rotating-modes` provider'ından bir kez
geliyor. Ama backlog/ADR notu hiç güncellenmemişti (stale doküman).

Asıl mekanizma (aynı içeriğin her occurrence'ında yeni bir provider id
alması) hâlâ canlı: gerçek DB'de `lol-ranked-season-pass` seriesKey'i
altında "Season 3: Act I" 2025'te ENDED, 2026'da LIVE olarak iki ayrı
satır olarak duruyor — aynı sorunun farklı bir event üzerinde tekrar
görünen hali.

## İlk Yaklaşım ve Neden Terk Edildi

İlk denemede `collapseSeriesToLatest()` doğrudan `Event.seriesKey`'e
göre gruplayıp her seriesKey'den sadece en güncel/en canlı satırı
tutacak şekilde yazıldı. Gerçek DB verisiyle test edilince ciddi bir
hata ortaya çıktı: `lol-ranked-season-pass` seriesKey'i "Season 1: Act
I", "Season 1: Act II", "Season 2: Act I", "Season 2: Act II", "Season
3: Act I" (x2) gibi 6 FARKLI başlığı kapsıyor — hepsi aynı seriesKey'i
paylaşıyor ama her biri gerçekten farklı, ayırt edilebilir bir occurrence.
Sadece seriesKey'e göre collapse etmek bu 6 satırı 1'e indirip 5 tanesini
(gerçek, bilgilendirici, farklı başlıklı geçmiş satırlarını) sessizce
kaybediyordu — bu ADR-031'in seriesKey'i var etme amacının (istatistik
için gruplama, görüntüleme için silme değil) tam tersiydi.

## Karar

`lib/utils/event-series.ts` → `collapseSeriesToLatest()` (gameId,
seriesKey) yerine **(gameId, seriesKey, title)** üçlüsüne göre grupluyor
— yani sadece hem aynı seriesKey'i hem de BİREBİR AYNI başlığı paylaşan
satırlar tekilleştiriliyor. "Season 1: Act I" vs "Season 1: Act II" gibi
aynı seriesKey'li ama farklı başlıklı satırlar dokunulmadan kalıyor.
Sadece dashboard "All Events" (`components/dashboard/watching-list.tsx`
→ `browsableEvents`) ve onboarding event seçici
(`components/onboarding/event-selector.tsx`) listelerine uygulandı —
bunlar "seç/takip et" listeleri, aynı başlığın iki kez görünmesi gerçek
bir bug gibi okunuyor. `/games/[slug]` ve `/events/[slug]` (tam geçmiş
sayfaları) ve "Your Watchlist" bölümü (kullanıcının zaten seçtiği
event'i asla listeden düşürmemeli) bilinçli olarak dokunulmadan
bırakıldı.

## Sonuçlar

- Gerçek prod DB'ye (Neon) karşı doğrulandı (read-only sorgu): 12
  seriesKey'li satırdan sadece 1 tanesi (duplicate "Season 3: Act I")
  düşüyor, diğer 11'i (farklı başlıklı gerçek occurrence'lar dahil)
  aynen kalıyor.
- 98/98 test (7 yeni: `event-series.test.ts`, aynı-seriesKey-farklı-
  başlık senaryosu dahil), `tsc --noEmit`, `npm run build` temiz.
- docs/09_BACKLOG.md'deki stale "Known duplicate-title issue" notu
  düzeltildi.
- İki ayrı stale backlog notu daha bulunup düzeltildi (kod ile doküman
  arasında sessiz sapma bırakmama kuralı, CLAUDE.md "Belgeleme
  Kuralı"): `notification-settings.tsx`'in "hâlâ bağlı değil" notu —
  dosya aslında 2026-08-05'te boş bir stub olduğu için zaten
  silinmişti, bildirim tercihi `/dashboard/settings`'te gerçekten var.

## Aynı Oturumda İkinci Parça — Arena İçin Honest LIVE Placeholder

ADR-024/docs/09_BACKLOG.md, URF'ün kardeşi Arena'nın da aynı
sinyalsizlik problemine sahip olduğunu ("cherry-lobby.json'da tarih
yok") ama eklenmediğini not düşmüştü. Bu oturumda gerçek event-hub
verisi tekrar kontrol edildi (live + PBE, ikisi de sıfır Arena girdisi
— URF'le birebir aynı durum) ve ardından WebSearch ile Arena'nın
gerçek, tarihli, resmi bir kaynaktan doğrulanabilir güncel durumu arandı
— URF'te olmayan bir şey bulundu: Riot'un kendi Patch 26.16 notları
(12 Ağustos 2026, leagueoflegends.com) Arena'nın o an aktif olduğunu
doğruluyor (dengeleme değişiklikleri + haftalık "Bravery Arena"
varyantının geri dönüşü), 25 Haziran 2025'te (Patch 25.13) başlayan
mevcut run'ın parçası olarak. Bu, Iron Banner'ın (Bungie'nin resmi
duyurulmuş takviminden hesaplanan statü, ADR-034) ve Mayhem/Classic'in
(WebSearch ile resmi kaynaklardan doğrulanan kalıcılık, ADR-029)
kullandığı aynı güven eşiği — canlı API sinyali değil ama tarihli,
resmi, doğrulanabilir bir kaynak.

`lib/providers/rotating-modes/provider.ts`'e `rotating-mode-arena`
eklendi: `status: "LIVE"`, `isLimitedTime: true` (Mayhem/Classic'in
aksine Arena kalıcı olarak onaylanmadı, hâlâ rotasyonlu — WebSearch
"not a permanently-available mode, it still rotates" diyor).
Description doğrulama tarihini (2026-08-13) ve kaynağı açıkça belirtiyor
ki gelecekte bayatlarsa fark edilsin. Dosyanın en üstündeki "tek kural"
yorumu da güncellendi: artık `LIVE` sadece "yapısal olarak kalıcı"
anlamına gelmiyor, "tarihli/resmi kaynaktan doğrulanmış rotasyonlu mod"
durumunu da kapsıyor (Iron Banner ile aynı desen).

## Sonuçlar (Arena, ilk hali)

- `tsc --noEmit`, `npm run build`, 98/98 test temiz (bu ekleme için ayrı
  test yazılmadı — dosyadaki diğer statik `KNOWN_MODES` girdileri de
  test edilmiyor, aynı "düz veri" sınırı).
- `rotatingModesProvider.getEvents()` doğrudan çalıştırılıp gerçek
  çıktı doğrulandı (id, status, description).

## Düzeltme — Deniz'in İtirazı: "yakalayamamışız, URF gelince de yakalamayabilir miyiz"

Deniz haklı bir noktaya değindi: Arena'yı `LIVE` yapmak, Iron Banner ile
aynı güven sınıfında değildi. Iron Banner'ın kodu (`mapIronBanner()`)
Bungie'nin duyurduğu sabit formülü **her sync'te yeniden hesaplıyor** —
kendi kendini güncelleyen gerçek bir sinyal. Arena'ya yazılan `status:
"LIVE"` ise sabit bir string: bir kere WebSearch yapıldı, o anki gerçek
koda donduruldu. Riot Arena'yı rotasyondan çıkarsa, hiçbir mekanizma bunu
fark edip `ENDED`e çevirmeyecekti — tıpkı URF geri dönse bile hiçbir
mekanizmanın onu `LIVE`e çevirmeyeceği gibi (mevcut event-hub sinyalsizliği
aynen sürüyor). Bu, "iddia edilen şey her zaman doğrulanabilir bir
gerçeğe dayanmalı" ilkesini bir kerelik anlık görüntüyü kalıcı iddiaya
çevirerek ihlal ediyordu.

Araştırıldı: gerçek, otomatikleştirilebilir bir alternatif var mı?
Riot'un patch notları için yapılandırılmış (JSON/API) bir kaynak yok,
sadece HTML sayfası — kazınsa bile "Arena" kelimesinin geçmesi "şu an
oynanabilir" anlamına gelmiyor ("kaldırılıyor" cümlesiyle "canlı" cümlesini
ayırt edemez), bu projenin PoE'nin fan-site tahminini veya Overwatch 2/
GW2'nin statik takvimini reddettiği aynı gerekçeyle reddedilmesi gereken
bir kaynak sınıfı.

**Karar:** Arena `status: "LIVE"` → `status: "ENDED"`'e geri döndürüldü,
URF'ün aynı honest çerçevesine (dürüst, sinyalsizliği kabul eden, ama
takip edilebilir placeholder). Description, Patch 26.16 doğrulamasını
hâlâ içeriyor ama artık "bu bir anlık görüntüydü, kalıcı bir canlı sinyal
değil" diye açıkça belirtiyor. Dosyanın en üstündeki "tek kural" yorumu
da düzeltildi: `LIVE` artık sadece yapısal kalıcılık VEYA her çalıştırmada
yeniden hesaplanan gerçek bir formül (Iron Banner) için kullanılabilir —
"bir kere doğruladım, canlıydı" türü donmuş anlık görüntüler asla LIVE
gerekçesi olamaz.

## Sonuçlar (düzeltme)

- `tsc --noEmit`, `npm run build`, 98/98 test temiz.
- `rotatingModesProvider.getEvents()` tekrar çalıştırılıp Arena'nın artık
  `status: "ENDED"` döndürdüğü doğrulandı.

---

# ADR-037: Gerçek Canlı Sinyal Bulundu — `clientconfig.rpg.riotgames.com`, URF/Arena Artık Sahte Anlık Görüntü Değil Gerçek API

Status: Accepted

Date: 2026-08-13

## Bağlam

Deniz'in ADR-036'daki düzeltmeye tepkisi net bir soruydu: "URF gelince
de yakalayamayabilir miyiz? Bu bizim en büyük USP'miz, web scraper ya da
güvenli başka bir kaynak bulmaya çalışsak?" — yıllardır (ADR-017'den
beri) "böyle bir sinyal yok" denen şeyin gerçekten var olup olmadığını
son bir kez, ciddiyetle araştırmak için haklı bir itki.

## Keşif

`isurfback.com` (daha önce "metodolojisini açıklamıyor, güvenilemez"
diye not düşülmüş 3. parti bir site) incelendi — sayfasının SSR HTML'ine
gömülü **gerçek, bölge bazlı, `isActive` alanlı canlı veri** bulundu
(örn. Arena EUW1/JP1/KR'de aktif, URF hiçbir yerde değil). Bu, sitenin
gerçek bir arka ucu olduğunu kanıtladı. Onu takip ederek Riot'un kendi,
**hiç API key gerektirmeyen, herkese açık**
`clientconfig.rpg.riotgames.com` servisi bulundu — League Client'ın
giriş ekranından ÖNCE Play menüsünü doldurmak için kullandığı config
servisi. İçinde tam aranan alan var:
`lol.<region>.operational.queues.queueConfigs[].{isEnabled,isVisibleInClient}`
— her queueId için, bölge bazında, gerçek zamanlı (`Cache-Control:
max-age=5`) bir "şu an açık mı" sinyali.

## Sevkiyat Öncesi Yakalanan Ciddi Hata

İlk implementasyon TEK bir istek atıp (region=NA1 parametresiyle) o
tek response'un içindeki TÜM bölgelerin dotted-key'lerini okuyordu —
çünkü response gerçekten de her bölgenin anahtarını içeriyordu. Ama
isurfback.com'un verisiyle çapraz kontrol edilince (URF'ün hiçbir
bölgede aktif olmaması gerekirken kodun 14 bölgede "LIVE" üretmesi)
gerçek bir hata ortaya çıktı: **bir bölgenin `queueConfigs`'i SADECE o
bölgenin kendi `region=` parametresiyle atılan istekte doğru** —
başka bir bölge parametresiyle gelen response'daki aynı anahtar
bayat/yanlış. Doğrudan doğrulandı: `region=NA1` ile atılan istekte
EUW1 900 numaralı kuyruk (URF) `isEnabled:true` görünüyordu; aynı
anda `region=EUW1` ile atılan istekte AYNI kuyruk `isEnabled:false`
dönüyordu. **Düzeltme:** 15 bölgeye paralel, ayrı ayrı istek
(`lib/providers/lol-client-config/client.ts` →
`getAllRegions()`), her bölgenin durumu SADECE kendi isteğinin
response'undan okunuyor. Bu regresyonu bir daha sessizce
bozulmayacak şekilde `event-mapper.test.ts`'e özel bir test eklendi
("only reads a region's status from that region's OWN response").

## Karar

`lib/providers/lol-client-config/` (yeni provider, `poe`/`warframe`
ile aynı dosya deseni: `client.ts`/`constants.ts`/`event-mapper.ts`/
`service.ts`/`provider.ts`/`types.ts`) eklendi ve registry'ye
kaydedildi. 5 gerçek queue id'yi ayrı ayrı satır olarak takip ediyor
(ADR-026'nın queue-level granularity ilkesiyle aynı): URF (900),
Pick URF (1900), Arena (1700), Bravery Arena (1740), Arena 3x6
(1750). Her biri "en az 1 bölgede enabled+visible ise LIVE" kuralıyla
hesaplanıyor, description hangi bölgelerde canlı olduğunu gerçek
isimleriyle listeliyor. `rotating-modes/provider.ts`'deki eski statik
URF/Arena placeholder'ları (ADR-024/ADR-036) kaldırıldı — artık gerçek
sinyal var, honest-ama-sinyalsiz bir varsayılana gerek yok.

Bu, ADR-036'nın koyduğu kuralı ("LIVE sadece yapısal kalıcılık veya
her sync'te yeniden hesaplanan gerçek formül") tam karşılıyor: her
sync'te 15 gerçek HTTP isteğiyle yeniden hesaplanıyor, dondurulmuş bir
anlık görüntü değil.

## Doğrulama ve Dürüst Sınırlar

- Gerçek canlı veriyle test edildi: URF/Pick URF artık her yerde
  `ENDED` (isurfback'in "anyUrfLive:false"'uyla birebir eşleşiyor),
  Bravery Arena NA1/LA1/LA2'de, Arena 3x6 geri kalan çoğu bölgede
  `LIVE` — isurfback'in NA1/JP1/KR/OC1 verisiyle tam eşleşiyor.
- Tam eşleşmeyen birkaç nokta da bulundu (RU/TR1 için isurfback
  "hiçbir şey aktif değil" derken clientconfig Arena 3x6 + Mayhem
  gösteriyor; EUW1'de hangi Arena alt-varyantının aktif olduğu iki
  kaynak arasında birkaç dakikalık ölçüm farkıyla değişebiliyor).
  Bu, isurfback'i sorgulamıyoruz — Riot'un kendi servisini
  sorguluyoruz, isurfback sadece hatamızı yakalamak için bağımsız bir
  çapraz kontrol aracı olarak kullanıldı. Kalan küçük uyuşmazlıklar
  muhtemelen iki sistemin farklı anlarda ölçülmesinden veya
  isurfback'in kendi (bilinmeyen) filtrelemesinden kaynaklanıyor —
  ModeAlert'in kaynağı (Riot'un kendi client config servisi)
  isurfback'ten daha doğrudan/otoriter.
- Bu servis Riot Developer Portal'da dokümante edilmiş resmi bir
  public API değil — League Client'ın kendi iç kullanımı için var,
  key gerekmiyor, CDN üzerinden cache'li. Aynı "resmi olmayan ama
  gerçek client verisi" güven sınıfında CommunityDragon da var; risk
  burada Riot'un bunu bildirimsiz değiştirmesi/kısıtlaması — olursa
  provider `ProviderHealthCheck`'te unhealthy görünür, sessizce
  yanlış veri üretmez (retry/health-check pipeline'ı zaten var).
- 105/105 test (6 yeni, region-izolasyon regresyon testi dahil),
  `tsc --noEmit`, `npm run build` temiz.

---

# ADR-038: ARAM Mayhem ve League Classic de Aynı Canlı Sinyale Taşındı

Status: Accepted

Date: 2026-08-13

## Bağlam

ADR-037'nin ardından doğal bir soru: `rotating-modes/provider.ts`'deki
ARAM: Mayhem ve League Classic girdileri de hâlâ ADR-029'da bir kez
WebSearch ile doğrulanıp koda `status: "LIVE"` olarak donduruldu —
ADR-036'nın kurduğu "asla dondurulmuş anlık görüntü" kuralına göre
teknik olarak aynı sınıf sorun (şu ana kadar sadece "kalıcı, hiç
ENDED olmayacağı zaten varsayılıyor" diye göz ardı edilmişti). Artık
gerçek sinyal elde bulunuyorken bunu düzeltmemek tutarsız olurdu.

## Bulgular

`queues.json`'da League Classic'in gerçek maçlanan queue id'si arandı
— `4300` (statik dosyada görünen "5v5 Jade"/"Classic") canlı
`clientconfig` verisinde hiç yok; gerçek canlı karşılığı `4310`
("Classic", `isSpectatable:true`) ve `4320` — ikisi de na1/euw1/kr'de
tutarlı şekilde enabled. `4310` temsilci queue olarak seçildi.

## Karar

`lib/providers/lol-client-config/event-mapper.ts`'e queue 2400 (ARAM:
Mayhem) ve 4310 (League Classic) eklendi — `status` artık her ikisi
için de canlı hesaplanıyor (≥1 bölgede enabled+visible ise LIVE),
`isLimitedTime: false` ise ayrı, hâlâ geçerli bir yapısal iddia olarak
korundu (Riot'un "kalıcı" dediği gerçeği hâlâ ADR-029'un WebSearch
kanıtına dayanıyor — bunu değiştirmedik, sadece `status`'u dondurulmuş
olmaktan çıkardık). `rotating-modes/provider.ts`'deki eski statik
`lol-mode-aram-mayhem`/`lol-mode-league-classic` girdileri kaldırıldı.

## Sonuçlar

- Gerçek canlı veriyle doğrulandı: her ikisi de şu an kontrol edilen
  15 bölgenin **15'inde de** LIVE — ADR-029'un "kalıcı" iddiasını artık
  varsayım değil, gerçek veri doğruluyor.
- 107/107 test (2 yeni: isLimitedTime:false'un ENDED durumda bile
  korunduğunu, diğer kuyrukların isLimitedTime:true varsayılanını
  doğrulayan testler), `tsc --noEmit`, `npm run build` temiz.

---

# ADR-039: `EventChange` — Alan Bazında Edit Log'u (docs/09_BACKLOG.md P1 Event History'nin Bekleyen "Need"i)

Status: Accepted

Date: 2026-08-13

## Bağlam

Deniz "sırada ne var, onları yapalım" dedi — backlog'daki gerçekten
buildable, bir ürün kararı gerektirmeyen bir sonraki madde arandı.
`EventHistory` sadece LIVE/TRACKING occurrence pencerelerini
(başlangıç/bitiş) tutuyor; title/description/category/isLimitedTime
gibi alanlardaki değişiklikler hiç loglanmıyordu — her sync'te
sessizce üzerine yazılıyordu (`upsertEvent`).

## Karar

`prisma/schema.prisma`'ya `EventChange` modeli eklendi (id, eventId,
field, oldValue, newValue, changedAt — `EventHistory` ile aynı desen,
`onDelete: Cascade`). Migration SQL'i **elle yazıldı**
(`prisma migrate diff` KULLANILMADI, CLAUDE.md kuralı gereği) —
sadece `CREATE TABLE`/`CREATE INDEX`/`ADD CONSTRAINT`, deploy
öncesi/sonrası satır sayıları (70 event/55 history/4 user/31
watchlist/10 notification/9 game) birebir doğrulandı.

`lib/services/event-change-detector.service.ts`'e `diffEventFields()`
eklendi (pure, test edilebilir) — title/description/status/category/
isLimitedTime'ı karşılaştırıp gerçek farkları döndürüyor.
`eventChangeHandlerService` artık her sync'te bu farkları
`eventChangeService` üzerinden kalıcı hale getiriyor — status
değişikliği bildirim tetiklemese bile (örn. sadece description
değiştiyse). `/events/[slug]`'a mevcut Timeline'ın altına yeni bir
"Changes" bölümü eklendi.

## Doğrulama

- Gerçek DB'ye karşı uçtan uca doğrulandı: gerçek bir event'e
  (`riot-champion-rotation`) `eventChangeHandlerService.handle()`
  üzerinden gerçek bir description farkı geçirildi, doğru
  `EventChange` satırının oluştuğu onaylandı, test artifact'ı hemen
  silindi — asıl `Event` satırına dokunulmadığı da doğrulandı (`handle()`
  upsert yapmıyor, sadece `event-sync.service.ts`'in kendisi yapıyor).
- 114/114 test (7 yeni: `diffEventFields` pure-function coverage —
  null/undefined description eşitliği, boolean stringification, çoklu
  eşzamanlı alan değişikliği dahil), `tsc --noEmit`, `npm run build`
  temiz.
- Geriye dönük doldurulamaz (diğer "yeni enstrümantasyon" özellikleri
  gibi) — 2026-08-13'ten itibaren gerçek edit'leri kaydetmeye
  başlıyor.

---

# ADR-040: "False Positive" — Gerçek Kullanıcı Geri Bildirimi, Tahmin/Sezgi Değil

Status: Accepted

Date: 2026-08-13

## Bağlam

docs/09_BACKLOG.md'nin P1 Statistics bölümünde "False positives" uzun
süredir "ne anlama geldiği belirsiz, ürün kararı gerekiyor" diye
işaretliydi. Deniz'e üç somut tanım seçeneği sunuldu (kullanıcı
"yanlıştı" işaretlemesi / statü çırpınması otomatik tespiti / zaten
var olan prediction accuracy) — **kullanıcının gerçekten işaretleyip
raporlayabilmesini** seçti. Bu, projenin "asla tahmin/varsayım,
sadece gerçek sinyal" ilkesiyle en tutarlı seçenek — otomatik
"flapping" tespiti bir şeyin yanlış olduğunu varsayardı, kanıtlamazdı.

## Karar

`Notification.falsePositiveReportedAt` (nullable `DateTime`) eklendi
— additive migration, hand-written SQL, deploy öncesi/sonrası satır
sayıları (70/55/4/31/10/9) birebir doğrulandı. `null` = hiç
raporlanmadı; ilk raporlama anında set edilir, tekrar tıklama
zaman damgasını değiştirmez (idempotent, `WHERE ... AND
falsePositiveReportedAt IS NULL` ile).

- `notification.repository.ts`: `reportNotificationFalsePositive()`,
  `getFalsePositiveStats()`.
- `PATCH /api/notifications` mevcut `markRead`/`markAllRead`
  deseniyle genişletildi — `{ id, falsePositive: true }` body'si yeni
  aksiyonu tetikliyor.
- `components/notifications/notification-item.tsx`'e "This was wrong"
  butonu eklendi (rapor edildikten sonra "Reported as wrong" olarak
  devre dışı kalıyor) — hem navbar zil dropdown'ında (`notification-
  center.tsx`) hem `/dashboard/notifications`'ta gerçek.
- `/statistics`'e yeni bir "Reported as wrong" kutusu eklendi —
  `globalStatisticsService`'in mevcut honest-empty-state desenini
  izliyor (hiç bildirim yoksa "No notifications sent yet", varsa
  gerçek oran + "`X of Y notifications ever sent`").

## Doğrulama

- Gerçek DB'ye karşı uçtan uca doğrulandı: gerçek bir bildirime
  `reportFalsePositive` çağrıldı (1 satır güncellendi), ikinci çağrı
  idempotent olduğu için 0 satır güncelledi ve zaman damgası
  değişmedi, `globalStatisticsService.get()` doğru oranı (1/10 = %10)
  hesapladı — sonra orijinal `null` durumuna geri döndürüldü.
- `tsc --noEmit`, `npm run build` temiz. Bu özellik için ayrı unit
  test yazılmadı — mevcut `read`/`markRead` toggle'ı da test
  edilmiyor, aynı "CRUD plumbing, pure function değil" sınırı
  (gerçek DB'ye karşı end-to-end doğrulama ile telafi edildi).

---

# ADR-041: Monetization — Free/Premium Paywall, Lemon Squeezy (Stripe Değil)

Status: Accepted

Date: 2026-08-13

## Bağlam

Deniz monetization stratejisini konuşmak istedi — docs/08_BUSINESS_MODEL.md
hâlâ boştu ve son karar (ADR-009, 2026-08-05) parayı şimdilik erteleyip
oyun/event sayısını artırmayı seçmişti. Uygulamada hiçbir ücret
duvarı yoktu: watchlist sınırsız, prediction/statistics herkese açık,
ödeme sağlayıcısı hiç entegre değildi.

## Ödeme sağlayıcısı araştırması — Stripe reddedildi

Varsayılan seçim Stripe olurdu, ama WebSearch ile doğrulandı: **Stripe,
Türkiye merkezli işletmeler için resmi olarak desteklenmiyor** — ABD'de
şirket kurup EIN almadan doğrudan kullanılamıyor. Discord/RSO'daki
"Türkiye'den VPN'siz erişilemez" kısıtına benzer bir engel (bkz.
ADR-003/ADR-005), bu kez ödeme tarafında. Alternatif olarak **Merchant
of Record** modeli (Lemon Squeezy/Paddle) araştırıldı — bunlar
Deniz'in yerine "satıcı" gibi davranıp KDV/vergi işini üstleniyor,
Türkiye'den kayıt/ödeme almakta bir kısıt yok. **Lemon Squeezy**
seçildi (Paddle'a göre tek kişilik/indie projeler için daha hızlı
kurulum, "low maintenance" prensibiyle daha uyumlu).

## Paywall yapısı (Deniz'in kararı)

- **Free:** watchlist'te en fazla 5 event (`FREE_WATCHLIST_LIMIT`),
  email bildirimleri sınırsız.
- **Premium ($4.99/ay, sadece aylık plan):** sınırsız watchlist +
  per-event "derin içgörü" bloğu (ortalama süre, tahmini bitiş,
  "typically returns after" — `eventStatisticsService`/
  `eventPredictionService`'in ürettiği her şey). "First tracked"/
  "Times seen" ve ham Timeline/Changes logu herkese açık kalıyor
  (SEO/indexability için de önemli — `/events/[slug]` ve
  `/games/[slug]` sitemap'te).
- **Discord bildirimleri premium'a dahil değil** — henüz inşa
  edilmedi (ADR-003'teki Türkiye erişim engeli hâlâ geçerli), var
  olmayan bir özelliği satmamak için.

## Uygulama

- `prisma/schema.prisma`: `User`'a `plan` (String, default `"FREE"` —
  projedeki `category` alanıyla aynı "Prisma enum değil, TS const"
  deseni, bkz. `lib/constants/event-category.ts`),
  `lemonSqueezyCustomerId`, `lemonSqueezySubscriptionId` (unique),
  `subscriptionStatus`, `subscriptionRenewsAt`. Migration SQL'i **elle
  yazıldı** (CLAUDE.md kuralı gereği `prisma migrate diff`
  KULLANILMADI), deploy öncesi/sonrası satır sayıları (70 event/55
  history/4 user/35 watchlist/10 notification/9 game) birebir
  doğrulandı.
- `lib/constants/plan.ts`: `PLANS`, `FREE_WATCHLIST_LIMIT` (5),
  `ACTIVE_SUBSCRIPTION_STATUSES` (Lemon Squeezy'nin `cancelled`
  durumu hâlâ erişimi koruyor — kullanıcı iptal etti ama dönem sonuna
  kadar Premium kalıyor, `expired` olunca gerçekten düşüyor).
- `lib/repositories/user.repository.ts` (yeni) — plan/subscription
  alanlarına erişim, mimari kuralın gereği (Prisma sadece repository
  katmanında).
- `lib/services/watchlist.service.ts`: `create()` artık plan+count
  kontrolü yapıyor, limit aşılırsa `WatchlistLimitError` fırlatıyor →
  `POST /api/watchlists` bunu 402'ye çeviriyor. Mevcut watchlist'i
  5'in üzerinde olan kullanıcılar (varsa) **korunuyor** — sadece yeni
  ekleme engelleniyor, geriye dönük silme yok.
- `lib/billing/lemonsqueezy-client.ts` — hosted checkout URL
  oluşturma (`checkout[custom][user_id]` ile ModeAlert user id'si
  gömülü, her webhook event'inde geri geliyor), webhook imza
  doğrulama (`unsubscribe-token.ts`'teki aynı HMAC+`timingSafeEqual`
  deseni), customer portal URL'i (Lemon Squeezy API). `LEMONSQUEEZY_*`
  env var'ları boşsa hepsi zarifçe devre dışı kalıyor — Resend/Google
  OAuth'taki "key yoksa sessizce disabled" deseninin aynısı (Deniz
  henüz gerçek bir Lemon Squeezy mağazası açmadı).
- `POST /api/webhooks/lemonsqueezy` — imza doğrulanmadan hiçbir şey
  işlemiyor, `subscription_*` event'lerinde `User.plan`/
  `subscriptionStatus`/`subscriptionRenewsAt`'ı günceller.
- `/pricing` (yeni, public, sitemap'e eklendi) — Free/Premium
  karşılaştırması, oturum durumuna göre doğru CTA (giriş yap / satın
  al / "Premium'dasın").
- `/dashboard/settings`'e "Subscription" bölümü + `/api/account`
  yanıtına plan/checkout/manage-URL alanları eklendi.
- `/events/[slug]` ve `/games/[slug]`: Premium olmayan kullanıcılara
  ortalama süre/tahmini bitiş/"typically returns after" blokları
  gerçek şekliyle ama bulanıklaştırılmış (`PremiumTeaser` — yeni
  paylaşılan component) gösteriliyor, üstünde `/pricing`'e giden bir
  kilit ikonu.
- Onboarding'in `FinishStep`'i ve dashboard'ın `WatchingList`'i artık
  402'yi özel olarak yakalayıp "free limite ulaştın, upgrade et"
  mesajı gösteriyor — genel bir hata mesajı değil.

## Doğrulama

- Gerçek DB'ye karşı uçtan uca doğrulandı (seed/test amaçlı `demo`
  kullanıcısıyla, gerçek kullanıcı verisine dokunulmadı): 5 gerçek
  event eklendi, 6.'sı `WatchlistLimitError` ile doğru şekilde
  reddedildi; kullanıcı `PREMIUM`'a çevrilince aynı 6. event sorunsuz
  eklendi; sonunda watchlist temizlendi, plan `FREE`'ye geri alındı.
- Checkout/webhook fonksiyonları env var'lar boşken doğru şekilde
  `null`/`false` döndüğü doğrulandı (henüz mağaza kurulmadığı için
  şu an production'daki gerçek davranış bu — buton gizli, hiçbir şey
  kırık değil).
- 114/114 test (mevcut, bu özellik CRUD/entegrasyon ağırlıklı olduğu
  için yeni pure-function testi gerekmedi — ADR-040'taki aynı sınır),
  `tsc --noEmit`, `npm run build` temiz.
- Marketing kopyasında bir tutarsızlık bulundu ve düzeltildi: FAQ'daki
  "Is ModeAlert free?" cevabı ile hero/features/games/CTA'daki "Free
  during early access" ifadeleri artık gerçek dışı olurdu (paywall
  var artık) — hepsi "Free to start" + FAQ'da gerçek Free/Premium
  ayrımını anlatacak şekilde güncellendi. FAQ, ana sayfanın
  `FAQPage` JSON-LD'sine de besleniyor — geçmişte "hourly"→"daily"
  düzeltmesinde olduğu gibi, machine-readable yapılandırılmış veriye
  yanlış bir iddia sızdırmak kozmetikten daha kötü olurdu.

## Yapılmayan / Deniz'in aksiyonu bekleyen

- **Lemon Squeezy mağazası henüz kurulmadı** — Deniz'in
  lemonsqueezy.com'da hesap açıp bir ürün/variant oluşturması,
  `LEMONSQUEEZY_API_KEY`/`LEMONSQUEEZY_STORE_SUBDOMAIN`/
  `LEMONSQUEEZY_VARIANT_ID`/`LEMONSQUEEZY_WEBHOOK_SECRET`'i hem local
  `.env`'e hem Vercel production'a girmesi gerekiyor — Google
  OAuth'un ADR-005'te canlıya alınma şekliyle birebir aynı desen. O
  zamana kadar `/pricing`'deki "Upgrade" butonu "Upgrades aren't live
  yet" mesajına düşüyor, sistem kırılmıyor.
## Follow-up (aynı gün): iki gerçek eksik bulundu, Lemon Squeezy hesabı beklemeden düzeltildi

Deniz Lemon Squeezy hesap kurulumunu sona bırakıp devam etmemi
söyledi. Bunu beklerken iki gerçek boşluk fark edildi:

1. **`/terms` ve `/privacy` hâlâ "tamamen ücretsiz, ödeme yok"
   diyordu** — "3. Free, early-access service" başlığı, metadata
   description'ı, ve privacy'nin "Who we share data with" bölümü
   Lemon Squeezy'den hiç bahsetmiyordu. İkisi de güncellendi: yeni
   "4. Premium billing" bölümü (Lemon Squeezy Merchant of Record
   olarak tanıtılıyor, kart bilgisi ModeAlert'e hiç gelmiyor,
   aylık $4.99, dilediğin zaman iptal — dönem sonuna kadar erişim
   devam ediyor, **7 gün içinde soru sormadan tam iade** — bu son
   politika Deniz'e sorulmadı, standart/düşük riskli bir metin kararı
   olarak seçildi, kolayca değiştirilebilir). Privacy'ye
   subscription/Lemon Squeezy ID'lerinin toplandığı + Lemon
   Squeezy'nin sadece abonelik durumu bildirdiği eklendi.
2. **Hesap silme, Premium aboneliğini iptal etmiyordu** — bir
   kullanıcı hesabını silse bile Lemon Squeezy'de abonelik
   çalışmaya devam edip onu ücretlendirmeye devam ederdi.
   `lib/billing/lemonsqueezy-client.ts`'e `cancelSubscription()`
   eklendi (`DELETE /v1/subscriptions/{id}`), `DELETE
   /api/account`'a bağlandı — best-effort (Lemon Squeezy hatası hesap
   silmeyi engellemiyor).

Her ikisi de mağaza kurulmadan test edilebiliyor (env boşken
zarifçe no-op) — `tsc --noEmit`, `npm run build` temiz.

---

# ADR-042: TFT "Current Set" ve Destiny 2 Xûr — Gerçek Sinyalle İki Yeni Zenginleştirme

Status: Accepted

Date: 2026-08-13

## Bağlam

Deniz "ürünü biraz daha geliştirelim" dedi, backlog'daki "mevcut
oyunları zenginleştir" maddesini seçti. docs/09_BACKLOG.md'de üç aday
vardı: TFT'nin gerçek "current Set" sinyali (hiç yoktu, sadece
platform status), Destiny 2'de Xûr vendor rotasyonu (haritalanmamıştı),
Valorant'ın genişletilmesi (belirsiz).

## TFT: Set numarası, CommunityDragon'ın canlı ayna dosyasından

Data Dragon'ın `tft-champion.json`'ı (versiyonlanmış, LoL patch'ine
bağlı) denendi önce — en son versiyon (16.16.1) hâlâ Set 17'yi en
yüksek set olarak gösteriyordu. Ama WebSearch, Set 18'in 2026-08-12'de
çıktığını buldu. Çapraz kontrol: CommunityDragon'ın `/latest/cdragon/
tft/en_us.json`'ı (`sets` objesi) gerçekten Set 18'i içeriyordu —
Data Dragon'ın versiyonlanmış anlık görüntüsü CommunityDragon'ın
sürekli güncellenen canlı aynasından daha eski çıktı (LoL'ün
queues.json/event-hub.json'unda zaten güvenilen aynı kaynak sınıfı,
bkz. ADR-037). Gerçek sınırlama: bu dosyanın küçük bir özeti yok, her
locale ~26MB — günlük sync'e gerçek bir maliyet, ama tek çalışan
kaynak old bulundu.

`lib/providers/tft/`'a `mapCurrentSet()` eklendi — `sets` objesindeki
en yüksek sayısal anahtarı "şu anki set" olarak alıyor, `tft-set-{N}`
id'siyle (yeni bir set çıkınca eski otomatik ENDED olur, source-scoped
expiry sayesinde — yeni set çıkışı gerçek, bildirilebilir bir
değişiklik haline geliyor), `seriesKey: "tft-set"` ile (geçmiş
set'lerin ortalama süresini/tahminini görebilmek için, ADR-031'deki
aynı mekanizma). CDragon'ın gömülü `name` alanına güvenilmedi — Set
18 için "Set10" gibi yanlış/placeholder bir değer döndürüyordu; sadece
sayısal anahtardan "Set N" üretildi.

## Destiny 2: Xûr, gerçek Bungie milestone verisi yok — resmi, yıllardır sabit takvimden hesaplandı

`Destiny2/Milestones/` canlı olarak çekilip doğrulandı: 12 milestone
var, hiçbiri Xûr değil (o bir vendor, milestone değil). Bungie'nin
vendor-envanteri API'si karakter bazlı OAuth istiyor — bu, LCU'nun
kişiselleştirme kapsamı dışında tutulma gerekçesiyle aynı sınırda
(ADR-001), ModeAlert'in "login gerektirmeyen public veri" ilkesine
aykırı. Ama Xûr'un takvimi (Cuma 17:00 UTC günlük reset'te gelir, Salı
17:00 UTC haftalık reset'te gider) yıllardır sabit ve Destiny'nin
sezon/set içeriğinden bağımsız bir çekirdek mekanik — Iron Banner'ın
aksine (onun kadansı gerçekten değişmişti, ADR-033/034), bu asla
"askıya alınmadı", o yüzden ayrı bir resmi duyuru anchor'ına gerek
yok. WebSearch ile güncelliği doğrulandı (2026-08-13).

`lib/providers/destiny/event-mapper.ts`'e `mapXur(now)` eklendi —
`mapIronBanner`'ın yanına, aynı "her sync'te gerçek UTC zamanından
yeniden hesapla" ilkesiyle. Haftanın günü + saatten en son Cuma
17:00 UTC reset'i buluyor, +4 gün penceresiyle LIVE/ENDED
hesaplıyor.

## Doğrulama

- **TFT:** gerçek CDragon fetch'i çalıştırıldı (RIOT_API_KEY o an yine
  24 saatlik expire'a girmişti — platform-status çağrısı bundan
  etkilendi, ilgisiz bir sorun; `tftClient.getSetData()` doğrudan
  test edildi) — `sets` anahtarları `[1,3,4,5,7,13,14,15,16,17,18]`
  döndü, `tft-set-18` LIVE olarak üretildi.
- **Destiny:** gerçek `destinyService.getEvents()` çalıştırıldı —
  bugün (2026-08-13, Perşembe) Xûr doğru şekilde ENDED, açıklamada
  "Back Fri, 14 Aug 2026 17:00:00 GMT" (yarın) — gerçek takvimle
  birebir örtüşüyor.
- 122/122 test (8 yeni: `mapCurrentSet` için 3, `mapXur` için 5 —
  hafta sınırlarındaki geçişler dahil), `tsc --noEmit`,
  `npm run build` temiz.

## Yapılmayan

- **Valorant genişletmesi araştırıldı ama eklenmedi** — platform
  status + act tespiti dışında gerçek, doğrulanmış, public bir sinyal
  bulunamadı (Night Market/mağaza rotasyonu hesap bazlı, OAuth
  gerektiriyor — aynı "kişiselleştirme kapsamı dışı" sınırı). Yarım
  doğrulanmış bir şey eklemektense boş bırakmak, projenin "asla
  tahmin/varsayım" ilkesiyle tutarlı. Backlog'da açık kaldı.

---

# ADR-043: 10. Oyun — PUBG: BATTLEGROUNDS (gerçek "current season" sinyali)

Status: Accepted

Date: 2026-08-13

## Bağlam

Deniz "oyunları çok fazla arttırmamız lazım, az şuan" dedi. Geniş bir
araştırma yapıldı — sonuçlar ve reddedilenler için bkz. "Yeni Oyun
Araştırması (2026-08-13)" başlıklı Idea notu. **PUBG** ve **World of
Warcraft (Battle.net)** gerçek, düşük sürtünmeli (Discord/VPN/IP-kilit
gibi bir engel yok) adaylar olarak bulundu; Deniz ikisi için de key
almayı kabul etti. PUBG key'i geldi (developer.pubg.com, self-serve,
anında aktif); Battle.net tarafında bir sorun yaşandı (Deniz'in
notu: "bu pubgydi battle net nedense çalışmıyor şuan") — o yüzden bu
ADR sadece PUBG'yi kapsıyor, WoW ayrı bir ADR'de (key çalışınca)
eklenecek.

## Bulgular

`https://api.pubg.com/shards/steam/seasons` — gerçek key ile canlı
test edildi, resmi PUBG Developer API (KRAFTON), IP kilidi yok
(Supercell'in aksine — bkz. reddedilenler). Her sezon nesnesinde
gerçek bir `isCurrentSeason: true/false` alanı var — tam olarak bu
projenin her yerde aradığı "şu an aktif mi" sinyali, tahmin değil.
`/status` endpoint'i sadece API'nin kendisinin ayakta olduğunu
doğruluyor (gerçek bir oyun/sunucu durumu değil), o yüzden platform
status eklenmedi — sadece sezon.

Sezon id'leri ("division.bro.official.pc-2018-42") insan-okunur bir
isim taşımıyor; sondaki sayı (42) PUBG'nin kendi sitesinde/oyun içinde
gösterdiği gerçek sezon numarası, "Season 42" olarak üretildi (CDragon
`sets[N].name`'in Set 18 için yanlış çıkmasından ders alınarak, gömülü
bir "isim" alanına değil, doğrulanabilir sayısal bir alana güvenildi).

## Karar

`lib/providers/pubg/` (poe/warframe ile aynı dosya deseni) eklendi,
registry'ye kaydedildi. `PUBG_API_KEY` env var'ı (`lib/config/env.ts`,
key yoksa provider `enabled: false` — Resend/Google/Bungie'deki aynı
"sessizce devre dışı" deseni). Yeni `Game` satırı (`id: "pubg"`)
prod DB'ye elle eklendi (schema değişikliği değil, sadece veri —
CLAUDE.md'nin migration kuralı `ALTER`/`CREATE` gibi DDL'i kapsıyor,
bu sadece bir `INSERT`; satır sayısı ekleme öncesi/sonrası doğrulandı,
9→10). `GAME_IDS.PUBG`, `GAMES_WITH_PROVIDER`'a otomatik dahil oldu.
`react-icons/si`'nin gerçek `SiPubg` marka ikonu kullanıldı (emoji
fallback yerine, LoL/Valorant/Fortnite/Destiny'deki aynı desen).

## Doğrulama

- Gerçek key ile `pubgService.getEvents()` çalıştırıldı: `Season 42`
  LIVE olarak üretildi.
- **Tam `providerSyncService.syncAll()` gerçek prod DB'ye karşı
  çalıştırıldı** (sadece izole test değil) — PUBG "received: 1,
  saved: 1", gerçek `Event` satırı (`pubg-season-division.bro.
  official.pc-2018-42`, slug `pubg-season-42-e284e2`) DB'de doğrulandı.
  (Aynı koşuda Riot/Valorant/TFT 401 verdi — `RIOT_API_KEY`'in bilinen
  24 saatlik expire'ı, PUBG'den bağımsız, CLAUDE.md'de zaten
  dokümante.)
- 125/125 test (3 yeni: sezon numarası çıkarma, `isCurrentSeason`
  bulunamayınca boş dönme, sayısız id'ye fallback), `tsc --noEmit`,
  `npm run build` temiz.

## Yapılmayan

- **`PUBG_API_KEY` Vercel production env'e henüz eklenmedi** — sadece
  local `.env`'de. Deniz'in Vercel dashboard'dan eklemesi gerekiyor,
  yoksa prod'da provider `enabled: false` kalır (kırılmaz, sessizce
  devre dışı).
- World of Warcraft (Battle.net) — Deniz'in key alma sürecinde bir
  sorun oldu, ayrıca ele alınacak.

---

# ADR-044: 11. Oyun — PlanetSide 2 (key gerektirmeden, "imkansız" denilen bir varsayım yeniden incelendi)

Status: Accepted

Date: 2026-08-13

## Bağlam

Deniz "tüm oyunları tara, dota vs, hepsini bensiz halledebildiğini
hepsini hallet" dedi — key/hesap gerektirmeyen, tamamen bağımsız
yapılabilecek eklemelere odaklanıldı. Dota 2 araştırıldı (Steam Web
API, OpenDota zaten reddedilmişti) — Valve'ın kendi API'si de key
istiyor ve Dota'nın LoL/Valorant tarzı "rotasyonlu mod" kavramı yok;
gerçek bir sinyal bulunamadı, key gerektirdiği için de bu turda
denenmedi (Deniz'den bir şey istenmedi).

## Bulgu — PlanetSide 2 için önceki "websocket gerekir" varsayımı yanlıştı

docs/09_BACKLOG.md'de PlanetSide 2, Daybreak Census API'sinin
`s:example` paylaşılan servis id'siyle (kayıt gerektirmiyor)
keyless olduğu ama "ilginç veri (aktif 'Alert') temiz bir REST
endpoint'i değil, gerçek zamanlı ESS websocket'i veya `world_event`
geçmişini fark almayı gerektiriyor — bu her sağlayıcının kullandığı
REST-polling deseninden çok daha büyük bir iş" diye not edilmişti.

Bu varsayım yeniden incelendi (ADR-037'nin URF/Arena için "sinyalsiz"
denilen kaynağı yeniden bulduğu deneyimiyle aynı ders — "imkansız"
sonucunu, gerçekten doğru kaynağa bakılıp bakılmadığını kontrol etmeden
kabul etmemek) ve **yanlış çıktı**: `world_event?type=METAGAME&c:sort=
timestamp:-1&c:limit=5` sorgusu, her Alert başlangıç/bitiş geçişini
kendi zaman damgasıyla ayrı bir kayıt olarak döndürüyor — en son
kayda bakmak tek başına "şu an aktif mi" sorusunu cevaplıyor,
websocket'e hiç gerek yok. Ayrıca PS2'nin yıllar süren oyuncu
azalmasıyla tek bir sunucuya (`world_id: 1`, "Osprey") birleştiği
gerçek zamanlı doğrulandı — bu da mimariyi basitleştirdi (tek
sunucu, çoklu sunucu karmaşası yok).

## Karar

`lib/providers/planetside2/` eklendi (poe/warframe deseniyle aynı).
Key gerekmiyor. En son Alert geçişini alıp (`metagame_event`
tanımından gerçek ismi + `duration_minutes`'ı, `zone` tanımından
gerçek kıta ismini eşleştirerek) LIVE ise tahmini bitişi (gerçek
resmi süre verisinden, tahmin değil), ENDED ise sadece "en son ne
zaman bitti"yi gösteriyor — Iron Banner'ın aksine "bir sonraki ne
zaman" iddiası YOK, çünkü Alert'ler nüfus/bölge koşullarından
tetikleniyor, sabit bir takvimi yok (bilmediğimiz bir şeyi uydurmama
ilkesi). `seriesKey: "planetside2-alert"` ile geçmiş Alert'ler
gruplanıyor.

## Doğrulama

- Gerçek canlı veriyle test edildi: en son Alert ("Hossin Unstable
  Meltdown", Hossin kıtası) ENDED olarak doğru tespit edildi, gerçek
  bitiş zaman damgasıyla.
- **Tam `providerSyncService.syncAll()` gerçek prod DB'ye karşı
  çalıştırıldı** — "received: 1, saved: 1", gerçek `Event` satırı DB'de
  doğrulandı. Yeni `Game` satırı (`id: "planetside2"`) elle eklendi,
  satır sayısı doğrulandı (10→11).
- 129/129 test (4 yeni: LIVE+tahmini bitiş, ENDED+"next" iddiası
  olmaması, boş geçmiş, eksik tanım/kıta fallback'i), `tsc --noEmit`,
  `npm run build` temiz.

## Yapılmayan

- Dota 2 — key gerektiriyor (Steam Web API), bu turda denenmedi
  (Deniz'den bir şey istemeden ilerleme kararına uyuldu). Gerçek bir
  "rotasyonlu mod" kavramı da yok — OpenDota'nın zaten reddedilen
  sorunundan (ADR bağlamı, "her lig, filtre yok") bağımsız olarak,
  Dota'nın kendisi bu ürünün "limited-time mode" konseptine LoL/
  Valorant kadar iyi oturmuyor.
- EverQuest II / DC Universe Online — Daybreak'in aynı Census API'si
  bu oyunları da kapsıyor (keyless), ama çok niş/eski oyunlar,
  Deniz'in mevcut oyuncu kitlesiyle uyuşmuyor — değerlendirilmedi.

- **İlk kullanıcı edinme stratejisi** — Deniz ayrıca konuşmak istedi,
  ayrı bir konu (bu ADR sadece paywall/ödeme altyapısını kapsıyor).
  Önerilen yön: oyun bazlı Reddit toplulukları (zaten desteklenen 10
  oyunun her biri için var) + otantik "indie hacker showcase" tarzı
  paylaşım, zaten yatırım yapılmış SEO altyapısının üstüne. Discord
  toplulukları mantıklı ama Deniz'in Türkiye'den erişimi yok (ADR-003)
  — VPN'e geçince ya da başkasının eliyle değerlendirilebilir. Henüz
  kod/altyapı gerektirmiyor, bir sonraki oturumda ayrıca ele alınabilir.

---

# ADR-045: MVP → Final Product — Bir Sertleştirme Turu (Güvenlik, Doğrulama, Rate Limiting)

Status: Accepted

Date: 2026-08-13

## Bağlam

Deniz "şuankilerle devam, ürünü geliştir, her yönüyle MVP'den final
product haline getir, açık kapı bırakma, büyük bir şirket profesyonel
şekilde kurmuş gibi olsun" dedi. Bu, tek bir özellik değil, tüm
uygulamanın güvenlik/sağlamlık taban çizgisini gözden geçirme isteği
— bu yüzden önce sistematik bir tarama yapıldı (her API route,
`next.config.ts`, şema index'leri, `npm audit`), sonra bulunan gerçek
eksikler kapatıldı. "Never over-engineer" ilkesiyle çelişmemesi için
kapsam bilinçli olarak sınırlandı — bkz. "Yapılmayan" bölümü.

## Bulunan gerçek eksikler ve kapatılmaları

1. **`npm audit`: 13 güvenlik açığı, next.js dahil (SSRF, DoS, cache
   confusion, unauthenticated internal endpoint disclosure).**
   `npm audit fix` ile çoğu (hono/brace-expansion/fast-uri/js-yaml/
   ip-address/effect) düzeldi; kalan 3 yüksek önemli açık
   `next@16.2.10 → 16.3.0` (minor sürüm, breaking değil) gerektiriyordu
   — yükseltildi, `npm audit` artık **0 açık**. Build+test'ler yükseltme
   sonrası da temiz.

2. **Hiçbir API route'unda schema validasyonu yoktu** — `body.x`
   alanları ad-hoc `typeof` kontrolleriyle güveniliyordu, bazı
   route'lar (örn. `/api/notifications` DELETE, `/api/watchlists`)
   hiç kontrol bile yapmıyordu. `zod` eklendi
   (`lib/validation/schemas.ts` + paylaşılan `parseJsonBody()`
   helper'ı, `lib/validation/parse-body.ts`) — her body kabul eden
   route artık gerçek bir şemaya karşı doğrulanıyor, hatalı istek
   tutarlı bir 400 + alan bazlı hata mesajı dönüyor.

3. **Çoğu mutating route'ta try/catch yoktu** — sadece `cron/sync` ve
   `admin/sync`'te vardı. Paylaşılan `withErrorHandling()` wrapper'ı
   (`lib/api/with-error-handling.ts`) her route'a eklendi — beklenmedik
   bir hata artık kontrolsüz bir exception yerine temiz bir JSON 500
   dönüyor, `console.error` ile loglanıyor. `cron`/`admin` sync
   route'ları kendi mevcut try/catch'lerini (admin panelinin beklediği
   özel response şekli yüzünden) korudu, dokunulmadı.

4. **Hiçbir yerde rate limiting yoktu.** `/api/auth/register`
   (unauthenticated + gerçek DB satırı oluşturan, en istismara açık
   route) ve `auth.ts`'in credentials `authorize()`'ı (var olan
   hesap-bazlı lockout'un — 5 başarısız denemede 15 dk kilit —
   yakalayamadığı, bir IP'nin birçok farklı email'i denemesi
   senaryosu) artık IP bazlı, Postgres'e yazılan sabit-pencere rate
   limit'e sahip (`lib/security/rate-limit.ts` +
   `lib/repositories/rate-limit.repository.ts`, yeni `RateLimitHit`
   tablosu). Redis/edge-KV eklenmedi — hacim düşük (sadece auth
   endpoint'leri), mevcut "her şey Postgres'te" altyapı tercihiyle
   tutarlı.

5. **`next.config.ts` tamamen boştu — hiçbir güvenlik header'ı yok.**
   `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`,
   `Permissions-Policy`, `Strict-Transport-Security`, ve gerçek bir
   `Content-Security-Policy` eklendi. CSP nispeten sıkı olabildi çünkü
   bu uygulamada üçüncü parti hiçbir çağrı tarayıcıdan yapılmıyor
   (Riot/Bungie/Resend/Lemon Squeezy hep server-side), fontlar
   `next/font` ile build-time self-host ediliyor, hiç uzak görsel
   yüklenmiyor. `script-src`/`style-src`'te `'unsafe-inline'` bilinçli
   bir orta yol (ana sayfanın JSON-LD script'i + inline `style`
   prop'ları için) — tam nonce-tabanlı sıkı CSP, bu uygulamanın
   karışık static/dynamic render yapısıyla daha derin bir entegrasyon
   isterdi, gerçek bir gelecek iyileştirmesi ama "hiç CSP yok"
   boşluğunu kapatmak için şart değildi.

6. **İki gerçek, kimlik doğrulaması olmayan debug endpoint'i bulundu
   ve silindi:** `/api/providers/riot` ve `/api/providers/
   communitydragon` (`communityDragonService.debug()` — ham upstream
   yanıtlarını `console.log`'layan, anahtar kelime arayan, açıkça
   hiç production için yazılmamış bir geliştirme aracı). İkisi de
   frontend'de hiçbir yerden çağrılmıyordu (grep ile doğrulandı) —
   "yazılmış ama bağlanmamış" değil, "yazılmış, asla bağlanmaması
   gerekirken açıkta bırakılmış" örneği. `/api/providers/
   communitydragon/current` (gerçekten `/live` sayfasından
   kullanılıyor) dokunulmadan kaldı.

7. **Eksik veritabanı index'leri.** `Event.gameId`/`Event.status`,
   `Watchlist.eventId`, `Notification.userId+createdAt` hiç index'li
   değildi — sık sorgulanan alanlar, küçük veri hacminde fark
   etmiyor ama "ölçeklenebilir, profesyonel" hedefiyle şimdi
   eklenmesi ucuz, sonra eklenmesi (tablo büyüdükçe) daha pahalı.
   Ek, geriye dönük veri değişikliği olmayan migration.

8. **Erişilebilirlik: her `<input>`'da `aria-label` eksikti**
   (sadece `placeholder`'a güveniliyordu — placeholder odaklanınca
   kaybolduğu ve tüm ekran okuyucular tarafından güvenilir
   duyurulmadığı için bilinen bir WCAG hatası). signin/signup/
   settings şifre formlarındaki tüm input'lara eklendi. İkon-only
   buton taraması yapıldı (yıldız toggle, bildirim zili, hamburger
   menü) — hepsinde zaten doğru `aria-label`/`aria-pressed` vardı,
   ek düzeltme gerekmedi.

9. **`opengraph-image.tsx`'in `runtime = "edge"`'i deprecated
   uyarısı veriyordu** (Next 16.3.0 upgrade'iyle fark edildi) —
   kaldırıldı, sayfa artık static (○) olarak prerender ediliyor,
   önceden dynamic (ƒ) idi — bonus bir iyileştirme.

## Doğrulama

- Gerçek dev server'a karşı canlı test edildi: güvenlik header'ları
  gerçek bir response'ta doğrulandı; `/api/auth/register`'a bozuk
  body gönderilince alan bazlı 400 hatası döndü; art arda 7 istek
  atılınca rate limit tam beklenen noktada (4 başarılı + öncesindeki
  1 geçersiz-ama-sayılan deneme = 5, sonrası 429) devreye girdi —
  geçersiz denemelerin de limite sayılması bilinçli (aksi halde
  limit, çöp veri göndererek atlatılabilirdi); test için oluşan
  sahte kullanıcılar ve rate-limit kayıtları temizlendi.
- 129/129 test, `tsc --noEmit`, `npm run build`, `npm audit` (0 açık)
  temiz. Migration'lar (index'ler + `RateLimitHit` tablosu) satır
  sayısı doğrulamasıyla deploy edildi.

## Yapılmayan (bilinçli sınır — "Never over-engineer" ilkesi)

- **Public API (REST/API key/rate limiting/dokümantasyon)** —
  docs/09_BACKLOG.md'de zaten "P2 — Public API" olarak duruyor,
  tamamen ayrı bir ürün yüzeyi, Deniz'den açık bir istek gelmeden
  inşa edilmedi.
- **Tam WCAG denetimi / renk kontrastı taraması** — icon-only
  butonlar ve form label'ları (en yüksek etkili, en ucuz kazanımlar)
  kapatıldı; kapsamlı bir denetim (ekran okuyucu testi, klavye
  navigasyonu uçtan uca, renk kontrast oranları) ayrı, daha büyük bir
  iş.
- **Nonce-tabanlı sıkı CSP** — yukarıda gerekçelendirildi, mevcut
  `'unsafe-inline'`'lı CSP zaten hiç CSP olmamasından büyük bir
  iyileştirme.
- **Redis/edge-KV, harici hata izleme (Sentry vb.), yeni
  altyapı/hesap gerektiren hiçbir şey eklenmedi** — mevcut Postgres
  altyapısıyla çözülebilen her şey öyle çözüldü, "low maintenance"
  ilkesiyle tutarlı.

---

# ADR-046: "VC Gibi Düşün" — Readiness Memo'daki Buildable Maddeler

Status: Accepted

Date: 2026-08-13

## Bağlam

Deniz'e ADR-045'in ardından bir "due diligence" memo'su hazırlandı
(bir VC fon yöneticisinin bakış açısıyla — bkz. paylaşılan artifact,
"Due Diligence"). Deniz "PUBG key'i geldiğinde paylaşırım, buna göre
yapılması gerekenleri yap" dedi — memo'nun "Buildable — say the word"
sütunundaki maddeler bu ADR'de uygulandı, "Only Deniz decides"
sütunundakilere (şirket kuruluşu, gerçek kullanıcıya çıkma, fiyat
doğrulama) dokunulmadı.

## Bulgu #1 kapatıldı: sağlık alarmı (tek nokta arıza riski)

Memo'nun en kritik bulgusu — LoL takibinin 24 saatte bir manuel
yenilenen bir key'e bağlı olması, kimsenin fark etmeden günlerce
kırık kalabilmesi — artık sessiz değil. `providerSyncService.syncAll()`
her provider hatası sonrası `healthAlertService.checkAndAlert()`'i
çağırıyor: bir provider art arda 2 sync'te (günlük cron'da bu ~24
saat demek) başarısız olursa, `ADMIN_EMAILS`'e bir kez (her gün tekrar
değil — sadece "2'li seriye yeni girdi" anında) e-posta gidiyor. Saf
geçiş mantığı (`justCrossedIntoOutage`) ayrı, test edilebilir bir
fonksiyona çıkarıldı.

## Bulgu #2 kapatıldı: ilk taraf, gizlilik-dostu analytics

Memo'nun "kimse funnel'ı izlemiyor" bulgusu. Yeni `AnalyticsEvent`
tablosu — sadece giriş yapmış kullanıcılar (anonim/ön-kayıt takibi
YOK, cookie yok, üçüncü parti script yok — privacy policy'nin "no
tracking pixels, no cross-site tracking" sözüyle tutarlı kalması için
bilinçli bir kapsam sınırı). İzin verilen event isimleri sabit bir
allowlist (`ANALYTICS_EVENTS`), serbest metin değil.

Takip edilen gerçek dönüm noktaları: onboarding adım görüntüleme
(hangi adımda bırakıyorlar — memo'nun tam sorduğu şey),
onboarding tamamlama, free limit'e çarpma, signup (parola/Google/
magic-link — üçü de, `auth.ts`'in `events.createUser`'ı + register
route'unun ikisi birden), checkout tıklama, premium aktivasyonu
(`subscription_created` webhook event'inde, yenilemelerde değil).
`/admin`'e yeni bir "Funnel" paneli eklendi (son 30 gün, agregat
sayılar — kişisel veri göstermiyor). Privacy policy güncellendi —
bu izlemeyi dürüstçe açıklıyor.

## Bulgu #5 kapatıldı: haftalık digest (retention mekanizması)

Memo: "bildirim dışında kullanıcıyı geri getiren hiçbir şey yok."
Yeni `weeklyDigestService` — opt-in olan ve en az 1 event izleyen her
kullanıcıya, her Pazartesi, izledikleri her şeyin güncel durumunu
özetleyen bir e-posta. Yeni bir Vercel cron girdisi eklenmedi —
mevcut tek günlük `/api/cron/sync` cron'u, gün Pazartesi ise digest'i
de tetikliyor (`shouldRunToday()`, saf ve test edilebilir).

## Bulgu #6 kapatıldı: moat artık sayfada açıkça yazıyor

Memo: "gerçek bir moat var, hiçbir yerde söylenmiyor." Ana sayfanın
Features bölümü ve `/features` sayfasındaki "Multiple games" kartı,
statik/eski bir oyun listesi yerine gerçek, dinamik
`GAMES_WITH_PROVIDER.size` sayısını ("11 games, one inbox") ve
"ayrı ayrı tracker/Discord bot yerine tek watchlist" farklılaşmasını
açıkça söylüyor. Rakiplerin ne yaptığına dair doğrulanamayan bir
iddia ("kimse bunu yapmıyor") kasıtlı olarak kullanılmadı — sadece
ModeAlert'in kendi değer önerisi.

## Yapılmayan (bilinçli)

- Gerçek e-posta gönderimi (health alert, weekly digest) **tetiklenmedi**
  doğrulama sırasında — gerçek kullanıcılara beklenmedik e-posta gitmesin
  diye. Bunun yerine: geçiş mantığı unit test'lerle (6 test), digest
  alıcı sorgusu ve HTML şablonu gerçek DB'ye karşı salt-okunur
  doğrulandı (3 gerçek kullanıcı, 15/15/1 watchlist, gerçek HTML
  üretildi — hiçbir e-posta yollanmadı).
- Memo'nun "Only Deniz decides" sütunu (şirket kuruluşu, Reddit
  paylaşımı, fiyat doğrulama, risk toleransı, yatırım kararı) —
  hiçbiri bu ADR'nin kapsamında değil, kasıtlı olarak dokunulmadı.

## Doğrulama

- Gerçek DB'ye karşı: `analyticsService.record()` gerçek bir satır
  oluşturdu, `getFunnelCounts()` doğru saydı, test satırı temizlendi.
  `getDigestRecipients()` gerçek 3 kullanıcıyı doğru watchlist
  sayılarıyla döndürdü, `buildDigestHtml()` gerçek event verisinden
  8203 karakterlik geçerli bir HTML üretti.
- 137/137 test (11 yeni: `justCrossedIntoOutage` için 6,
  `shouldRunToday` için 2, önceki analytics/health testleri dahil),
  `tsc --noEmit`, `npm run build` temiz.
- Yeni migration (`AnalyticsEvent` tablosu) satır sayısı
  doğrulamasıyla deploy edildi.

---

# ADR-047: Gerçek Popülerlik Sinyali + Öneri Motoru (fabrikasyon yok, LLM yok)

Status: Accepted

Date: 2026-08-13

## Bağlam

Deniz "devam et, geliştir, eksik ne varsa yap, AI'da geliştirebilirsin"
dedi. docs/09_BACKLOG.md'nin "P2 — AI Features" bölümü uzun süredir
"Popularity estimation" ve "Recommendation engine"'i inşa edilmemiş
olarak listeliyordu.

## Bulgu: `Event.trackedUsers` hep 0'dı — Game.activeUsers'ın (ADR-007)
aynı hatası, farklı tabloda

Kod taraması sırasında bulundu: her provider'ın event-mapper'ı
`trackedUsers: 0`'ı sabit yazıyor (provider'lar gerçek watchlist
sayısını bilemez, bu DB-çapında bir agregasyon), ve bu değer hiçbir
yerde gerçek bir sayıyla ezilmiyordu — sütun DB'de duruyor ama hiçbir
UI onu okumuyordu (grep ile doğrulandı: `components/`'ta sıfır
kullanım). Tam olarak ADR-007'nin düzelttiği `Game.activeUsers`
hatasının aynısı, farklı bir tabloda, hiç yakalanmamış.

## Karar

**Gerçek popülerlik:** `game.service.ts`'in zaten kurduğu deseni
birebir taklit ederek — DB sütununa güvenme, okuma anında gerçek
değerle ez. `watchlist.repository.ts`'e `getTrackedUserCountsByEvent()`
(toplu) ve `getTrackedUserCount(eventId)` (tekil) eklendi;
`eventQueryService`'in her metodu artık gerçek sayıyla dönüyor.
`/events/[slug]`'da "`N` people tracking this" rozeti (0 iken hiç
gösterilmiyor — sahte/boş bir "0 kişi" durumu göstermek yerine
dürüst bir yokluk).

**Gerçek öneri motoru:** LLM YOK — bir modele "bunu önerir misin" diye
sormak, bu projenin "asla uydurma, sadece gerçek sinyal" ilkesine
aykırı olurdu (LLM halüsinasyon riski taşır). Bunun yerine klasik,
gerçek collaborative filtering: `getCommonlyTrackedEventIds(eventId)`
— bu event'i izleyen kullanıcıların gerçekte başka hangi event'leri
izlediğini, kaç kişinin ortak izlediğine göre sıralayarak döndürüyor.
Saf agregasyon, tahmin değil. `/events/[slug]`'a "People tracking
this also track" bölümü eklendi — sonuç boşsa (yeni bir event, ya da
ortak izleyicisi olmayan bir event) bölüm hiç render edilmiyor.

Aynı taramada bulunan, kullanılmayan ölü kod da temizlendi:
`eventQueryService.getLive/getTracking/getUpcoming/getEnded()`
(sıfır çağıran, grep ile doğrulandı) kaldırıldı. Ayrı bir
`eventService` (farklı bir dosya, `dashboard.service.ts` tarafından
gerçekten kullanılıyor) bulundu ama dokunulmadı — bu ADR'nin
kapsamı dışında, gerçek bir kullanıcısı var.

## Bilinçli olarak yapılmayan

- Popülerlik/öneri Premium'a kilitlenmedi — şu an sadece 4 gerçek
  kullanıcı varken bunu ücretli yapmak, kimsenin göremeyeceği bir
  özellik inşa etmek olurdu. Daha fazla veri birikince yeniden
  değerlendirilebilir.
- Dashboard'daki kompakt event kartlarına (`EventStatusCard`) rozet
  eklenmedi — zaten kategori/rotasyon/durum rozetleriyle dolu,
  event detay sayfası bu sinyal için daha doğru yer.
- Gerçek bir LLM özelliği (örn. Claude API ile doğal dilde özet)
  kasıtlı olarak yapılmadı — yeni bir ücretli harici API key'i
  (Deniz'in hesabı + fatura) gerektirirdi, bu turda ondan
  bağımsız, ücretsiz/düşük bakımlı bir "AI" özelliği (gerçek
  collaborative filtering) tercih edildi.

## Doğrulama

- Gerçek DB'ye karşı doğrulandı: `getAll()`/`getById()`/`getBySlug()`
  üçü de aynı, gerçek `trackedUsers` değerini döndürdü (1, ham
  `prisma.watchlist.count()` ile birebir eşleşti). En çok izlenen
  gerçek event ("War #138") için gerçek öneriler üretildi (Allflame
  League, Weekly Clan Engrams, ...) — hepsi gerçek ortak-izleyici
  sayılarıyla.
- 137/137 test, `tsc --noEmit`, `npm run build` temiz. Şema değişikliği
  yok — sadece okuma-zamanı hesaplama, migration gerekmedi.

---

# ADR-048: Gerçek RSS Feed — İki Mevcut Tablo, Hiç Yeni Veri Değil

Status: Accepted

Date: 2026-08-13

## Bağlam

Deniz "devam et" dedi. docs/09_BACKLOG.md'nin "Ideas" bölümünde uzun
süredir inşa edilmemiş duran "Event RSS" maddesi ele alındı — hem
gerçek veriden üretilebilecek, düşük riskli bir özellik, hem de
VC memo'nun "dağıtım/growth motion yok" bulgusuna dolaylı bir katkı
(RSS feed'leri Feedly gibi agregatörler tarafından indexleniyor,
gerçek bir keşfedilebilirlik kanalı).

## Karar

Yeni veri **eklenmedi** — `/feed.xml` iki mevcut, zaten gerçek
zaman damgalı tabloyu birleştiriyor: `EventHistory` (her LIVE/TRACKING
penceresinin gerçek başlangıcı, ADR-002'den beri var) ve `EventChange`
(alan bazlı gerçek düzenlemeler, ADR-039'dan beri var). İkisi de
kendi amaçları için zaten yazılıyordu, hiçbiri syndicate edilmiyordu.
`feed.service.ts` ikisini gerçek zaman damgasına göre birleştirip
sıralıyor — hiçbir item özetlenmiş/uydurulmuş değil, direkt DB
satırlarının kendisi.

`escapeXml` ile güvenli XML üretimi (email şablonlarındaki
`escapeHtml` deseninin aynısı — event title/description üçüncü parti
API verisi, hiç güvenilmiyor). Kök layout'a `alternates.types`
(RSS keşfi için `<link rel="alternate">`), footer'a görünür "RSS"
linki eklendi.

## Doğrulama

- Gerçek dev server'a karşı `curl` ile test edildi: geçerli RSS 2.0
  XML, 50 gerçek item (LoL rotasyon modları, PUBG sezonu, vb.),
  gerçek `pubDate`/`link`/`description` değerleriyle.
- 137/137 test, `tsc --noEmit`, `npm run build` temiz. Şema değişikliği
  yok.

---

# ADR-049: `/calendar` — Araştırılmış Cadence Fallback'i (Sadece PoE, Şimdilik)

Status: Accepted

Date: 2026-08-14

## Bağlam

docs/09_BACKLOG.md'nin "Ideas" bölümünde uzun süredir bekleyen "Event
calendar" maddesi ele alındı. Sorun: `eventPredictionService`'in
"estimated to end" / "typically returns" tahminleri sadece kendi
`EventHistory` verimizden hesaplanıyor (ortalama süre/aralık), ve
tracking 2026-08-04'te başladığı için neredeyse hiçbir event'in 2+
tamamlanmış döngüsü yok — takvim sayfası açıldığında büyük çoğunluk
"not enough history yet" gösterecekti, ki bu teknik olarak doğru ama
ürün olarak boş.

## Karar

`lib/constants/researched-cadences.ts` — gerçek, WebSearch ile
doğrulanmış, kaynak+tarih+caveat'lı, **elle küratörlü, kısa** bir
sabit cadence listesi. Sadece kendi verimiz yetersizken devreye
giriyor (`predictWithResearchedFallback` /
`predictNextArrivalWithResearchedFallback` — kendi hesaplanmış bir
tahmin varsa ona asla dokunmuyor), ve fixed-window formülüyle her
çağrıda taze hesaplanıyor (Destiny'nin `mapIronBanner`'ıyla aynı
desen — dondurulmuş bir tahmin değil).

Şu an listede **sadece bir event var: PoE'nin güncel challenge
league'i** (GGG'nin 2013'ten beri 41 league'lik gerçek geçmişi,
medyan 98 gün, %87.8'i Cuma günü başlamış — kaynak ve tarih
`researched-cadences.ts`'te). Diğer adaylar araştırılıp kasıtlı
olarak **eklenmedi**:

- Çoğu rotasyonlu/limited-time event (Helldivers Major Order'ları,
  Foxhole savaşları, PlanetSide Alert'leri) sabit bir aralıkla değil,
  gerçek dünya koşullarıyla (nüfus, anlatı) tetikleniyor — bir formül
  zorlamak veri kılığına girmiş bir tahmin olurdu.
- **URF** özel olarak araştırılıp reddedildi: Riot'un 2025
  değişiklikleri URF'yi tek bir yıllık slottan, sabit aralığı olmayan,
  sezonluk Act'lere dağıtılmış bir role kaydırdı — sabit bir
  `intervalDays` yazmak gerçek olmayan bir kesinlik iddia ederdi.
- **Arena** zaten daha iyi bir sinyale sahip (ADR-037'nin gerçek canlı
  client-config kontrolü) — formüle ihtiyacı yok.

`confidence` alanı için: kendi geçmiş-tabanlı tahminler
gözlem-başına-yüzde artıyor (10%/appearance, 20%/gap — daha çok
gerçek gözlem, daha çok güven). Araştırılmış cadence'in arkasında
tekrar eden bir iç doğrulama yok, tek bir dış kaynak var — bu yüzden
sabit, mütevazı **50** kullanıldı (istatistiksel kesinlik iddia
etmeyen bir orta değer; gerçek riskler zaten `caveats` metninde
somut olarak yazıyor, örn. PoE league'inin bir kez 322 gün sürdüğü).

`/calendar` sayfası üç bölüm gösteriyor — Live now / Estimated to end
/ Typically returns — hepsi gerçek `eventQueryService`/
`eventPredictionService` çağrılarından, hiçbiri sabit/mock veri değil.
Tarih bilgisi (`LIVE` olmayan satırlar için) `PremiumTeaser` ile
gate'lendi, mevcut per-event prediction/statistics paywall desenini
tekrarlıyor (ADR-041).

## Bilinçli olarak yapılmayan

- Araştırılmış cadence listesi genişletilmedi — her event için
  WebSearch yapıp kaynak bulmak bu ADR'nin kapsamı değil, ihtiyaç
  ortaya çıktıkça (bir event'in kendi geçmişi birikene kadar gerçekten
  boş kalması) tek tek eklenecek bir şey.
- Takvim ayrı bir görsel takvim/ay ızgarası değil — üç sıralı liste.
  Gerçek bir ay görünümü (FullCalendar tarzı) daha büyük bir UI
  yatırımı; şu an gösterilecek veri hacmi (tek haneli sayıda
  limited-time event) onu haklı çıkarmıyor.

## Doğrulama

- `predictFromResearchedCadence` için 6 yeni unit test (null durum,
  cycle içi, cycle sınırı, rollover, anchor öncesi clamp, kaynak/
  caveat aktarımı) — hepsi geçiyor.
- `predictNextArrival`/`predictNextArrivalBySeriesKey`'in de aynı
  fallback'i kullanacak şekilde genişletilmesi (ilk taslakta sadece
  `predict`/`predictBySeriesKey` kullanıyordu — asimetrikti, "typically
  returns" PoE gibi bir event bittiğinde araştırılmış tahminden
  faydalanamıyordu) bu turda tamamlandı.
- 143/143 test, `tsc --noEmit` temiz. Şema değişikliği yok — sadece
  yeni bir sabit dosya + saf hesaplama fonksiyonları.

---

# ADR-050: `/statistics` Görsel Zenginleştirme — Popülerlik Heatmap'i + Bar Chart'lar

Status: Accepted

Date: 2026-08-14

## Bağlam

Deniz iki şey istedi: `docs/09_BACKLOG.md`'nin "Ideas" bölümünde bekleyen
"Event popularity heatmap" maddesi, ve `/statistics` sayfasının
dataviz skill'iyle görsel olarak zenginleştirilmesi (sayfa tamamen
düz liste/kart metniydi, hiç grafik yoktu).

## Karar

**Popülerlik heatmap'i** — yeni veri değil, mevcut gerçek sinyalin
(ADR-047'nin `trackedUsers` — okuma anında gerçek `Watchlist`
satırlarından hesaplanıyor, DB'deki hep-0 kolon değil) oyun × kategori
kırılımında toplanması. `globalStatisticsService.get()`'e
`computePopularity()` eklendi: `eventQueryService.getAll()`'dan gelen
her event'in `trackedUsers`'ı `(gameId, category)` hücresine
ekleniyor. `components/statistics/popularity-heatmap.tsx` (client,
hover/focus tooltip'li, klavye erişilebilir hücreler, "View as table"
ile tam erişilebilir tablo fallback'i).

**Renk:** dataviz skill'inin metoduyla — tek hue (marka moru), sequential
encoding, dark-mode'da "flips anchor" kuralına göre düşük değer siyah
yüzeye yaklaşıyor (neredeyse görünmez), yüksek değer en parlak adım.
Tailwind purple-950→purple-400 arası 4 gerçek adım + "veri yok" için
ayrı, neredeyse şeffaf bir 5. adım. Kategorik validator'ı bu ramp'a
kasıtlı olarak çalıştırmadım — skill'in kendi notu ("running the
categorical validator on a sequential ramp will FAIL by design") bunu
açıkça söylüyor; onun yerine hücre-içi metin/arkaplan kontrastını
`validate_palette.js`'in export ettiği `contrast()` fonksiyonuyla tek
tek doğruladım (en kötüsü 5.38:1, hepsi 4.5:1 eşiğinin üzerinde).

**Bar chart'lar:** "Most tracked events" ve "Average duration by game"
düz listeden `components/statistics/magnitude-bar-list.tsx`'e
(tek seri → tek marka rengi, legend gerekmiyor) geçti. "Provider
uptime" `components/statistics/uptime-bars.tsx`'e — bu gerçekten bir
sağlık/state metriği olduğu için (seri değil) sabit status paletini
(good/warning/critical, ikon+label ile) kullanıyor, kategorik renk
değil.

## Bilinçli olarak yapılmayan

- "Average duration, overall" ve "Prediction accuracy" gibi tekil
  headline sayılar grafiğe çevrilmedi — skill'in kendi kuralı: "bazen
  cevap grafik değil, bir stat tile'dır." Zaten tek büyük sayı olarak
  okunuyorlar, bir bar/çizgiye zorlamak gürültü olurdu.
- Heatmap tüm 11 oyunu göstermiyor, sadece gerçek trackedUsers'ı olan
  oyunları — 0 popülerliği olan satırları göstermek "veri yok"
  ile "gerçekten sıfır" arasındaki farkı bulanıklaştırırdı; component
  zaten tamamen boşsa dürüst bir empty-state mesajı veriyor.

## Doğrulama

- Gerçek dev server'a karşı görsel olarak test edildi: heatmap 13
  gerçek dolu hücre gösteriyor (ör. Destiny 2 × Rotation & Milestones
  = 7, League of Legends × Season/Battle Pass = 7), tooltip'ler doğru
  oyun/kategori/değer gösteriyor, "View as table" gerçek verilerle
  açılıyor, uptime bar'ları gerçek Riot key expiry sorununu kırmızı
  "Unhealthy" olarak doğru yakalıyor.
- 143/143 test, `tsc --noEmit` temiz. Şema değişikliği yok — sadece
  mevcut gerçek verinin yeni bir agregasyonu ve görsel katman.

---

# ADR-051: Watchlist — Oyun Bazlı Takip (`GameWatchlist`), Premium-only

Status: Accepted

Date: 2026-08-18

## Bağlam

`docs/09_BACKLOG.md`'nin "P1 — Watchlists / Future" bölümünde uzun
süredir açık duran bir madde: "Follow by Game/Queue/Champion
(currently only Event-level)". Deniz'e sıradaki geliştirme için
seçenek sunuldu, bu maddeyi seçti.

## Karar

Yeni, ayrı bir tablo — `GameWatchlist` (`userId`, `gameId`,
`@@unique([userId, gameId])`) — mevcut `Watchlist`'e nullable bir
`eventId` eklemek yerine. Gerekçe: `Watchlist`'in free-plan
limit sayacı (`countWatchlistsByUser`, ADR-041) event satırlarını
sayıyor; `eventId`'si null olabilen karma bir tabloda bu sayaç
anlamsızlaşırdı.

**Premium-only** (Free plan'da hiç kullanılamıyor, limit'e dahil
değil) — bir oyunun *tamamını* (şu anki + gelecekteki her event)
takip etmek sınırsız kapsam demek, bunu free limit'le nasıl
etkileşeceğini tanımlamaya çalışmak yerine (belirsiz bir ürün kararı,
bkz. `/admin`'in "Rebuild Data" notundaki "too undefined to build
blind" ilkesi) doğrudan Premium'un "unlimited watchlist" konumlandırmasına
oturtuldu — yeni bir upsell yüzeyi.

**Migration:** additive, elle yazıldı (`prisma/migrations/
20260818150000_add_game_watchlist/migration.sql` — tek `CREATE TABLE`
+ 2 index + 2 FK, DROP/DELETE yok). Deploy öncesi/sonrası satır
sayıları doğrulandı (users 4, games 11, events 87, watchlists 31,
notifications 12 — hepsi değişmedi, yeni tablo 0 satırla başladı).

**Bildirim entegrasyonu:** `notification-trigger.service.ts` artık
`getWatchlistsByEvent` yerine yeni `getRecipientsForEvent(eventId,
gameId)` kullanıyor — event-seviyeli `Watchlist` + event'in oyununu
takip eden `GameWatchlist` kullanıcılarını `userId`'ye göre dedupe
ederek birleştiriyor (aynı kullanıcı hem event'i hem oyunu takip
ediyorsa çift bildirim gitmiyor).

**UI:** `/games/[slug]`'a `FollowGameButton` (client) eklendi —
oturum yoksa `/signin`'e yönlendiriyor, Free kullanıcı denerse 402
alıp "Premium gerekiyor" + `/pricing` linkini gösteriyor, Premium
kullanıcı gerçek toggle yapabiliyor. Dashboard'da `WatchingList`'e
"Following (whole game)" şeridi eklendi — takip edilen oyunlar
gerçek `GameIcon` rozetleriyle listeleniyor, tıklayınca unfollow
oluyor (yazılıp hiçbir sayfaya bağlanmayan özellik kalmasın diye —
bu projede tekrarlayan bir hata sınıfı, bkz. Technical Debt'teki
"written but not connected" temizlikleri).

## Bilinçli olarak yapılmayan

- **Queue/Champion bazlı takip** — backlog maddesi "Game/Queue/
  Champion" diyordu ama queue/champion granülerliğinde gerçek,
  event'ten bağımsız bir "takip edilebilir birim" kavramı yok (queue
  bilgisi zaten `lol-client-config` provider'ının event'leri
  içinde geliyor, ayrı bir entity değil) — sadece Game seviyesi
  yapıldı, net ve gerçek bir kapsamı olan tek granülerlik.
- Dashboard dışında (`/games` liste sayfası gibi) "hangi oyunları
  takip ediyorum" göstergesi eklenmedi — v1 kapsamı dashboard +
  `/games/[slug]`'daki buton durumuyla sınırlı tutuldu.
- Yeni bir analytics event'i eklenmedi (`ANALYTICS_EVENTS`) — mevcut
  funnel soruları (ADR-046) bunu kapsamıyor, spekülatif olurdu.

## Doğrulama

- `npx tsc --noEmit`, `npm test` (150/150), `npm run build` — hepsi
  temiz.
- Migration gerçek DB'ye `prisma migrate deploy` ile uygulandı,
  satır sayıları önce/sonra doğrulandı.
- Repository katmanı gerçek DB'ye karşı test edildi: gerçek bir
  `userId`/`gameId` ile `GameWatchlist` satırı oluşturuldu, varlığı
  doğrulandı, silindi, satır sayısının 0'a döndüğü teyit edildi (test
  artığı bırakılmadı — ADR-039/040'takiyle aynı desen).

---

# ADR-052: Yeni Kaynak Taraması — Steam Sales, FFXIV, Warframe'de 2 Yeni Event, Mevcut Oyun Denetimi

Status: Accepted

Date: 2026-08-18

## Bağlam

Deniz "takip edilen oyun sayısını 100+ yapmak lazım, anahtar
gerektirmeyen her oyunu ekle, mevcut oyunlarda da eksik event'leri
araştır" dedi. Sistemli bir tarama yapıldı: mobil oyunlar (Marvel
Snap, Brawl Stars, Clash Royale/Clash of Clans), Deep Rock Galactic,
Guild Wars 2 (üçüncü kez), Rocket League, Wargaming (WoT/WoWS), osu!,
FFXIV, Steam'in kendi mağaza API'si.

## Karar

**Gerçekçi tavan:** 100+ hedefi gerçek, uydurulmamış verilerle
ulaşılabilir değil — sektörün büyük çoğunluğunda (özellikle mobil)
public event API'si yok. Bu oturumda **2 gerçek, doğrulanmış ekleme**
bulundu; gerisi reddedildi (aşağıda).

**1) `steam-sales` provider (yeni provider, yeni oyun değil)** —
Valve'ın kendi mağaza API'si (`store.steampowered.com/api/appdetails`,
anahtarsız, resmi) üzerinden mevcut ücretli Steam oyunlarına
(Helldivers 2, Foxhole) gerçek `discount_percent` sinyaliyle "Steam
Sale" event'i ekliyor. F2P oyunlar (Warframe/PoE/PUBG/PlanetSide 2)
`price_overview` döndürmüyor, o yüzden listede yok — uydurma
placeholder yerine hiç event üretilmiyor. Kampanya adı yok (ayrı,
global `featuredcategories` endpoint'i hangi app'in kampanyada
olduğunu söylemiyor), açıklama bunu dürüstçe sadece
indirim-yüzdesi/fiyat olarak veriyor.

**2) Final Fantasy XIV (12. oyun, `ffxiv`)** — Square Enix'in
launcher'ın giriş öncesi sorguladığı resmi, anahtarsız endpoint'i
(`frontier.ffxiv.com/worldStatus/gate_status.json`). Tek gerçek
sinyal: giriş kapısı açık/kapalı (`status: 1`/diğer) — Riot/Valorant'ın
platform status'uyla aynı sınıf, aynı düşük-ama-gerçek önceliğe sahip.
İkon: resmi bir FFXIV SVG marka işareti yok, ama `react-icons/si`'de
Square Enix'in kendi marka işareti (`SiSquareenix`) var — emoji yerine
onu kullandık (ADR-020'nin kuralıyla tutarlı).

**3) Mevcut 12 oyunun denetimi ("eksik event var mı")** — her
provider'ın kendi gerçek veri kaynağı tek tek gözden geçirildi:
- **Destiny 2** — zaten kapsamlı: `mapActiveMilestones` Bungie'nin
  Public Milestones API'sindeki *her* aktif milestone'u genel/dinamik
  olarak map'liyor (tek tek hardcode edilmiş bir liste değil), yani
  Nightfall/haftalık bounty gibi yeni bir şey çıksa otomatik yakalanır.
  Eklenecek bir şey yok.
- **Warframe** — `api.warframestat.us`'un tam JSON cevabı incelendi,
  şu ana kadar okunmayan 2 gerçek, uygun sıklıkta alan bulundu:
  `vaultTrader` (Prime Resurgence — Varzia'nın Maroo's Bazaar'daki
  rotasyonlu vault mağazası, ~aylık pencere) ve `steelPath` (Steel
  Path Circuit'in haftalık ödül rotasyonu). İkisi de eklendi, gerçek
  DB'ye karşı doğrulandı (7 event senkronize oldu, ikisi gerçekten
  LIVE). `duviriCycle` (her ~2 saatte bir değişiyor) bilinçli olarak
  eklenmedi — projenin "alerts/invasions çok sık, düşük sinyal"
  kuralıyla aynı sınıf. `calendar` (Warframe 1999 içerik takvimi)
  karmaşık/dar kapsamlı, bu turda atlandı.
- **LoL** — `docs/09_BACKLOG.md`'de hâlâ açık görünen iki not
  ("cherry-lobby.json henüz kullanılmıyor", "event-passes.json
  entegrasyonu") aslında **geçersiz, silinmemiş eski notlar**:
  Arena zaten `lol-client-config`'te gerçek canlı sinyalle (ADR-037),
  pass pencereleri zaten `SEASON_PASS` kategorisiyle (ADR-023/026)
  takip ediliyor. Backlog düzeltildi.
- **TFT, Valorant, Fortnite, PoE, Helldivers 2, Foxhole, PUBG,
  PlanetSide 2** — bu turda derin bir yeni alan bulunamadı (ör. PUBG'nin
  resmi API'si item-shop/survivor-pass verisi sunmuyor, sadece
  stats/season). Gelecekte tekrar bakılabilir.

**Reddedilenler:**
- **Deep Rock Galactic** — resmi API yok, bulunanlar (drgmissions,
  drg-deep-dive-tracker) üçüncü parti scraper'lar, Genshin'in fan-API'siyle
  aynı güven sınıfı sorunu.
- **Guild Wars 2** — `/v2/events` üçüncü kez test edildi, hâlâ `503
  API not active`. ADR-013'ün bulgusu bir yıl sonra da geçerli.
- **Brawl Stars / Clash Royale / Clash of Clans (Supercell)** —
  resmi API IP kilidi (2026-08-13'te zaten reddedilmişti), community
  "BrawlAPI" statik/üçüncü parti.
- **Rocket League** — genel, anahtarsız bir public API yok.
- **Marvel Snap ve genel mobil oyunlar** — hiçbirinde resmi public
  event API'si bulunamadı.
- **Wargaming (WoT/WoWS) ve osu!** — self-serve key var ama gerçek
  bir "event/sezon" endpoint'i doğrulanamadı, derin araştırma
  gerektirir; bu turda yapılmadı (düşük sinyal/efor oranı).

## Doğrulama

- Her iki yeni kaynak da gerçek DB'ye karşı uçtan uca test edildi:
  `steamSalesService.getEvents()` + `eventSyncService.sync(...,
  "steam-sales")` gerçek 2 satır yazdı (Helldivers 2, Foxhole — ikisi
  de şu an indirimde değil, doğru şekilde ENDED). `ffxivService
  .getEvents()` aynı şekilde 1 satır yazdı (gate açık, LIVE).
  `Game.create({ id: "ffxiv", ... })` ile tek satırlık additive insert
  — şema değişikliği yok, migration gerekmedi.
- `npx tsc --noEmit`, `npm test` (156/156), `npm run build` — hepsi
  temiz.
