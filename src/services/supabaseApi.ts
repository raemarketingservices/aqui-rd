const API_BASE = import.meta.env.VITE_API_URL || 'https://aqui-rd-api.aqui-rd.workers.dev';

export interface SupabaseUser {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  avatar?: string;
  vendorId?: string;
  vendor?: SupabaseVendor;
}

export interface SupabaseVendor {
  id: string;
  businessName: string;
  slug: string;
  description: string;
  logo?: string;
  rating: number;
  totalSales: number;
  status: string;
  whatsapp?: string;
  socials?: any;
  paymentMethods?: string;
  address?: string;
  rnc?: string;
  email?: string;
}

export interface SupabaseProduct {
  id: string;
  vendor_id: string;
  name: string;
  slug: string;
  description: string;
  price: number; // in cents
  compare_at_price: number;
  images: string[];
  category_id: string;
  stock: number;
  status: string;
  rating: number;
  review_count: number;
  sales_count: number;
  whatsapp?: string;
  condition?: string;
  brand?: string;
  color?: string;
  sku?: string;
  tags?: string[];
  location?: string;
  availability?: string;
  video_url?: string;
  created_at: number;
}

export interface SupabaseCategory {
  id: string;
  name: string;
  slug: string;
  image?: string;
  parent_id?: string;
  description?: string;
}

async function apiCall<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('uniko_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const resp = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!resp.ok) {
    const error = await resp.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(error.error || `API error ${resp.status}`);
  }

  return resp.json();
}

export const supabaseApi = {
  auth: {
    login: (email: string, password: string) =>
      apiCall<{ token: string; user: SupabaseUser; vendor: SupabaseVendor | null }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),

    register: (name: string, email: string, password: string, role?: string) =>
      apiCall<{ token: string; user: SupabaseUser }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, role }),
      }),

    getMe: (userId: string) =>
      apiCall<SupabaseUser>(`/vendor/profile`, {
        method: 'GET',
      }),
  },

  stores: {
    getAll: () =>
      apiCall<{ stores: any[] }>('/stores'),

    get: (id: string) =>
      apiCall<any>(`/stores/${id}`),
  },

  products: {
    getAll: (params?: { storeId?: string; search?: string; sort?: string }) => {
      const q = new URLSearchParams();
      if (params?.storeId) q.set('storeId', params.storeId);
      if (params?.search) q.set('search', params.search);
      if (params?.sort) q.set('sort', params.sort);
      const qs = q.toString();
      return apiCall<{ products: SupabaseProduct[] }>(`/products${qs ? '?' + qs : ''}`);
    },

    get: (id: string) =>
      apiCall<SupabaseProduct>(`/products/${id}`),
  },

  categories: {
    getAll: () =>
      apiCall<{ categories: SupabaseCategory[] }>('/categories'),
  },

  vendor: {
    register: (data: {
      userId: string;
      businessName: string;
      description?: string;
      whatsapp?: string;
      email?: string;
      address?: string;
      rnc?: string;
      paymentMethods?: string;
      logo?: string
    }) =>
      apiCall<{ success: boolean; vendor: any; message: string }>('/vendor/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (data: {
      vendorId: string;
      businessName?: string;
      description?: string;
      whatsapp?: string;
      email?: string;
      address?: string;
      rnc?: string;
      paymentMethods?: string;
      logo?: string
    }) =>
      apiCall<{ success: boolean; message: string }>('/vendor/update', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    getProducts: (vendorId: string) =>
      apiCall<{ products: SupabaseProduct[] }>(`/vendor/products?vendorId=${vendorId}`),

    createProduct: (data: {
      vendorId: string;
      name: string;
      description?: string;
      price: number;
      compareAtPrice?: number;
      images?: string[];
      categoryId?: string;
      stock?: number;
      whatsapp?: string;
    }) =>
      apiCall<{ success: boolean; product: any }>('/vendor/products', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    inbox: (vendorId: string) =>
      apiCall<{ messages: any[] }>(`/vendor/inbox?vendorId=${vendorId}`),

    replyInbox: (data: { vendorId: string; customerId: string; customerName: string; message: string }) =>
      apiCall<{ success: boolean }>('/vendor/inbox/reply', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  admin: {
    metrics: () =>
      apiCall<any>('/admin/metrics'),

    vendorRequests: () =>
      apiCall<{ requests: any[] }>('/admin/vendor-requests'),

    approveVendor: (id: string) =>
      apiCall<{ success: boolean }>(`/admin/vendor-requests/${id}/approve`, {
        method: 'PUT',
      }),

    rejectVendor: (id: string) =>
      apiCall<{ success: boolean }>(`/admin/vendor-requests/${id}/reject`, {
        method: 'PUT',
      }),
  },

  banners: {
    getAll: () =>
      apiCall<{ banners: any[] }>('/banners'),
  },

  chat: {
    send: (message: string, userId?: string) =>
      apiCall<{ reply: string; quickActions: string[] }>('/chat', {
        method: 'POST',
        body: JSON.stringify({ message, userId }),
      }),

    storeChat: (storeId: string, message: string, productName?: string, userName?: string) =>
      apiCall<{ reply: string; quickActions: string[]; storeName: string }>(`/chat/store/${storeId}`, {
        method: 'POST',
        body: JSON.stringify({ message, productName, userName }),
      }),
  },
};

export function setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem('uniko_token', token);
  } else {
    localStorage.removeItem('uniko_token');
  }
}

export function getAuthToken(): string | null {
  return localStorage.getItem('uniko_token');
}