import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import { checkRealDbConnection, readDb, writeDb } from '@/lib/mockDb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const isRealDbConnected = await checkRealDbConnection();

    if (isRealDbConnected) {
      await dbConnect();
      const order = await Order.findById(id);
      if (!order) {
        return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, database: 'MongoDB Atlas', data: order });
    } else {
      const db = readDb();
      const order = db.orders.find((o) => o._id === id);
      if (!order) {
        return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, database: 'Local JSON File', data: order });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const isRealDbConnected = await checkRealDbConnection();

    if (isRealDbConnected) {
      await dbConnect();
      const updatedOrder = await Order.findByIdAndUpdate(id, body, { new: true });
      if (!updatedOrder) {
        return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: updatedOrder });
    } else {
      const db = readDb();
      const index = db.orders.findIndex((o) => o._id === id);

      if (index === -1) {
        return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
      }

      db.orders[index] = {
        ...db.orders[index],
        ...body,
        updatedAt: new Date().toISOString(),
      };

      writeDb(db);
      return NextResponse.json({ success: true, data: db.orders[index] });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
