import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Retailer Data Audit ---');
  
  const totalProfiles = await prisma.retailerProfile.count();
  const activeUsers = await prisma.user.count({ where: { role: 'retailer', isActive: true } });
  const totalUsers = await prisma.user.count({ where: { role: 'retailer' } });

  console.log('Retailer Profiles:', totalProfiles);
  console.log('Active Retailer Users:', activeUsers);
  console.log('Total Retailer Users:', totalUsers);

  // Find users without profiles
  const users = await prisma.user.findMany({
    where: { role: 'retailer' },
    include: { retailerProfile: true }
  });

  const orphans = users.filter(u => !u.retailerProfile);
  console.log('Retailer Users without Profiles:', orphans.length);
  orphans.forEach(u => {
    console.log(`- ID: ${u.id}, Name: ${u.name}, Phone: ${u.phone}`);
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
