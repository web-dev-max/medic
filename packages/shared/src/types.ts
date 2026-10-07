// ============================================================
// Shared types for Medikom Plus
// ============================================================

// ----------------------------------------------------------------
// Product
// ----------------------------------------------------------------

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  oldPrice?: number;
  categoryId: number;
  brandId: number;
  images: string[];
  specifications: Record<string, string>;
  seoTitle?: string;
  seoDescription?: string;
  seoCanonical?: string;
  ogImage?: string;
  isFeatured?: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductListResponse {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ProductFilters {
  categoryId?: number;
  brandId?: number;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'name' | 'price' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// ----------------------------------------------------------------
// Category
// ----------------------------------------------------------------

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: number;
  seoTitle?: string;
  seoDescription?: string;
  seoCanonical?: string;
  ogImage?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryTree extends Category {
  children: CategoryTree[];
}

// ----------------------------------------------------------------
// Brand
// ----------------------------------------------------------------

export interface Brand {
  id: number;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  seoTitle?: string;
  seoDescription?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------------------
// Request (Form submissions)
// ----------------------------------------------------------------

export type RequestType = 'callback' | 'product' | 'service' | 'general' | 'cart';

export interface CallbackRequest {
  type: 'callback';
  name: string;
  phone: string;
}

export interface ProductRequest {
  type: 'product';
  name: string;
  phone: string;
  email: string;
  productId?: number;
  productName?: string;
  comment?: string;
}

export interface ServiceRequest {
  type: 'service';
  name: string;
  organization?: string;
  phone: string;
  email: string;
  equipmentType: string;
  manufacturer: string;
  model: string;
  serialNumber?: string;
  problemDescription: string;
  file?: string; // base64 or file URL
}

export interface GeneralRequest {
  type: 'general';
  name: string;
  phone: string;
  email: string;
  message: string;
}

export interface CartRequest {
  type: 'cart';
  name: string;
  phone: string;
  email: string;
  items: CartItem[];
  comment?: string;
}

export type SubmitRequest =
  | CallbackRequest
  | ProductRequest
  | ServiceRequest
  | GeneralRequest
  | CartRequest;

export interface CartItem {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
}

export interface SubmittedRequest {
  id: number;
  type: RequestType;
  data: SubmitRequest;
  status: 'new' | 'processed' | 'completed';
  createdAt: string;
}

// ----------------------------------------------------------------
// Content pages
// ----------------------------------------------------------------

export interface ContentPage {
  id: number;
  slug: string;
  title: string;
  content: string;
  seoTitle?: string;
  seoDescription?: string;
  seoCanonical?: string;
  ogImage?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------------------
// Blog / Articles
// ----------------------------------------------------------------

export interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  image?: string;
  author?: string;
  publishedAt: string;
  seoTitle?: string;
  seoDescription?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------------------
// Pagination
// ----------------------------------------------------------------

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ----------------------------------------------------------------
// API Response
// ----------------------------------------------------------------

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ----------------------------------------------------------------
// Admin Auth
// ----------------------------------------------------------------

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'editor';
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// ----------------------------------------------------------------
// SEO
// ----------------------------------------------------------------

export interface SeoMeta {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogTitle?: string;
  ogDescription?: string;
  keywords?: string;
}

// ----------------------------------------------------------------
// Contact info
// ----------------------------------------------------------------

export interface ContactInfo {
  address: string;
  phone: string;
  phones: string[];
  email: string;
  workHours: string;
  lat: number;
  lng: number;
  mapProvider: 'yandex' | 'google';
}
