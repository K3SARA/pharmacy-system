import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const bills = await prisma.bill.findMany({
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
      // 1. Create the bill
      const bill = await tx.bill.create({
        data: {
          totalAmount: parseFloat(totalAmount),
          items: {
            create: items.map((item: any) => ({
              medicineId: parseInt(item.medicineId, 10),
              quantity: parseInt(item.quantity, 10),
              price: parseFloat(item.price)
            }))
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
