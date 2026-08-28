import type { Locale } from "./config";

export type EventDescriptionParams = Record<
  string,
  string | number | undefined
>;

type Renderer = (params: EventDescriptionParams, locale: Locale) => string;

function t(locale: Locale, en: string, tr: string): string {
  return locale === "tr" ? tr : en;
}

function p(value: string | number | undefined, fallback = ""): string {
  return value === undefined ? fallback : String(value);
}

// Every key here is a provider description that's entirely
// ModeAlert-authored (no raw third-party text mixed in) — the
// providers that DO mix in real third-party text (a Bungie milestone
// blurb, a Helldivers briefing, a PoE league blurb when the API
// supplies one) skip this registry entirely and keep writing straight
// to Event.description, which stays English forever by necessity. See
// docs/06_DECISIONS.md ADR-054 "Faz 3" for the full reasoning.
const RENDERERS: Record<string, Renderer> = {
  "destiny.platformOperational": (_params, locale) =>
    t(
      locale,
      "Destiny 2 servers are operating normally, no maintenance scheduled.",
      "Destiny 2 sunucuları normal çalışıyor, planlanmış bakım yok."
    ),
  "destiny.platformMaintenance": (_params, locale) =>
    t(
      locale,
      "Destiny 2 has an active maintenance window — the game may be unreachable.",
      "Destiny 2'de aktif bir bakım penceresi var — oyuna erişilemeyebilir."
    ),

  "destiny.ironBannerUpcoming": (params, locale) => {
    const date = new Date(p(params.windowStart)).toLocaleDateString(
      locale,
      { dateStyle: "long" }
    );

    return t(
      locale,
      `Bungie's announced schedule (every 4 weeks starting June 30, 2026) puts the next Iron Banner window starting ${date}.`,
      `Bungie'nin duyurduğu takvime göre (30 Haziran 2026'dan itibaren her 4 haftada bir) sıradaki Iron Banner penceresi ${date} tarihinde başlıyor.`
    );
  },
  "destiny.ironBannerLive": (params, locale) => {
    const date = new Date(p(params.windowEnd)).toLocaleDateString(locale, {
      dateStyle: "long",
    });

    return t(
      locale,
      `Live per Bungie's announced schedule (every 4 weeks starting June 30, 2026) — this window runs through ${date}.`,
      `Bungie'nin duyurduğu takvime göre (30 Haziran 2026'dan itibaren her 4 haftada bir) canlı — bu pencere ${date} tarihine kadar sürüyor.`
    );
  },
  "destiny.ironBannerEnded": (params, locale) => {
    const windowEnd = new Date(p(params.windowEnd)).toLocaleDateString(
      locale,
      { dateStyle: "long" }
    );
    const nextStart = new Date(p(params.nextStart)).toLocaleDateString(
      locale,
      { dateStyle: "long" }
    );

    return t(
      locale,
      `This window ended ${windowEnd}. Next expected ${nextStart}, per Bungie's announced every-4-weeks schedule.`,
      `Bu pencere ${windowEnd} tarihinde sona erdi. Bungie'nin duyurduğu 4 haftada bir takvime göre sıradaki ${nextStart} tarihinde bekleniyor.`
    );
  },

  "destiny.xurPresent": (params, locale) => {
    const date = new Date(p(params.departureEnd)).toLocaleString(locale, {
      dateStyle: "long",
      timeStyle: "short",
    });

    return t(
      locale,
      `Xûr is at his usual spot (the Tower Bazaar) until ${date} — computed from his weekly Friday 17:00 UTC to Tuesday 17:00 UTC schedule, not a live inventory API (Bungie doesn't expose vendor stock without per-character auth).`,
      `Xûr, ${date} tarihine kadar her zamanki yerinde (Tower Bazaar) — canlı bir envanter API'sinden değil, haftalık Cuma 17:00 UTC - Salı 17:00 UTC takviminden hesaplanıyor (Bungie karakter bazlı yetkilendirme olmadan satıcı stoğunu göstermiyor).`
    );
  },
  "destiny.xurAbsent": (params, locale) => {
    const date = new Date(p(params.nextArrival)).toLocaleString(locale, {
      dateStyle: "long",
      timeStyle: "short",
    });

    return t(
      locale,
      `Xûr has left for the week. Back ${date}, per his weekly Friday 17:00 UTC schedule.`,
      `Xûr bu hafta için gitti. Haftalık Cuma 17:00 UTC takvimine göre ${date} tarihinde geri dönüyor.`
    );
  },

  "ffxiv.platformOperational": (_params, locale) =>
    t(
      locale,
      "The login gate is open — servers are operating normally.",
      "Giriş kapısı açık — sunucular normal çalışıyor."
    ),
  "ffxiv.platformMaintenance": (_params, locale) =>
    t(
      locale,
      "The login gate is closed — maintenance is likely in progress.",
      "Giriş kapısı kapalı — muhtemelen bakım sürüyor."
    ),

  "riot.platformOperational": (params, locale) =>
    t(
      locale,
      `${p(params.region)} ${p(params.unit)} is operating normally, no maintenance scheduled.`,
      `${p(params.region)} ${p(params.unit)} normal çalışıyor, planlanmış bakım yok.`
    ),
  "riot.platformMaintenance": (params, locale) =>
    t(
      locale,
      `Riot has an active maintenance window on the ${p(params.region)} ${p(params.unit)}.`,
      `Riot'un ${p(params.region)} ${p(params.unit)} üzerinde aktif bir bakım penceresi var.`
    ),

  "foxhole.warUpcoming": (params, locale) =>
    t(
      locale,
      `War #${p(params.warNumber)} is scheduled to begin soon.`,
      `#${p(params.warNumber)} numaralı savaş yakında başlayacak.`
    ),
  "foxhole.warLive": (params, locale) =>
    t(
      locale,
      `Ongoing Colonial vs. Warden conquest — ${p(params.requiredVictoryTowns)} town captures needed for victory.`,
      `Devam eden Colonial vs. Warden fetih savaşı — zafer için ${p(params.requiredVictoryTowns)} kasaba ele geçirilmesi gerekiyor.`
    ),
  "foxhole.warTracking": (params, locale) =>
    t(
      locale,
      `War #${p(params.warNumber)} has entered the resistance phase — the losing side gets one last chance to fight back.`,
      `#${p(params.warNumber)} numaralı savaş direniş aşamasına girdi — kaybeden taraf geri dönmek için son bir şans elde ediyor.`
    ),
  "foxhole.warEnded": (params, locale) => {
    const winner = params.winner as string | undefined;
    const warNumber = p(params.warNumber);

    return t(
      locale,
      `War #${warNumber} has ended${winner ? ` — ${winner} won` : ""}.`,
      `#${warNumber} numaralı savaş sona erdi${winner ? ` — ${winner} kazandı` : ""}.`
    );
  },

  "fortnite.shopOffersOnly": (params, locale) =>
    t(
      locale,
      `${p(params.count)} offers currently in the Item Shop.`,
      `Item Shop'ta şu an ${p(params.count)} teklif var.`
    ),
  "fortnite.shopFeaturedMore": (params, locale) =>
    t(
      locale,
      `Featuring: ${p(params.featured)}, and ${p(params.remaining)} more.`,
      `Öne çıkanlar: ${p(params.featured)}, ve ${p(params.remaining)} tane daha.`
    ),
  "fortnite.shopFeatured": (params, locale) =>
    t(
      locale,
      `Featuring: ${p(params.featured)}.`,
      `Öne çıkanlar: ${p(params.featured)}.`
    ),

  "planetside2.alertLive": (params, locale) => {
    const eventName = p(params.eventName);
    const zoneName = p(params.zoneName);
    const estimatedEndIso = params.estimatedEnd as string | undefined;
    const estimatedEnd = estimatedEndIso
      ? new Date(estimatedEndIso).toLocaleString(locale, {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : null;

    return t(
      locale,
      `A server-wide territory-control Alert (${eventName}) is active on ${zoneName}${estimatedEnd ? `, expected to end around ${estimatedEnd}` : ""} — detected from Daybreak's live world_event data.`,
      `Sunucu geneli bir bölge-kontrol Alert'i (${eventName}) ${zoneName}'da aktif${estimatedEnd ? `, tahmini bitiş ${estimatedEnd} civarı` : ""} — Daybreak'in canlı world_event verisinden tespit edildi.`
    );
  },
  "planetside2.alertEnded": (params, locale) => {
    const eventName = p(params.eventName);
    const zoneName = p(params.zoneName);
    const endedAtIso = params.endedAt as string | undefined;
    const endedAt = endedAtIso
      ? new Date(endedAtIso).toLocaleString(locale, {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "";

    return t(
      locale,
      `No territory-control Alert currently active. The last one (${eventName} on ${zoneName}) ended ${endedAt}.`,
      `Şu an aktif bir bölge-kontrol Alert'i yok. Sonuncusu (${zoneName}'daki ${eventName}) ${endedAt} tarihinde sona erdi.`
    );
  },

  "poe.leagueFallback": (params, locale) =>
    t(
      locale,
      `${p(params.leagueId)} — Path of Exile's current temporary challenge league.`,
      `${p(params.leagueId)} — Path of Exile'ın güncel geçici challenge league'i.`
    ),

  "pubg.seasonDescription": (_params, locale) =>
    t(
      locale,
      "The current live PUBG ranked season, detected from PUBG's own live season data (`isCurrentSeason`) — not an announcement-date guess.",
      "PUBG'nin kendi canlı sezon verisinden (`isCurrentSeason`) tespit edilen, güncel canlı PUBG ranked sezonu — bir duyuru-tarihi tahmini değil."
    ),

  "tft.setDescription": (_params, locale) =>
    t(
      locale,
      "The current live Teamfight Tactics set, detected from Riot's own game data (the highest set number present in the live client files) — not an announcement-date guess.",
      "Riot'un kendi oyun verisinden (canlı client dosyalarındaki en yüksek set numarası) tespit edilen, güncel canlı Teamfight Tactics seti — bir duyuru-tarihi tahmini değil."
    ),

  "valorant.actDescription": (params, locale) =>
    t(
      locale,
      `${p(params.actTitle)} is Valorant's current ~2-month competitive season phase — new act rank rewards and battle pass content are live.`,
      `${p(params.actTitle)}, Valorant'ın güncel ~2 aylık rekabetçi sezon evresi — yeni act rank ödülleri ve battle pass içeriği canlı.`
    ),

  "lol.urf": (_params, locale) =>
    t(
      locale,
      "Ultra Rapid Fire — near-zero cooldowns, no mana, random champion.",
      "Ultra Rapid Fire — sıfıra yakın bekleme süreleri, mana yok, rastgele şampiyon."
    ),
  "lol.pickUrf": (_params, locale) =>
    t(
      locale,
      "URF with normal draft-style champion picking instead of a random champion.",
      "Rastgele şampiyon yerine normal draft-usulü şampiyon seçimiyle URF."
    ),
  "lol.arena": (_params, locale) =>
    t(
      locale,
      "2v2v2v2v2v2v2v2 round-based combat with augments.",
      "Augment'lerle 2v2v2v2v2v2v2v2 tur bazlı çarpışma."
    ),
  "lol.braveryArena": (_params, locale) =>
    t(
      locale,
      "Arena's weekly variant — Bravery and Crowd Favorites rules.",
      "Arena'nın haftalık varyantı — Bravery ve Crowd Favorites kuralları."
    ),
  "lol.arena3x6": (_params, locale) =>
    t(
      locale,
      "Arena's 3-player-team variant, six total compositions.",
      "Arena'nın 3 kişilik takım varyantı, toplam altı kompozisyon."
    ),
  "lol.aramMayhem": (_params, locale) =>
    t(
      locale,
      "ARAM with chaotic augments and Set-based progression. Riot confirmed in a March 2026 dev update that it's staying with no end date in mind (verified via WebSearch 2026-08-12, see ADR-029) — that's why it's marked permanent below, independent of the live check.",
      "Kaotik augment'ler ve Set bazlı ilerlemeyle ARAM. Riot, Mart 2026 dev güncellemesinde bunun bitiş tarihi düşünülmeden kalıcı olacağını doğruladı (WebSearch ile 2026-08-12'de doğrulandı, bkz. ADR-029) — bu yüzden aşağıda canlı kontrolden bağımsız olarak kalıcı işaretlendi."
    ),
  "lol.leagueClassic": (_params, locale) =>
    t(
      locale,
      "The old-school alternate client, recreating early-League gameplay inside the current launcher. Launched July 29, 2026 designed as a permanent mode (verified via WebSearch 2026-08-12, see ADR-029) — that's why it's marked permanent below, independent of the live check.",
      "Erken dönem League oynanışını güncel launcher içinde yeniden yaratan, eski usül alternatif client. 29 Temmuz 2026'da kalıcı bir mod olarak tasarlanıp yayınlandı (WebSearch ile 2026-08-12'de doğrulandı, bkz. ADR-029) — bu yüzden aşağıda canlı kontrolden bağımsız olarak kalıcı işaretlendi."
    ),

  "warframe.voidTraderActive": (params, locale) =>
    t(
      locale,
      `${p(params.character)} is selling rare rotating wares at ${p(params.location)} for a limited time.`,
      `${p(params.character)}, ${p(params.location)}'da sınırlı bir süreliğine nadir, rotasyonlu eşyalar satıyor.`
    ),
  "warframe.voidTraderUpcoming": (params, locale) =>
    t(
      locale,
      `${p(params.character)} is scheduled to arrive at ${p(params.location)} for a 48-hour visit.`,
      `${p(params.character)}, 48 saatlik bir ziyaret için ${p(params.location)}'a gelecek.`
    ),

  "warframe.nightwaveActive": (params, locale) =>
    t(
      locale,
      `Season ${p(params.season)} of Nightwave is active — complete weekly/daily acts for Wolf Creds and rewards.`,
      `Nightwave'in Season ${p(params.season)}'i aktif — Wolf Creds ve ödüller için haftalık/günlük görevleri tamamla.`
    ),
  "warframe.nightwaveIntermission": (params, locale) =>
    t(
      locale,
      `Nightwave Season ${p(params.season)} is between seasons (intermission) — no active acts right now.`,
      `Nightwave Season ${p(params.season)} sezonlar arasında (ara dönem) — şu an aktif görev yok.`
    ),

  "warframe.sortie": (params, locale) =>
    t(
      locale,
      `Today's 3-mission Sortie chain ends with a boss fight against ${p(params.boss)}. Resets daily.`,
      `Bugünün 3 görevlik Sortie zinciri, ${p(params.boss)} ile bir boss savaşıyla sona eriyor. Günlük olarak sıfırlanır.`
    ),
  "warframe.archonHunt": (params, locale) =>
    t(
      locale,
      `This week's 3-mission Archon Hunt chain (no life support, no revives) ends with a fight against ${p(params.boss)}. Resets weekly.`,
      `Bu haftanın 3 görevlik Archon Hunt zinciri (yaşam desteği yok, canlanma yok), ${p(params.boss)} ile bir savaşla sona eriyor. Haftalık olarak sıfırlanır.`
    ),

  "warframe.archimedeaActive": (params, locale) => {
    const missionSequence = params.missionSequence as string | undefined;

    return t(
      locale,
      `This week's 3-mission Archimedea chain${missionSequence ? `: ${missionSequence}` : ""} — no loadout switching between missions, unlocked with Search Pulses. Resets weekly.`,
      `Bu haftanın 3 görevlik Archimedea zinciri${missionSequence ? `: ${missionSequence}` : ""} — görevler arasında loadout değişimi yok, Search Pulse ile açılıyor. Haftalık olarak sıfırlanır.`
    );
  },
  "warframe.archimedeaInactive": (_params, locale) =>
    t(locale, "Between weekly Archimedea windows.", "Haftalık Archimedea pencereleri arasında."),

  "warframe.vaultTraderActive": (params, locale) =>
    t(
      locale,
      `${p(params.character)} is selling a rotating selection of vaulted Prime gear at ${p(params.location)} for Ducats/Aya.`,
      `${p(params.character)}, ${p(params.location)}'da Ducat/Aya karşılığında rotasyonlu bir vaulted Prime ekipman seçkisi satıyor.`
    ),
  "warframe.vaultTraderInactive": (params, locale) =>
    t(
      locale,
      `Prime Resurgence is between rotations at ${p(params.location)}.`,
      `Prime Resurgence, ${p(params.location)}'da rotasyonlar arasında.`
    ),

  "warframe.steelPathActive": (params, locale) => {
    const rewardName = params.rewardName as string | undefined;

    return t(
      locale,
      `This week's Steel Path Circuit honor reward${rewardName ? `: ${rewardName}` : ""}. Resets weekly.`,
      `Bu haftanın Steel Path Circuit onur ödülü${rewardName ? `: ${rewardName}` : ""}. Haftalık olarak sıfırlanır.`
    );
  },
  "warframe.steelPathInactive": (_params, locale) =>
    t(
      locale,
      "Between weekly Steel Path Circuit reward rotations.",
      "Haftalık Steel Path Circuit ödül rotasyonları arasında."
    ),

  "eaFc.sbcActive": (params, locale) => {
    const count = params.count as number;
    const nearestEndDate = p(params.nearestEndDate);

    return t(
      locale,
      `${count} real, time-boxed Squad Building Challenge${count === 1 ? "" : "s"} live right now on FUT.GG — the next one expires ${nearestEndDate}.`,
      `FUT.GG'de şu an ${count} gerçek, süreli Squad Building Challenge canlı — sıradaki ${nearestEndDate} tarihinde süresi doluyor.`
    );
  },
  "eaFc.sbcInactive": (_params, locale) =>
    t(
      locale,
      "No time-boxed Squad Building Challenges currently active.",
      "Şu an aktif, süreli bir Squad Building Challenge yok."
    ),

  "riot.championRotation": (params, locale) =>
    t(
      locale,
      `${p(params.freeCount)} champions are free to play this week, plus ${p(params.newPlayerCount)} additional champions for accounts under level 11.`,
      `Bu hafta ${p(params.freeCount)} şampiyon ücretsiz oynanabilir, ayrıca 11. seviyenin altındaki hesaplar için ${p(params.newPlayerCount)} ek şampiyon.`
    ),

  "steamSales.discounted": (params, locale) =>
    t(
      locale,
      `${p(params.discountPercent)}% off on Steam right now (${p(params.price)} ${p(params.currency)}).`,
      `Steam'de şu an %${p(params.discountPercent)} indirim (${p(params.price)} ${p(params.currency)}).`
    ),
  "steamSales.fullPrice": (params, locale) =>
    t(
      locale,
      `Not currently discounted on Steam (${p(params.price)} ${p(params.currency)}).`,
      `Steam'de şu an indirimde değil (${p(params.price)} ${p(params.currency)}).`
    ),

  "rotatingModes.lolNormal": (_params, locale) =>
    t(
      locale,
      "Summoner's Rift, 5v5, draft pick against the enemy team. One of League's core queues — permanently available, not something that starts or ends.",
      "Summoner's Rift, 5v5, rakip takıma karşı draft pick. League'in çekirdek kuyruklarından biri — kalıcı olarak mevcut, başlayıp biten bir şey değil."
    ),
  "rotatingModes.lolRankedSolo": (_params, locale) =>
    t(
      locale,
      "Summoner's Rift, 5v5, the main ranked ladder (solo or duo queue). Permanently available core queue.",
      "Summoner's Rift, 5v5, ana rekabetçi merdiven (solo ya da duo kuyruk). Kalıcı olarak mevcut çekirdek kuyruk."
    ),
  "rotatingModes.lolRankedFlex": (_params, locale) =>
    t(
      locale,
      "Summoner's Rift, 5v5, ranked for premade groups of 2-5. Permanently available core queue.",
      "Summoner's Rift, 5v5, 2-5 kişilik önceden kurulmuş gruplar için rekabetçi. Kalıcı olarak mevcut çekirdek kuyruk."
    ),
  "rotatingModes.lolSwiftplay": (_params, locale) =>
    t(
      locale,
      "Summoner's Rift, a faster-paced normal queue with a shortened draft. Permanently available core queue.",
      "Summoner's Rift, kısaltılmış draft'lı daha hızlı tempolu bir normal kuyruk. Kalıcı olarak mevcut çekirdek kuyruk."
    ),
  "rotatingModes.lolAram": (_params, locale) =>
    t(
      locale,
      "Howling Abyss — random champions, one lane, no recalls to base shop between waves. Permanent, always-queueable core mode.",
      "Howling Abyss — rastgele şampiyonlar, tek koridor, dalgalar arasında üsse dönüş yok. Kalıcı, her zaman kuyruğa girilebilen çekirdek mod."
    ),
  "rotatingModes.valorantCompetitive": (_params, locale) =>
    t(
      locale,
      "5v5 ranked ladder, best-of-25 (first to 13), Iron through Radiant. One of Valorant's original permanent modes since launch.",
      "5v5 rekabetçi merdiven, 25'in en iyisi (13'e ilk ulaşan), Iron'dan Radiant'a. Valorant'ın çıkıştan beri var olan orijinal kalıcı modlarından biri."
    ),
  "rotatingModes.valorantUnrated": (_params, locale) =>
    t(
      locale,
      "Same rules as Competitive, no rank on the line. Permanent core mode since launch.",
      "Competitive ile aynı kurallar, rank riski yok. Çıkıştan beri var olan kalıcı çekirdek mod."
    ),
  "rotatingModes.fortniteBattleRoyale": (_params, locale) =>
    t(
      locale,
      "Fortnite's original permanent mode — 100 players, last one standing. Building enabled.",
      "Fortnite'ın orijinal kalıcı modu — 100 oyuncu, ayakta kalan son kişi. İnşa etme açık."
    ),
  "rotatingModes.fortniteZeroBuild": (_params, locale) =>
    t(
      locale,
      "Battle Royale with building disabled. Permanent playlist since its 2022 launch, still actively updated (confirmed via WebSearch 2026-08-12).",
      "İnşa etmenin kapalı olduğu Battle Royale. 2022'deki çıkışından beri kalıcı bir playlist, hâlâ aktif olarak güncelleniyor (2026-08-12'de WebSearch ile doğrulandı)."
    ),
  "rotatingModes.tftNormal": (_params, locale) =>
    t(
      locale,
      "Standard Teamfight Tactics queue, no rank on the line. Permanent core queue.",
      "Standart Teamfight Tactics kuyruğu, rank riski yok. Kalıcı çekirdek kuyruk."
    ),
  "rotatingModes.tftRanked": (_params, locale) =>
    t(locale, "TFT's ranked ladder. Permanent core queue.", "TFT'nin rekabetçi merdiveni. Kalıcı çekirdek kuyruk."),
  "rotatingModes.tftHyperRoll": (_params, locale) =>
    t(
      locale,
      "Faster-paced TFT — more gold, faster rerolls, single-elimination-style. Permanent core queue.",
      "Daha hızlı tempolu TFT — daha fazla altın, daha hızlı reroll, tek-eleme tarzı. Kalıcı çekirdek kuyruk."
    ),

  "communitydragon.seasonPass": (_params, locale) =>
    t(
      locale,
      "Season pass — earn track rewards through featured missions.",
      "Sezon pass'i — öne çıkan görevlerle track ödülleri kazan."
    ),
  "communitydragon.milestone": (_params, locale) =>
    t(
      locale,
      "Limited-time milestone event with special rewards.",
      "Özel ödüllü, sınırlı süreli kilometre taşı etkinliği."
    ),
  "communitydragon.hallOfLegends": (_params, locale) =>
    t(
      locale,
      "Hall of Legends celebration event.",
      "Hall of Legends kutlama etkinliği."
    ),
  "communitydragon.demaciaPass": (_params, locale) =>
    t(
      locale,
      "Classic-mode battle pass — earn track rewards.",
      "Classic mod battle pass'i — track ödülleri kazan."
    ),
  "communitydragon.genericEvent": (_params, locale) =>
    t(locale, "League of Legends event.", "League of Legends etkinliği."),

  // Composite: {baseKey}'s own rendered text, plus optional suffixes —
  // used by CommunityDragon, which only sets this when Riot's
  // event-hub entry has no localizedEventSubtitle (real third-party
  // text can't be translated, same reasoning as everywhere else in
  // this file).
  "communitydragon.description": (params, locale) => {
    const baseKey = params.baseKey as string;
    let text = RENDERERS[baseKey]?.({}, locale) ?? "";

    if (params.hasUnconfirmedSuffix) {
      text = t(
        locale,
        `${text} This is the battle-pass window only — whether the mode itself is in rotation today isn't something Riot exposes a reliable signal for yet.`,
        `${text} Bu sadece battle-pass penceresi — modun kendisinin bugün rotasyonda olup olmadığı için Riot henüz güvenilir bir sinyal sunmuyor.`
      );
    }

    const progressEndDate = params.progressEndDate as string | undefined;

    if (progressEndDate) {
      const date = new Date(progressEndDate).toLocaleDateString(locale, {
        dateStyle: "long",
      });

      text = t(
        locale,
        `${text} Pass progress has closed — the shop stays open until ${date} for remaining purchases, but no more track progress can be earned.`,
        `${text} Pass ilerlemesi kapandı — mağaza kalan satın almalar için ${date} tarihine kadar açık kalıyor, ama artık track ilerlemesi kazanılamıyor.`
      );
    }

    return text;
  },

  "communitydragon.mayhemClassicCompanion": (_params, locale) =>
    t(
      locale,
      "A Classic-mode-themed ARAM Mayhem crossover variant. Riot doesn't publish a dedicated schedule for it, so ModeAlert ties its status to League Classic's real, dated pass window — the closest real signal available, not a confirmed direct source for this specific variant.",
      "Classic mod temalı bir ARAM Mayhem crossover varyantı. Riot bunun için özel bir takvim yayınlamıyor, bu yüzden ModeAlert durumunu League Classic'in gerçek, tarihli pass penceresine bağlıyor — mevcut en yakın gerçek sinyal, ama bu varyant için doğrulanmış doğrudan bir kaynak değil."
    ),

  // Composite: {baseKey}'s own rendered text, plus a live-region
  // status suffix — used by lol-client-config, which appends the same
  // suffix to any of the 7 static queue descriptions above depending
  // on where clientconfig.rpg.riotgames.com currently reports the
  // queue enabled.
  "lol.queueStatus": (params, locale) => {
    const baseKey = params.baseKey as string;
    const base = RENDERERS[baseKey]?.({}, locale) ?? "";
    const regionCount = params.liveRegionCount as number | undefined;
    const regions = p(params.regions);

    if (regionCount === undefined) {
      return t(
        locale,
        `${base} Not currently enabled in any checked region, per Riot's own live client config service (clientconfig.rpg.riotgames.com) — checked fresh on every sync, so this updates on its own the moment it changes.`,
        `${base} Riot'un kendi canlı client config servisine (clientconfig.rpg.riotgames.com) göre kontrol edilen hiçbir bölgede şu an etkin değil — her senkronizasyonda yeniden kontrol edilir, yani değiştiği an kendiliğinden güncellenir.`
      );
    }

    return t(
      locale,
      `${base} Currently enabled in ${regionCount} region${regionCount === 1 ? "" : "s"} (${regions}), per Riot's own live client config service (clientconfig.rpg.riotgames.com) — a real, keyless, per-region signal checked fresh on every sync, not a one-time snapshot.`,
      `${base} Riot'un kendi canlı client config servisine (clientconfig.rpg.riotgames.com) göre ${regionCount} bölgede (${regions}) şu an etkin — her senkronizasyonda tazelenen, key gerektirmeyen, bölge bazlı gerçek bir sinyal, tek seferlik bir anlık görüntü değil.`
    );
  },
};

// Providers call this with locale "en" to build the guaranteed
// English Event.description fallback, so that field can never drift
// out of sync with what the translated version would say. The
// display layer calls it again with the viewer's actual locale.
export function renderEventDescription(
  key: string,
  params: EventDescriptionParams | null | undefined,
  locale: Locale
): string | null {
  const renderer = RENDERERS[key];

  return renderer ? renderer(params ?? {}, locale) : null;
}

// The display-layer half of the pair above: given an Event row, get
// the text a viewer should actually see. Prefers the translated
// render when descriptionKey is set (an entirely ModeAlert-authored
// description); falls back to the raw, always-English `description`
// column for events that mix in real third-party text (a Bungie
// milestone blurb, a Helldivers briefing, ...) or predate this
// registry.
export function resolveEventDescription(
  event: {
    description: string | null;
    descriptionKey?: string | null;
    descriptionParams?: unknown;
  },
  locale: Locale
): string | null {
  if (event.descriptionKey) {
    const rendered = renderEventDescription(
      event.descriptionKey,
      (event.descriptionParams as EventDescriptionParams | null) ?? {},
      locale
    );

    if (rendered !== null) {
      return rendered;
    }
  }

  return event.description;
}
