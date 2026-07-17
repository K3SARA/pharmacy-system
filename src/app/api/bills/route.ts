import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    let dateFilter: any = undefined;
    if (from || to) {
      dateFilter = {};
      if (from) dateFilter.gte = new Date(from);
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        dateFilter.lte = toDate;
      }
    }

    const bills = await prisma.bill.findMany({
      where: dateFilter ? { date: dateFilter } : undefined,
      include: {
        items: {
          include: {
            medicine: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    return NextResponse.json(bills);
  } catch (error) {
    console.error('Error fetching bills:', error);
    return NextResponse.json({ error: 'Failed to fetch bills' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, totalAmount } = body;
    // items is expected to be an array of { medicineId, quantity, price }

    // Use a transaction to ensure all operations succeed or fail together
    const newBill = await prisma.$transaction(async (tx) => {
      // Fetch all medicines to get their current cost prices
      const medicineIds = items.map((i: any) => parseInt(i.medicineId, 10));
      const medicines = await tx.medicine.findMany({
        where: { id: { in: medicineIds } }
      });
      const medMap = new Map(medicines.map(m => [m.id, m]));

      // 1. Create the bill
      const bill = await tx.bill.create({
        data: {
          totalAmount: parseFloat(totalAmount),
          items: {
            create: items.map((item: any) => {
              const medId = parseInt(item.medicineId, 10);
              return {
                medicineId: medId,
                quantity: parseInt(item.quantity, 10),
                price: parseFloat(item.price),
                costPrice: medMap.get(medId)?.costPrice || 0
              };
            })
          }
        },
        include: {
          items: true
        }
      });

      // 2. Deduct stock for each item
      for (const item of items) {
        await tx.medicine.update({
          where: { id: parseInt(item.medicineId, 10) },
          data: {
            stockQuantity: {
              decrement: parseInt(item.quantity, 10)
            }
          }
        });
      }

      return bill;
    });

    return NextResponse.json(newBill, { status: 201 });
  } catch (error) {
    console.error('Error creating bill:', error);
    return NextResponse.json({ error: 'Failed to create bill' }, { status: 500 });
  }
}
