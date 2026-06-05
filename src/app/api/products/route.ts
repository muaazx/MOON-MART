import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { checkRealDbConnection, readDb } from '@/lib/mockDb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';
    const brand = searchParams.get('brand') || '';
    const minPrice = parseFloat(searchParams.get('minPrice') || '0');
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '9999999');
    const sort = searchParams.get('sort') || ''; // 'price_asc', 'price_desc', 'rating', 'newest'
    const featured = searchParams.get('featured') === 'true';
    const flashSale = searchParams.get('flashSale') === 'true';
    const country = searchParams.get('country') || '';

    const isRealDbConnected = await checkRealDbConnection();

    if (isRealDbConnected) {
      await dbConnect();

      // Build MongoDB query
      const query: any = {};

      if (q) {
        query.$text = { $search: q };
      }
      if (category) {
        query.categoryName = { $regex: new RegExp(category, 'i') };
      }
      if (brand) {
        query.brand = { $regex: new RegExp(brand, 'i') };
      }
      if (featured) {
        query.isFeatured = true;
      }
      if (flashSale) {
        query.isFlashSale = true;
      }
      if (country && country !== 'ALL') {
        query.country = country;
      }
      query.price = { $gte: minPrice, $lte: maxPrice };

      // Build sort
      let sortQuery: any = { createdAt: -1 };
      if (sort === 'price_asc') {
        sortQuery = { price: 1 };
      } else if (sort === 'price_desc') {
        sortQuery = { price: -1 };
      } else if (sort === 'rating') {
        sortQuery = { rating: -1 };
      }

      const products = await Product.find(query).sort(sortQuery);

      return NextResponse.json({
        success: true,
        database: 'MongoDB Atlas',
        data: products,
      });
    } else {
      // Use local JSON DB
      const db = readDb();
      let products = db.products;

      // Filter products
      if (q) {
        const queryLower = q.toLowerCase();
        products = products.filter(
          (p) =>
            p.name.toLowerCase().includes(queryLower) ||
            p.description.toLowerCase().includes(queryLower) ||
            p.brand.toLowerCase().includes(queryLower) ||
            p.tags.some((t: string) => t.toLowerCase().includes(queryLower))
        );
      }

      if (category) {
        const catLower = category.toLowerCase();
        products = products.filter(
          (p) =>
            p.categoryName?.toLowerCase() === catLower ||
            p.category?.toLowerCase() === catLower
        );
      }

      if (brand) {
        const brandLower = brand.toLowerCase();
        products = products.filter((p) => p.brand.toLowerCase() === brandLower);
      }

      if (featured) {
        products = products.filter((p) => p.isFeatured);
      }

      if (flashSale) {
        products = products.filter((p) => p.isFlashSale);
      }

      if (country && country !== 'ALL') {
        products = products.filter((p) => p.country === country);
      }

      // Filter price
      products = products.filter((p) => {
        const price = p.discountPrice || p.price;
        return price >= minPrice && price <= maxPrice;
      });

      // Sort
      if (sort === 'price_asc') {
        products.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
      } else if (sort === 'price_desc') {
        products.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
      } else if (sort === 'rating') {
        products.sort((a, b) => b.rating - a.rating);
      } else {
        // Default newest
        products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }

      return NextResponse.json({
        success: true,
        database: 'Local JSON File',
        data: products,
      });
    }
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const isRealDbConnected = await checkRealDbConnection();

    // Basic validation
    if (!body.name || !body.price) {
      return NextResponse.json({ success: false, error: 'Name and price are required' }, { status: 400 });
    }

    if (isRealDbConnected) {
      await dbConnect();
      const product = await Product.create(body);
      return NextResponse.json({ success: true, data: product }, { status: 201 });
    } else {
      const db = readDb();
      const newProduct = {
        _id: `prod_${Date.now()}`,
        ...body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Auto-generate slug if not provided
      if (!newProduct.slug) {
        newProduct.slug = newProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      }

      db.products.push(newProduct);
      
      // We assume writeDb exists and works
      const { writeDb } = require('@/lib/mockDb');
      writeDb(db);
      
      return NextResponse.json({ success: true, data: newProduct }, { status: 201 });
    }
  } catch (error: any) {
    console.error('Error creating product:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
