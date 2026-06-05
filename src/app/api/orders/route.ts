import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { checkRealDbConnection, readDb, writeDb } from '@/lib/mockDb';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user, items, shippingAddress, paymentMethod, notes, paymentProofImage } = body;

    if (!user || !items || items.length === 0 || !shippingAddress || !paymentMethod) {
      return NextResponse.json({ success: false, error: 'Please provide all order details' }, { status: 400 });
    }

    if (paymentMethod !== 'stripe' && !paymentProofImage) {
      return NextResponse.json({ success: false, error: 'Please upload a payment proof image to confirm order' }, { status: 400 });
    }

    const isRealDbConnected = await checkRealDbConnection();

    if (isRealDbConnected) {
      await dbConnect();

      // Validate prices and stock from database
      let subtotal = 0;
      const orderItems = [];

      for (const item of items) {
        const product = await Product.findById(item.product._id);
        if (!product) {
          return NextResponse.json({ success: false, error: `Product not found: ${item.product.name}` }, { status: 404 });
        }
        if (product.stock < item.quantity) {
          return NextResponse.json({ success: false, error: `Insufficient stock for ${product.name}` }, { status: 400 });
        }

        const price = product.discountPrice || product.price;
        subtotal += price * item.quantity;

        // Decrement stock
        product.stock -= item.quantity;
        product.sold += item.quantity;
        await product.save();

        orderItems.push({
          product: product._id,
          productName: product.name,
          productImage: product.images[0] || '/placeholder.jpg',
          price,
          quantity: item.quantity,
        });
      }

      const firstProduct = await Product.findById(items[0].product._id);
      const orderCountry = firstProduct?.country || 'US';
      const isUK = orderCountry === 'UK';
      const threshold = isUK ? 40 : 50;
      const fee = isUK ? 4 : 5;
      const currency = isUK ? 'GBP' : 'USD';

      const shippingFee = subtotal > threshold ? 0 : fee;
      const total = subtotal + shippingFee;

      const order = await Order.create({
        user: user.id || user, // supports object or string
        items: orderItems,
        shippingAddress,
        paymentMethod,
        paymentStatus: paymentMethod === 'stripe' ? 'paid' : 'pending',
        orderStatus: 'pending',
        subtotal,
        shippingFee,
        discount: 0,
        total,
        notes,
        paymentProofImage,
        trackingNumber: `MM-${Math.floor(100000 + Math.random() * 900000)}`,
        country: orderCountry,
        currency,
      });

      return NextResponse.json({
        success: true,
        database: 'MongoDB Atlas',
        orderId: order._id,
        order,
      });
    } else {
      // Local JSON DB
      const db = readDb();
      let subtotal = 0;
      const orderItems = [];

      for (const item of items) {
        const productIndex = db.products.findIndex((p) => p._id === item.product._id);
        if (productIndex === -1) {
          return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
        }
        const product = db.products[productIndex];
        if (product.stock < item.quantity) {
          return NextResponse.json({ success: false, error: `Insufficient stock for ${product.name}` }, { status: 400 });
        }

        const price = product.discountPrice || product.price;
        subtotal += price * item.quantity;

        // Decrement stock in mock database
        db.products[productIndex].stock -= item.quantity;
        db.products[productIndex].sold += item.quantity;

        orderItems.push({
          product: product._id,
          productName: product.name,
          productImage: product.images[0] || '/placeholder.jpg',
          price,
          quantity: item.quantity,
        });
      }

      const firstProduct = db.products.find((p) => p._id === items[0].product._id);
      const orderCountry = firstProduct?.country || 'US';
      const isUK = orderCountry === 'UK';
      const threshold = isUK ? 40 : 50;
      const fee = isUK ? 4 : 5;
      const currency = isUK ? 'GBP' : 'USD';

      const shippingFee = subtotal > threshold ? 0 : fee;
      const total = subtotal + shippingFee;

      const newOrder = {
        _id: `ord_${Date.now()}`,
        user: user.id || user,
        items: orderItems,
        shippingAddress,
        paymentMethod,
        paymentStatus: paymentMethod === 'stripe' ? 'paid' : 'pending',
        orderStatus: 'pending',
        subtotal,
        shippingFee,
        discount: 0,
        total,
        notes,
        paymentProofImage,
        trackingNumber: `MM-${Math.floor(100000 + Math.random() * 900000)}`,
        country: orderCountry,
        currency,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      db.orders.push(newOrder);
      writeDb(db);

      return NextResponse.json({
        success: true,
        database: 'Local JSON File',
        orderId: newOrder._id,
        order: newOrder,
      });
    }
  } catch (error: any) {
    console.error('Error placing order:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || '';

    const isRealDbConnected = await checkRealDbConnection();

    if (isRealDbConnected) {
      await dbConnect();
      const query = userId ? { user: userId } : {};
      const orders = await Order.find(query).sort({ createdAt: -1 });

      return NextResponse.json({ success: true, database: 'MongoDB Atlas', data: orders });
    } else {
      const db = readDb();
      let orders = db.orders;

      if (userId) {
        orders = orders.filter((o) => o.user === userId);
      }

      // Sort by newest
      orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return NextResponse.json({ success: true, database: 'Local JSON File', data: orders });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
