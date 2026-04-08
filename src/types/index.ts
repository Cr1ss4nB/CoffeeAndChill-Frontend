// ---- Auth & Users ----
export type Role = 'ADMIN' | 'EMPLOYEE' | 'CUSTOMER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  avatarUrl?: string;
}

export interface BackendUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: BackendUser;
}

// ---- Menu / Products ----
export type ProductCategory = 'bebidas' | 'pasabocas' | 'talleres' | 'tienda';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  imageUrl?: string;
  available: boolean;
}

// ---- Orders ----
export type OrderStatus = 'EN_ESPERA' | 'EN_PROCESO' | 'TERMINADO';
export type PaymentStatus = 'PAGADO' | 'NO_PAGADO';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  customizations?: ProductCustomizations;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: number;
  tableNumber: number;
  items: OrderItem[];
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  total: number;
  createdAt: string;
  updatedAt: string;
}

// ---- Inventory ----
export type InventoryCategory = 'consumo' | 'creativo';
export type StockStatus = 'OK' | 'LOW' | 'OUT';

export interface InventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  subcategory: string;
  stock: number;
  unit: string;
  minStock: number;
  status: StockStatus;
  colors?: string[];       // For paint kits
  volume?: string;         // For individual paints: '25ml' | '50ml' | '100ml'
}

// ---- Workshops ----
export interface Workshop {
  id: string;
  name: string;
  description: string;
  date: string;
  time: string;
  totalSpots: number;
  reservedSpots: number;
  price: number;
  imageUrl?: string;
}

export interface Reservation {
  id: string;
  workshopId: string;
  name: string;
  email: string;
  phone: string;
  attendees: number;
  attended: boolean;
  createdAt: string;
}

// ---- Customizations ----
export interface BebidaCustomizations {
  azucar: 'sin_azucar' | 'poco_dulce' | 'normal' | 'muy_dulce';
  temperatura: 'caliente' | 'frio' | 'tibio';
  leche: 'entera' | 'deslactosada' | 'vegetal';
}

export interface ProductCustomizations {
  bebida?: BebidaCustomizations;
  notas?: string;
}

// ---- Cart (client-side) ----
export interface CartItem {
  cartItemId: string;
  product: Product;
  quantity: number;
  customizations?: ProductCustomizations;
}

// ---- QR Tables ----
export interface TableQR {
  tableNumber: number;
  url: string;
}

// ---- API Response Wrapper ----
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
