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
