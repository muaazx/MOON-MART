import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Category from '@/models/Category';
import Product from '@/models/Product';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import slugify from 'slugify';
import { checkRealDbConnection, readDb, writeDb } from '@/lib/mockDb';

const categoriesData = [
  { name: 'Electronics', slug: 'electronics', icon: '📱', level: 0 },
  { name: 'Fashion', slug: 'fashion', icon: '👗', level: 0 },
  { name: 'Home & Living', slug: 'home-living', icon: '🏠', level: 0 },
  { name: 'Beauty & Health', slug: 'beauty-health', icon: '💄', level: 0 },
  { name: 'Sports & Outdoors', slug: 'sports-outdoors', icon: '⚽', level: 0 },
  { name: 'Groceries', slug: 'groceries', icon: '🛒', level: 0 },
  { name: 'Baby & Toys', slug: 'baby-toys', icon: '🧸', level: 0 },
  { name: 'Automotive', slug: 'automotive', icon: '🚗', level: 0 },
  { name: 'Books', slug: 'books', icon: '📚', level: 0 },
  { name: 'Gaming', slug: 'gaming', icon: '🎮', level: 0 },
];

const productsData = [
  // Electronics
  {
    name: 'Wireless Bluetooth Earbuds Pro',
    description: 'Premium wireless earbuds with active noise cancellation, deep bass, and comfortable fit. IPX7 waterproof. Up to 40 hours of battery life with case.',
    price: 39.99,
    discountPrice: 24.99,
    images: ['https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=600&h=600&fit=crop'],
    brand: 'SoundMax',
    stock: 15,
    sold: 245,
    rating: 4.5,
    reviewCount: 189,
    specifications: {
      'Connectivity': 'Bluetooth 5.3',
      'Battery': '40 Hours with Case',
      'Waterproof': 'IPX7',
      'Noise Cancelling': 'Yes (Active)',
    },
    tags: ['earbuds', 'wireless', 'bluetooth', 'audio'],
    isFeatured: true,
    isFlashSale: true,
    flashSaleEnd: new Date(Date.now() + 86400000).toISOString(),
    country: 'US',
  },
  {
    name: 'Smart Watch Fitness Tracker',
    description: 'Advanced fitness tracking smartwatch with heart rate monitor, sleep tracking, SpO2 sensor, and 14 sport modes. 1.4-inch touch screen with customizable watch faces.',
    price: 49.99,
    discountPrice: 34.99,
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop'],
    brand: 'TechFit',
    stock: 8,
    sold: 312,
    rating: 4.3,
    reviewCount: 156,
    specifications: {
      'Screen Size': '1.4 Inch LCD',
      'Battery Life': 'Up to 10 days',
      'Compatibility': 'Android & iOS',
      'Sensors': 'Heart Rate, SpO2, Accelerometer',
    },
    tags: ['smartwatch', 'fitness', 'tracker', 'wearables'],
    isFeatured: true,
    isFlashSale: true,
    flashSaleEnd: new Date(Date.now() + 86400000).toISOString(),
    country: 'UK',
  },
  {
    name: 'Samsung Galaxy A55 5G - 128GB',
    description: 'Latest Samsung Galaxy phone featuring a 6.6-inch Super AMOLED screen, octa-core processor, triple rear camera (50MP + 12MP + 5MP), and 5G connectivity.',
    price: 399.99,
    discountPrice: 349.99,
    images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=600&fit=crop'],
    brand: 'Samsung',
    stock: 25,
    sold: 145,
    rating: 4.6,
    reviewCount: 89,
    specifications: {
      'Display': '6.6" Super AMOLED 120Hz',
      'RAM': '8 GB',
      'Storage': '128 GB',
      'Battery': '5000 mAh',
    },
    tags: ['samsung', 'phone', 'galaxy', 'smartphone', '5g'],
    isFeatured: true,
    isFlashSale: false,
    country: 'US',
  },
  {
    name: 'MacBook Air M2 - 256GB SSD',
    description: 'Apple MacBook Air featuring the M2 chip, 13.6-inch Liquid Retina display, 8GB unified memory, and 256GB SSD. Super light and fanless design.',
    price: 999.99,
    discountPrice: 899.99,
    images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=600&fit=crop'],
    brand: 'Apple',
    stock: 5,
    sold: 67,
    rating: 4.9,
    reviewCount: 156,
    specifications: {
      'Processor': 'Apple M2 Chip',
      'Display': '13.6" Liquid Retina',
      'Memory': '8 GB Unified',
      'Storage': '256 GB SSD',
    },
    tags: ['apple', 'macbook', 'laptop', 'm2'],
    isFeatured: true,
    isFlashSale: false,
    country: 'US',
  },
  {
    name: 'Sony WH-1000XM5 Headphones',
    description: 'Industry leading active noise cancelling wireless headphones by Sony. Features auto-NC optimizer, 8 mics, and premium audio quality.',
    price: 299.99,
    discountPrice: 249.99,
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop'],
    brand: 'Sony',
    stock: 10,
    sold: 278,
    rating: 4.7,
    reviewCount: 445,
    specifications: {
      'Type': 'Over-Ear Wireless',
      'ANC': 'Yes (Industry Leading)',
      'Battery Life': 'Up to 30 Hours',
      'Voice Assistant': 'Google / Alexa / Siri',
    },
    tags: ['sony', 'headphones', 'noise cancelling', 'wireless'],
    isFeatured: true,
    isFlashSale: false,
    country: 'UK',
  },
  {
    name: 'Portable Bluetooth Speaker',
    description: 'Waterproof portable bluetooth speaker with deep bass and high fidelity audio. Perfect for outdoor pool parties and camping trips.',
    price: 39.99,
    discountPrice: 29.99,
    images: ['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=600&fit=crop'],
    brand: 'BassBlast',
    stock: 22,
    sold: 178,
    rating: 4.4,
    reviewCount: 134,
    specifications: {
      'Waterproof': 'IPX6',
      'Battery': '12 Hours playback',
      'Speaker Output': '20W Dual Drivers',
    },
    tags: ['speaker', 'bluetooth', 'audio', 'portable'],
    isFeatured: false,
    isFlashSale: true,
    flashSaleEnd: new Date(Date.now() + 86400000).toISOString(),
    country: 'UK',
  },

  // Fashion
  {
    name: "Men's Premium Leather Jacket",
    description: 'Genuine high-quality sheepskin leather jacket with slim-fit style, metal zippers, and satin interior lining. Timeless fashion statement.',
    price: 129.99,
    discountPrice: 79.99,
    images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=600&fit=crop'],
    brand: 'UrbanEdge',
    stock: 3,
    sold: 89,
    rating: 4.7,
    reviewCount: 67,
    specifications: {
      'Material': '100% Genuine Leather',
      'Lining': 'Polyester Satin',
      'Closure': 'Zipper',
      'Pockets': '4 Exterior, 2 Interior',
    },
    tags: ['leather', 'jacket', 'mens fashion', 'winter'],
    isFeatured: true,
    isFlashSale: true,
    flashSaleEnd: new Date(Date.now() + 86400000).toISOString(),
    country: 'US',
  },
  {
    name: "Nike Air Max 270 - Men's",
    description: 'Nike Air Max 270 athletic lifestyle sneakers featuring Nike largest Max Air unit in the heel. Breathable mesh construction for everyday comfort.',
    price: 119.99,
    discountPrice: 99.99,
    images: ['https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=600&h=600&fit=crop'],
    brand: 'Nike',
    stock: 12,
    sold: 234,
    rating: 4.8,
    reviewCount: 312,
    specifications: {
      'Sole': 'Rubber with Air Cushion',
      'Upper Material': 'Synthetic Mesh',
      'Ideal For': 'Running & Lifestyle',
    },
    tags: ['nike', 'shoes', 'sneakers', 'sports fashion'],
    isFeatured: true,
    isFlashSale: false,
    country: 'UK',
  },
  {
    name: "Adidas Ultraboost 22 Women's",
    description: 'Adidas Ultraboost running shoes featuring a responsive Boost midsole and Primeknit upper. Engineered specifically for a woman footprint.',
    price: 179.99,
    discountPrice: 139.99,
    images: ['https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&h=600&fit=crop'],
    brand: 'Adidas',
    stock: 20,
    sold: 312,
    rating: 4.5,
    reviewCount: 234,
    specifications: {
      'Midsole': 'Boost Technology',
      'Upper': 'Adidas Primeknit+',
      'Outsole': 'Continental Rubber',
    },
    tags: ['adidas', 'shoes', 'running', 'womens fashion'],
    isFeatured: true,
    isFlashSale: false,
    country: 'US',
  },

  // Beauty & Health
  {
    name: 'Organic Face Serum Set',
    description: 'Perfect natural skincare serum bundle featuring Vitamin C Serum for brightening, Hyaluronic Acid for hydration, and Retinol for anti-aging.',
    price: 29.99,
    discountPrice: 19.99,
    images: ['https://images.unsplash.com/photo-1570194065650-d99fb4a38691?w=600&h=600&fit=crop'],
    brand: 'GlowUp',
    stock: 45,
    sold: 567,
    rating: 4.8,
    reviewCount: 423,
    specifications: {
      'Skin Type': 'All Skin Types',
      'Organic': 'Yes (100%)',
      'Pack Contents': 'Vitamin C, Hyaluronic Acid, Retinol',
    },
    tags: ['skincare', 'serum', 'beauty', 'glow'],
    isFeatured: false,
    isFlashSale: true,
    flashSaleEnd: new Date(Date.now() + 86400000).toISOString(),
    country: 'US',
  },
  {
    name: 'The Ordinary AHA 30% Peeling Solution',
    description: 'Alpha hydroxy acids (AHA) and beta hydroxy acids (BHA) chemical exfoliant to help clear visible blemishes and boost radiance.',
    price: 12.99,
    discountPrice: 9.99,
    images: ['https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&h=600&fit=crop'],
    brand: 'The Ordinary',
    stock: 50,
    sold: 890,
    rating: 4.7,
    reviewCount: 567,
    specifications: {
      'Concentration': 'AHA 30%, BHA 2%',
      'Frequency': 'Use twice weekly maximum',
      'Cruelty Free': 'Yes',
    },
    tags: ['skincare', 'ordinary', 'peeling', 'beauty'],
    isFeatured: true,
    isFlashSale: false,
    country: 'UK',
  },

  // Home & Living
  {
    name: 'Dyson V15 Detect Cordless Vacuum',
    description: 'Dyson most powerful cordless vacuum with laser illumination. Intelligently optimizes suction and run time based on debris and floor type.',
    price: 599.99,
    discountPrice: 499.99,
    images: ['https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=600&fit=crop'],
    brand: 'Dyson',
    stock: 14,
    sold: 56,
    rating: 4.8,
    reviewCount: 89,
    specifications: {
      'Suction Power': '230 AW',
      'Run Time': '60 Minutes',
      'Weight': '3 kg',
    },
    tags: ['dyson', 'vacuum', 'appliances', 'home'],
    isFeatured: true,
    isFlashSale: false,
    country: 'UK',
  },

  // Gaming
  {
    name: 'PS5 DualSense Wireless Controller',
    description: 'PlayStation 5 official controller featuring immersive haptic feedback, dynamic adaptive triggers, and a built-in microphone.',
    price: 69.99,
    discountPrice: 59.99,
    images: ['https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=600&h=600&fit=crop'],
    brand: 'Sony',
    stock: 35,
    sold: 156,
    rating: 4.9,
    reviewCount: 289,
    specifications: {
      'Connectivity': 'Bluetooth & USB-C',
      'Battery': 'Built-in Lithium-ion',
      'Special Features': 'Haptic Feedback, Adaptive Triggers',
    },
    tags: ['ps5', 'controller', 'sony', 'gaming'],
    isFeatured: true,
    isFlashSale: false,
    country: 'US',
  },
];

function getCategorySlug(tags: string[]): string {
  if (tags.includes('mens fashion') || tags.includes('womens fashion') || tags.includes('shoes') || tags.includes('jacket')) {
    return 'fashion';
  } else if (tags.includes('beauty') || tags.includes('skincare')) {
    return 'beauty-health';
  } else if (tags.includes('home') || tags.includes('vacuum')) {
    return 'home-living';
  } else if (tags.includes('gaming') || tags.includes('ps5')) {
    return 'gaming';
  }
  return 'electronics';
}

export async function GET() {
  try {
    const isRealDbConnected = await checkRealDbConnection();
    const salt = await bcrypt.genSalt(10);
    const adminPasswordHash = await bcrypt.hash('admin123', salt);
    const customerPasswordHash = await bcrypt.hash('customer123', salt);

    if (isRealDbConnected) {
      await dbConnect();

      // 1. Reset categories & products
      await Category.deleteMany({});
      await Product.deleteMany({});
      await User.deleteMany({});

      // 2. Insert Categories
      const seededCategories = await Category.insertMany(categoriesData);

      // Create mapping of category slug -> ObjectId
      const categoryMap: Record<string, string> = {};
      seededCategories.forEach((cat) => {
        categoryMap[cat.slug] = cat._id.toString();
      });

      // 3. Insert Products linked to categories
      const seededProductsData = productsData.map((prod) => {
        const targetCatSlug = getCategorySlug(prod.tags);
        const categoryId = categoryMap[targetCatSlug];
        const slug = slugify(prod.name, { lower: true, strict: true });

        return {
          ...prod,
          slug,
          category: categoryId,
          categoryName: categoriesData.find(c => c.slug === targetCatSlug)?.name || 'General',
        };
      });

      const seededProducts = await Product.insertMany(seededProductsData);

      // 4. Update Category product counts
      for (const cat of seededCategories) {
        const count = await Product.countDocuments({ category: cat._id });
        cat.productCount = count;
        await cat.save();
      }

      // 5. Create default users
      await User.create([
        {
          name: 'Moon Mart Admin',
          email: 'admin@moonmart.com',
          password: adminPasswordHash,
          role: 'admin',
          phone: '03001234567',
          addresses: [
            {
              fullName: 'Admin Moon Mart',
              phone: '03001234567',
              address: 'Main Boulevard, Gulberg III',
              city: 'Lahore',
              state: 'Punjab',
              zipCode: '54000',
              country: 'Pakistan',
              isDefault: true,
            }
          ]
        },
        {
          name: 'John Doe',
          email: 'customer@moonmart.pk',
          password: customerPasswordHash,
          role: 'customer',
          phone: '03217654321',
          addresses: [
            {
              fullName: 'John Doe',
              phone: '03217654321',
              address: 'House 45, Street 12, DHA Phase 5',
              city: 'Lahore',
              state: 'Punjab',
              zipCode: '54700',
              country: 'Pakistan',
              isDefault: true,
            }
          ]
        }
      ]);

      return NextResponse.json({
        success: true,
        database: 'MongoDB Atlas',
        message: 'Database seeded successfully with users, categories and products.',
        seededCategoriesCount: seededCategories.length,
        seededProductsCount: seededProducts.length,
      });
    } else {
      // Seed local JSON database
      const db: any = {
        categories: [],
        products: [],
        users: [],
        orders: [],
      };

      // Seed categories with pseudo IDs
      categoriesData.forEach((cat, idx) => {
        db.categories.push({
          _id: `cat_${idx + 1}`,
          ...cat,
          productCount: 0,
          isActive: true,
          order: idx,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      });

      // Seed products
      productsData.forEach((prod, idx) => {
        const targetCatSlug = getCategorySlug(prod.tags);
        const matchedCat = db.categories.find((c: any) => c.slug === targetCatSlug);
        const slug = slugify(prod.name, { lower: true, strict: true });
        
        db.products.push({
          _id: `prod_${idx + 1}`,
          ...prod,
          slug,
          category: matchedCat ? matchedCat._id : 'cat_1',
          categoryName: matchedCat ? matchedCat.name : 'Electronics',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        if (matchedCat) {
          matchedCat.productCount++;
        }
      });

      // Seed default users
      db.users.push(
        {
          _id: 'user_admin',
          name: 'Moon Mart Admin',
          email: 'admin@moonmart.com',
          password: adminPasswordHash, // Keep standard hashed pwd for JWT credentials provider validation
          role: 'admin',
          phone: '03001234567',
          addresses: [
            {
              _id: 'addr_admin',
              fullName: 'Admin Moon Mart',
              phone: '03001234567',
              address: 'Main Boulevard, Gulberg III',
              city: 'Lahore',
              state: 'Punjab',
              zipCode: '54000',
              country: 'Pakistan',
              isDefault: true,
            }
          ],
          createdAt: new Date().toISOString(),
        },
        {
          _id: 'user_customer',
          name: 'John Doe',
          email: 'customer@moonmart.pk',
          password: customerPasswordHash,
          role: 'customer',
          phone: '03217654321',
          addresses: [
            {
              _id: 'addr_cust',
              fullName: 'John Doe',
              phone: '03217654321',
              address: 'House 45, Street 12, DHA Phase 5',
              city: 'Lahore',
              state: 'Punjab',
              zipCode: '54700',
              country: 'Pakistan',
              isDefault: true,
            }
          ],
          createdAt: new Date().toISOString(),
        }
      );

      writeDb(db);

      return NextResponse.json({
        success: true,
        database: 'Local JSON File',
        message: 'Local mock database seeded successfully with users, categories and products.',
        seededCategoriesCount: db.categories.length,
        seededProductsCount: db.products.length,
      });
    }
  } catch (error: any) {
    console.error('Seeding error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
