import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    const medicines = await prisma.medicine.findMany({
      where: search ? {
        name: {
          contains: search
        }
      } : undefined,
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json(medicines);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, batchNumber, expiryDate, price, costPrice, stockQuantity } = body;

    const newMedicine = await prisma.medicine.create({
      data: {
        name,
        batchNumber,
        expiryDate: new Date(expiryDate),
        price: parseFloat(price),
        costPrice: parseFloat(costPrice) || 0,
        stockQuantity: parseInt(stockQuantity, 10),
      },
    });

    return NextResponse.json(newMedicine, { status: 201 });
  } catch (error) {
    console.error('Error creating medicine:', error);
    return NextResponse.json({ error: 'Failed to create medicine' }, { status: 500 });
  }
}
