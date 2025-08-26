const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  console.log('Start seeding...');
  const items = [ { url: 'https://www.nature.com/articles/d41586-023-03276-8', lang: 'en', topic: 'consciousness', title: 'The hard problem of consciousness is a distraction' } ];
  for (const item of items) { await prisma.awakeningItem.upsert({ where: { url: item.url }, update: {}, create: item }); }
  console.log('Seeding finished.');
}
main().catch(e => { console.error(e); process.exit(1); }).finally(async () => await prisma.());
