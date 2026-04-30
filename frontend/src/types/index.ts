export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: 'ADMIN' | 'CUSTOMER';
  phone: string | null;
  address: string | null;
  isActive: boolean;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  priceCents: number;
  priceDecimal: number;
  currency: string;
  stock: number;
  imageUrl: string | null;
  images: string[];
  discountPercent: number | null;
  categoryId: string;
  isActive: boolean;
  isAvailable: boolean;
}

export interface PaginatedProducts {
  items: Product[];
  total: number;
  skip: number;
  take: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  unitPriceDecimal: number;
  subtotalDecimal: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  itemCount: number;
  totalDecimal: number;
  currency: string;
}

export type OrderStatus = 'PENDING' | 'PENDING_VERIFICATION' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface Order {
  id: string;
  status: OrderStatus;
  totalDecimal: number;
  currency: string;
  shippingAddress: string;
  paymentProofUrl: string | null;
  items: Array<{
    productName: string;
    quantity: number;
    unitPriceDecimal: number;
    subtotalDecimal: number;
  }>;
  createdAt: string;
}
