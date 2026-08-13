import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  await prisma.notification.deleteMany();
  await prisma.watchlist.deleteMany();
  await prisma.event.deleteMany();
  await prisma.game.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.create({
    data: {
      id: "demo",
      email: "demo@modenotify.app",
      name: "Demo User",
    },
  });

  await prisma.game.createMany({
    data: [
      {
        id: "lol",
        name: "League of Legends",
        slug: "league-of-legends",
        logo: "🛡️",
        color: "#2563eb",
        shortName: "LoL",
        supportedEvents: 8,
        activeUsers: "120K",
        featured: true,
      },
      {
        id: "valorant",
        name: "Valorant",
        slug: "valorant",
        logo: "🎯",
        color: "#ef4444",
        shortName: "VAL",
        supportedEvents: 5,
        activeUsers: "95K",
        featured: true,
      },
      {
        id: "fortnite",
        name: "Fortnite",
        slug: "fortnite",
        logo: "🏝️",
        color: "#22c55e",
        shortName: "FN",
        supportedEvents: 6,
        activeUsers: "150K",
        featured: true,
      },
      {
        id: "destiny",
        name: "Destiny 2",
        slug: "destiny-2",
        logo: "🚀",
        color: "#f59e0b",
        shortName: "D2",
        supportedEvents: 2,
        activeUsers: "40K",
        featured: false,
      },
      {
        id: "tft",
        name: "Teamfight Tactics",
        slug: "teamfight-tactics",
        logo: "🎲",
        color: "#a855f7",
        shortName: "TFT",
        supportedEvents: 1,
        activeUsers: "60K",
        featured: false,
      },
      {
        id: "warframe",
        name: "Warframe",
        slug: "warframe",
        logo: "🌌",
        color: "#38bdf8",
        shortName: "WF",
        supportedEvents: 4,
        activeUsers: "30K",
        featured: false,
      },
      {
        id: "poe",
        name: "Path of Exile",
        slug: "path-of-exile",
        logo: "🔥",
        color: "#b45309",
        shortName: "PoE",
        supportedEvents: 1,
        activeUsers: "25K",
        featured: false,
      },
      {
        id: "helldivers2",
        name: "Helldivers 2",
        slug: "helldivers-2",
        logo: "🪖",
        color: "#eab308",
        shortName: "HD2",
        supportedEvents: 1,
        activeUsers: "40K",
        featured: false,
      },
      {
        id: "foxhole",
        name: "Foxhole",
        slug: "foxhole",
        logo: "⚔️",
        color: "#78716c",
        shortName: "FH",
        supportedEvents: 1,
        activeUsers: "15K",
        featured: false,
      },
      {
        id: "pubg",
        name: "PUBG: BATTLEGROUNDS",
        slug: "pubg-battlegrounds",
        logo: "🪂",
        color: "#F1AA03",
        shortName: "PUBG",
        supportedEvents: 0,
        activeUsers: "0",
        featured: false,
      },
    ],
  });

  console.log(
    "Database seeded. Events are populated by real providers " +
    "(run /api/cron/sync), not seed data."
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });