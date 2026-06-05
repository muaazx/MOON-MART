// ─── Product Types ───
export interface IProduct {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number;
  images: string[];
  category: string;
  categoryName?: string;
  brand: string;
  stock: number;
  sold: number;
  rating: number;
  reviewCount: number;
  specifications: Record<string, string>;
  tags: string[];
  isFeatured: boolean;
  isFlashSale: boolean;
  flashSaleEnd?: string;
  createdAt: string;
  updatedAt: string;
  country?: 'US' | 'UK';
}

// ─── Category Types ───
export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  icon: string;
  image?: string;
  parent?: string | null;
  children?: ICategory[];
  level: number;
  productCount: number;
}

// ─── User Types ───
export interface IUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: 'customer' | 'admin';
  addresses: IAddress[];
  createdAt: string;
}

export interface IAddress {
  _id?: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

// ─── Cart Types ───
export interface ICartItem {
  product: IProduct;
  quantity: number;
}

// ─── Order Types ───
export interface IOrder {
  _id: string;
  user: string;
  items: IOrderItem[];
  shippingAddress: IAddress;
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
  paymentProofImage?: string;
  createdAt: string;
  updatedAt: string;
  currency?: string;
  country?: string;
}

export interface IOrderItem {
  product: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
}

// ─── Review Types ───
export interface IReview {
  _id: string;
  user: { _id: string; name: string; avatar?: string };
  product: string;
  rating: number;
  comment: string;
  images?: string[];
  createdAt: string;
}

// ─── Coupon Types ───
export interface ICoupon {
  _id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minPurchase: number;
  maxDiscount?: number;
  usageLimit: number;
  usedCount: number;
  expiresAt: string;
  isActive: boolean;
}

// ─── Banner Types ───
export interface IBanner {
  _id: string;
  title: string;
  subtitle?: string;
  image: string;
  link?: string;
  isActive: boolean;
  order: number;
}

// ─── API Response ───
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
