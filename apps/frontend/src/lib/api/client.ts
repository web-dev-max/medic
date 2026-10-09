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

  // Content pages
  async getContent(slug: string) {
    const response = await this.request<unknown>(`/content/${encodeURIComponent(slug)}`);
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

  // Requests - General (JSON)
  private async submitJsonRequest<T>(endpoint: string, data: T): Promise<unknown> {
    return this.request<unknown>(`/requests${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  }

  async submitCallback(data: { name: string; phone: string; consent?: boolean }) {
    return this.submitJsonRequest('/callback', { ...data, consent: data.consent ?? true });
  }

  async submitGeneralRequest(data: { name: string; phone: string; email: string; message: string; consent?: boolean }) {
    return this.submitJsonRequest('/general', { ...data, consent: data.consent ?? true });
  }

  async submitProductRequest(data: {
    name: string;
    phone: string;
    email: string;
    productId?: string;
    productName?: string;
    comment?: string;
    consent?: boolean;
  }) {
    return this.submitJsonRequest('/product', { ...data, consent: data.consent ?? true });
  }

  async submitCartRequest(data: {
    name: string;
    phone: string;
    email: string;
    items: Array<{ productId: number; productName: string; price: number; quantity: number }>;
    comment?: string;
    consent?: boolean;
  }) {
    return this.submitJsonRequest('/cart', { ...data, consent: data.consent ?? true });
  }

  async submitLeasingRequest(data: {
    name: string;
    phone: string;
    email: string;
    message?: string;
    consent?: boolean;
  }) {
    return this.submitJsonRequest('/leasing', { ...data, consent: data.consent ?? true });
  }

  async submitPriceInquiryRequest(data: {
    name: string;
    phone: string;
    email: string;
    productId?: string;
    productName?: string;
    comment?: string;
    consent?: boolean;
  }) {
    return this.submitJsonRequest('/price-inquiry', { ...data, consent: data.consent ?? true });
  }

  // Requests - Service (multipart/form-data for file uploads)
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
    photo?: File | null;
    consent?: boolean;
  }) {
    const formData = new FormData();
    formData.append('name', data.name);
    if (data.organization) formData.append('organization', data.organization);
    formData.append('phone', data.phone);
    formData.append('email', data.email);
    formData.append('equipmentType', data.equipmentType);
    formData.append('manufacturer', data.manufacturer);
    formData.append('model', data.model);
    if (data.serialNumber) formData.append('serialNumber', data.serialNumber);
    formData.append('problemDescription', data.problemDescription);
    formData.append('consent', String(data.consent ?? true));
    if (data.photo) {
      formData.append('photos', data.photo, data.photo.name);
    }

    return this.request<unknown>('/requests/service', {
      method: 'POST',
      body: formData,
    });
  }
}

export const apiClient = new ApiClient();
