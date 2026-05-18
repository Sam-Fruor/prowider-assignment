import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const services = await Promise.all([
    prisma.service.upsert({ where: { name: 'Service 1' }, update: {}, create: { name: 'Service 1' } }),
    prisma.service.upsert({ where: { name: 'Service 2' }, update: {}, create: { name: 'Service 2' } }),
    prisma.service.upsert({ where: { name: 'Service 3' }, update: {}, create: { name: 'Service 3' } }),
  ])

  const providerPromises = [];
  for (let i = 1; i <= 8; i++) {
    providerPromises.push(
      prisma.provider.upsert({
        where: { id: i },
        update: {},
        create: { name: `Provider ${i}`, quota: 10 }
      })
    );
  }
  await Promise.all(providerPromises);

  console.log('Database seeded with Services and Providers!');
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })