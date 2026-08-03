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
    ],
  });

  await prisma.event.createMany({
    data: [
      {
        id: "urf",
        gameId: "lol",
        title: "URF",
        status: "LIVE",
        trackedUsers: 15420,
        lastChecked: new Date().toISOString(),
      },
      {
        id: "arena",
        gameId: "lol",
        title: "Arena",
        status: "UPCOMING",
        trackedUsers: 8700,
        lastChecked: new Date().toISOString(),
      },
      {
        id: "night-market",
        gameId: "valorant",
        title: "Night Market",
        status: "UPCOMING",
        trackedUsers: 21000,
        lastChecked: new Date().toISOString(),
      },
      {
        id: "fortnite-og",
        gameId: "fortnite",
        title: "Fortnite OG",
        status: "ENDED",
        trackedUsers: 32000,
        lastChecked: new Date().toISOString(),
      },
    ],
  });

  await prisma.watchlist.createMany({
    data: [
      {
        userId: "demo",
        eventId: "urf",
      },
      {
        userId: "demo",
        eventId: "night-market",
      },
    ],
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: "demo",
        eventId: "urf",
        title: "URF is Live",
        message: "League of Legends URF is now available.",
        channel: "email",
        read: false,
      },
      {
        userId: "demo",
        eventId: "night-market",
        title: "Night Market is Back",
        message: "Valorant Night Market has returned.",
        channel: "email",
        read: true,
      },
    ],
  });

  console.log("Database seeded.");
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