import { API_BASE_URL } from '@/lib/constants';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers as Record<string, string>),
      },
      ...options,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || `API Error: ${response.status}`);
    }

    return response.json();
  }

  private extractData(data: unknown) {
    // Backend returns data directly (no { data: ... } wrapper)
    return data;
  }

  // Products
  async getProducts(params?: Record<string, string | number | boolean>) {
    const queryString = new URLSearchParams(params as Record<string, string>).toString();
    const response = await this.request<unknown>('/products' + (queryString ? `?${queryString}` : ''));
    return this.extractData(response);
  }

  async searchProducts(query: string, limit: number = 5) {
    const response = await this.request<unknown>(`/products?search=${encodeURIComponent(query)}&pageSize=${limit}`);
    return this.extractData(response);
  }

  async getProduct(slug: string) {
    const response = await this.request<unknown>(`/products/${encodeURIComponent(slug)}`);
    return this.extractData(response);
  }

  // Categories
  async getCategories() {
    const response = await this.request<unknown>('/categories');
    return this.extractData(response);
  }

  async getHomepageCategories() {
    const response = await this.request<unknown>('/categories/homepage');
    return this.extractData(response);
  }

  async getCategoryTree() {
    const response = await this.request<unknown>('/categories/tree');
    return this.extractData(response);
  }

  async getCategory(slug: string) {
    const response = await this.request<unknown>(`/categories/${encodeURIComponent(slug)}`);
    return this.extractData(response);
  }

  // Brands
  async getBrands() {
    const response = await this.request<unknown>('/brands');
    return this.extractData(response);
  }

  // Custom field filters
  async getCustomFieldFilters(categoryId: number, customFieldId?: number) {
    const params = new URLSearchParams({ categoryId: String(categoryId) });
    if (customFieldId) {
      params.set('customFieldId', String(customFieldId));
    }
    const response = await this.request<unknown>(`/products/filters/custom-fields?${params.toString()}`);
    return this.extractData(response);
  }

  // Requests
  async submitCallback(data: { name: string; phone: string }) {
    return this.request<unknown>('/requests/callback', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async submitProductRequest(data: {
    name: string;
    phone: string;
    email: string;
    productId?: string;
    productName?: string;
    comment?: string;
  }) {
    return this.request<unknown>('/requests/product', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async submitServiceRequest(data: {
    name: string;
    organization?: string;
    phone: string;
    email: string;
    equipmentType: string;
    manufacturer: string;
    model: string;
    serialNumber?: string;
    problemDescription: string;
    file?: string;
  }) {
    return this.request<unknown>('/requests/service', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async submitGeneralRequest(data: { name: string; phone: string; email: string; message: string }) {
    return this.request<unknown>('/requests/general', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async submitCartRequest(data: {
    name: string;
    phone: string;
    email: string;
    items: Array<{ productId: number; productName: string; price: number; quantity: number }>;
    comment?: string;
  }) {
    return this.request<unknown>('/requests/cart', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Content
  async getContent(slug: string) {
    const response = await this.request<unknown>(`/content/${slug}`);
    return this.extractData(response);
  }
}

export const apiClient = new ApiClient();
