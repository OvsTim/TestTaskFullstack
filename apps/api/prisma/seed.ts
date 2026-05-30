import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEFAULT_UNITS = ['м³', 'м²', 'м', 'кг', 'шт'];

async function main() {
  for (const name of DEFAULT_UNITS) {
    await prisma.measurementUnit.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
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
