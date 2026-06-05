import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProductDoc extends Document {
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number;
  images: string[];
  category: mongoose.Types.ObjectId;
  brand: string;
  stock: number;
  sold: number;
  rating: number;
  reviewCount: number;
  specifications: Map<string, string>;
  tags: string[];
  isFeatured: boolean;
  isFlashSale: boolean;
  flashSaleEnd?: Date;
  createdAt: Date;
  updatedAt: Date;
  country?: 'US' | 'UK';
}

const ProductSchema = new Schema<IProductDoc>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0 },
    images: [{ type: String }],
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    brand: { type: String, trim: true, default: 'Unbranded' },
    stock: { type: Number, required: true, min: 0, default: 0 },
    sold: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    specifications: { type: Map, of: String },
    tags: [{ type: String, lowercase: true }],
    isFeatured: { type: Boolean, default: false },
    isFlashSale: { type: Boolean, default: false },
    flashSaleEnd: { type: Date },
    country: { type: String, enum: ['US', 'UK'], default: 'US' },
  },
  { timestamps: true }
);

// Text index for search
ProductSchema.index({ name: 'text', description: 'text', brand: 'text', tags: 'text' });
ProductSchema.index({ slug: 1 });
ProductSchema.index({ category: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ isFeatured: 1 });
ProductSchema.index({ isFlashSale: 1 });

const Product: Model<IProductDoc> =
  mongoose.models.Product || mongoose.model<IProductDoc>('Product', ProductSchema);

export default Product;
