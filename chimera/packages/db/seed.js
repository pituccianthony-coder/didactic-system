const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Seed Awakening Items
  const items = [
    {
      url: 'https://www.nature.com/articles/d41586-023-03276-8',
      lang: 'en',
      topic: 'consciousness',
      title: 'The hard problem of consciousness is a distraction',
      publishedAt: new Date('2023-10-18T00:00:00Z'),
    },
    {
      url: 'https://www.scientificamerican.com/article/do-we-live-in-a-simulation-chances-are-about-50-50/',
      lang: 'en',
      topic: 'simulation',
      title: 'Do We Live in a Simulation? Chances Are About 50-50',
      publishedAt: new Date('2021-04-01T00:00:00Z'),
    },
  ];

  for (const item of items) {
    await prisma.awakeningItem.upsert({
        where: { url: item.url },
        update: {},
        create: item,
    });
  }

  // Ensure mock user exists for journal entries
  const MOCK_USER_ID = 'user_2a1b3c4d5e6f7g8h9i0j';
  const user = await prisma.user.findUnique({ where: { id: MOCK_USER_ID } });
  if (!user) {
      await prisma.user.create({
          data: {
              id: MOCK_USER_ID,
              email: `mockuser@chimera.project`,
              name: 'Mock User',
          },
      });
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
