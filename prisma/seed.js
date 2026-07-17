require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  await prisma.medicine.createMany({
    data: [
      { name: 'Paracetamol 500mg', batchNumber: 'B1234', expiryDate: new Date('2025-12-31'), price: 5.99, stockQuantity: 100 },
      { name: 'Amoxicillin 250mg', batchNumber: 'B5678', expiryDate: new Date('2024-08-15'), price: 12.50, stockQuantity: 50 },
      { name: 'Ibuprofen 400mg', batchNumber: 'B9012', expiryDate: new Date('2026-01-20'), price: 8.25, stockQuantity: 5 },
      { name: 'Cetirizine 10mg', batchNumber: 'C3456', expiryDate: new Date('2025-05-10'), price: 4.50, stockQuantity: 200 },
    ],
  });
  console.log('Database seeded with dummy medicines.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
