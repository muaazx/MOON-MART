import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOrderDoc extends Document {
  user: mongoose.Types.ObjectId;
  items: {
    product: mongoose.Types.ObjectId;
    productName: string;
    productImage: string;
    price: number;
    quantity: number;
  }[];
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: 'stripe' | 'paypal' | 'bank_uk_gbp' | 'bank_us_usd' | 'zelle' | 'wise_uk';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  couponCode?: string;
  trackingNumber?: string;
  notes?: string;
  stripePaymentIntentId?: string;
  paymentProofImage?: string;
  createdAt: Date;
  updatedAt: Date;
  currency?: string;
  country?: string;
}

const OrderSchema = new Schema<IOrderDoc>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        productName: { type: String, required: true },
        productImage: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, default: 'Pakistan' },
    },
    paymentMethod: {
      type: String,
      enum: ['stripe', 'paypal', 'bank_uk_gbp', 'bank_us_usd', 'zelle', 'wise_uk'],
      required: true,
    },
    paymentProofImage: {
      type: String,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    orderStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    subtotal: { type: Number, required: true },
    shippingFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    couponCode: { type: String },
    trackingNumber: { type: String },
    notes: { type: String },
    stripePaymentIntentId: { type: String },
    currency: { type: String, default: 'USD' },
    country: { type: String, default: 'US' },
  },
  { timestamps: true }
);

OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ orderStatus: 1 });

const Order: Model<IOrderDoc> =
  mongoose.models.Order || mongoose.model<IOrderDoc>('Order', OrderSchema);

export default Order;
