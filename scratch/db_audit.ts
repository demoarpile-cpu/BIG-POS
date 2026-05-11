import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Database Count Audit ---');
  
  const customerTotal = await prisma.consumerProfile.count();
  console.log('Total Customers:', customerTotal);
  
  const nfcTotal = await prisma.nfcCard.count();
  console.log('Total NFC Cards:', nfcTotal);
  
  const retailerTotal = await prisma.retailerProfile.count();
  console.log('Total Retailers:', retailerTotal);
  
  const wholesalerTotal = await prisma.wholesalerProfile.count();
  console.log('Total Wholesalers:', wholesalerTotal);
  
  const loanTotal = await prisma.loan.count();
  console.log('Total Loans:', loanTotal);
  
  const saleTotal = await prisma.sale.count();
  console.log('Total Sales:', saleTotal);
  
  const gasTotal = await prisma.gasTopup.count();
  console.log('Total Gas Topups:', gasTotal);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
