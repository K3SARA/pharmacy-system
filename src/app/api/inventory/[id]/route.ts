import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, batchNumber, expiryDate, price, costPrice, stockQuantity } = body;

    const updatedMedicine = await prisma.medicine.update({
      where: {
        id: parseInt(id, 10),
      },
      data: {
        name,
        batchNumber,
        expiryDate: expiryDate ? new Date(expiryDate) : undefined,
        price: price ? parseFloat(price) : undefined,
        costPrice: costPrice !== undefined ? parseFloat(costPrice) : undefined,
        stockQuantity: stockQuantity !== undefined ? parseInt(stockQuantity, 10) : undefined,
      },
    });

    return NextResponse.json(updatedMedicine);
  } catch (error) {
    console.error('Error updating medicine:', error);
    return NextResponse.json({ error: 'Failed to update medicine' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await prisma.medicine.delete({
      where: {
        id: parseInt(id, 10),
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting medicine:', error);
    return NextResponse.json({ error: 'Failed to delete medicine' }, { status: 500 });
  }
}
