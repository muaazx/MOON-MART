import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
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
      
      // Try finding by ID first, then by slug
      let product = null;
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        product = await Product.findById(id);
      }
      if (!product) {
        product = await Product.findOne({ slug: id });
      }

      if (!product) {
        return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true, database: 'MongoDB Atlas', data: product });
    } else {
      const db = readDb();
      const product = db.products.find((p) => p._id === id || p.slug === id);

      if (!product) {
        return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true, database: 'Local JSON File', data: product });
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
      
      // Resolve category ObjectId if frontend sent a slug string instead of an ObjectId
      const mongoose = (await import('mongoose')).default;
      if (body.category && !mongoose.Types.ObjectId.isValid(body.category)) {
        const Category = (await import('@/models/Category')).default;
        const cat = await Category.findOne({ name: body.categoryName });
        if (cat) {
          body.category = cat._id;
        } else {
          return NextResponse.json({ success: false, error: 'Invalid category specified' }, { status: 400 });
        }
      }

      const updatedProduct = await Product.findByIdAndUpdate(id, body, { new: true });
      if (!updatedProduct) {
        return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: updatedProduct });
    } else {
      const db = readDb();
      const index = db.products.findIndex((p) => p._id === id);

      if (index === -1) {
        return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
      }

      db.products[index] = {
        ...db.products[index],
        ...body,
        updatedAt: new Date().toISOString(),
      };

      writeDb(db);
      return NextResponse.json({ success: true, data: db.products[index] });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const isRealDbConnected = await checkRealDbConnection();

    if (isRealDbConnected) {
      await dbConnect();
      const deletedProduct = await Product.findByIdAndDelete(id);
      if (!deletedProduct) {
        return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, message: 'Product deleted' });
    } else {
      const db = readDb();
      const filteredProducts = db.products.filter((p) => p._id !== id);

      if (filteredProducts.length === db.products.length) {
        return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
      }

      db.products = filteredProducts;
      writeDb(db);
      return NextResponse.json({ success: true, message: 'Product deleted' });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
