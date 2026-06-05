import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICategoryDoc extends Document {
  name: string;
  slug: string;
  icon: string;
  image?: string;
  parent?: mongoose.Types.ObjectId | null;
  level: number;
  productCount: number;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategoryDoc>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    icon: { type: String, default: '📦' },
    image: { type: String },
    parent: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
    level: { type: Number, default: 0 },
    productCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

CategorySchema.index({ slug: 1 });
CategorySchema.index({ parent: 1 });

const Category: Model<ICategoryDoc> =
  mongoose.models.Category || mongoose.model<ICategoryDoc>('Category', CategorySchema);

export default Category;
