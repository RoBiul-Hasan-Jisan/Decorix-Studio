export interface Category {
  _id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  images: string[];
  thumbnail: string;
  category: Category | string;
  brand?: string;
  material?: string;
  color?: string[];
  size?: string;
  dimensions?: string;
  weight?: string;
  sku: string;
  price: number;
  discountPercent: number;
  finalPrice: number;
  stock: number;
  rating: number;
  numReviews: number;
  isFeatured?: boolean;
  isTrending?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
}

export interface CartItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  stock: number;
}

export interface AppUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  photoURL?: string;
  role: "customer" | "admin";
  addresses: any[];
  wishlist: string[];
}

export interface Order {
  _id: string;
  orderNumber: string;
  items: any[];
  shipping: any;
  status: string;
  statusHistory: any[];
  subTotal: number;
  deliveryCharge: number;
  discount: number;
  totalAmount: number;
  createdAt: string;
}
