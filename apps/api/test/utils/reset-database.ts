import { PrismaService } from '../../src/prisma/prisma.service';

export async function resetDatabase(prisma: PrismaService): Promise<void> {
  await prisma.workEntry.deleteMany();
  await prisma.workType.deleteMany();
  await prisma.measurementUnit.deleteMany();
}
