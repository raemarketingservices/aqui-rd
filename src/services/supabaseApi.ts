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
  paymentMethods?: any;
  address?: string;
  rnc?: string;
  email?: string;
  userId?: string;
  user?: SupabaseUser;
  productCount?: number;
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
  vendor?: SupabaseVendor;
}

export interface SupabaseCategory {
  id: string;
  name: string;
  slug: string;
  image?: string;
  parent_id?: string;
  description?: string;
}

export interface SupabaseOrder {
  _id: string;
  orderNumber: string;
  userId: string;
  items: any[];
  totalAmount: number;
  status: string;
  shippingAddress: string;
  paymentMethod: string;
  notes?: string;
  _creationTime: number;
}

export interface SupabaseCart {
  _id: string;
  userId: string;
  items: any[];
  total: number;
}

export interface SupabaseReview {
  _id: string;
  vendorId: string;
  userId: string;
  rating: number;
  comment?: string;
  user?: SupabaseUser;
  createdAt: number;
}

export interface SupabaseTicket {
  _id: string;
  userId: string;
  vendorId?: string;
  subject: string;
  description: string;
  status: string;
  vendorName?: string;
  comments: any[];
  createdAt: number;
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

    updateProfile: (userId: string, data: { name?: string; phone?: string; avatar?: string }) =>
      apiCall<SupabaseUser>('/users/update-profile', {
        method: 'PUT',
        body: JSON.stringify({ userId, ...data }),
      }),

    changePassword: (userId: string, currentPassword: string, newPassword: string) =>
      apiCall<{ success: boolean }>('/users/change-password', {
        method: 'POST',
        body: JSON.stringify({ userId, currentPassword, newPassword }),
      }),
  },

  stores: {
    getAll: () =>
      apiCall<{ stores: any[] }>('/stores'),

    get: (id: string) =>
      apiCall<any>(`/stores/${id}`),
  },

  products: {
    getAll: (params?: { storeId?: string; search?: string; sort?: string; category?: string }) => {
      const q = new URLSearchParams();
      if (params?.storeId) q.set('storeId', params.storeId);
      if (params?.search) q.set('search', params.search);
      if (params?.sort) q.set('sort', params.sort);
      if (params?.category) q.set('category', params.category);
      const qs = q.toString();
      return apiCall<{ products: SupabaseProduct[] }>(`/products${qs ? '?' + qs : ''}`);
    },

    get: (id: string) =>
      apiCall<SupabaseProduct>(`/products/${id}`),

    create: (data: {
      vendorId: string;
      name: string;
      slug: string;
      description?: string;
      price: number;
      compareAtPrice?: number;
      stock: number;
      images: string[];
      categoryId?: string;
      whatsapp?: string;
      condition?: string;
      brand?: string;
      color?: string;
      sku?: string;
      tags?: string[];
      location?: string;
      availability?: string;
      videoUrl?: string;
    }) =>
      apiCall<{ product: SupabaseProduct }>('/products', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (productId: string, data: Partial<SupabaseProduct>) =>
      apiCall<SupabaseProduct>(`/products/${productId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    delete: (productId: string) =>
      apiCall<{ success: boolean }>(`/products/${productId}`, {
        method: 'DELETE',
      }),
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
      logo?: string;
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
      paymentMethods?: any;
      logo?: string;
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

    getAllVendors: () =>
      apiCall<{ vendors: SupabaseVendor[] }>('/admin/vendors'),

    getAllVendorsWithDetails: () =>
      apiCall<{ vendors: SupabaseVendor[] }>('/admin/vendors/details'),

    updateVendorStatus: (vendorId: string, status: string) =>
      apiCall<{ success: boolean }>(`/admin/vendors/${vendorId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      }),

    getAllUsers: () =>
      apiCall<{ users: any[] }>('/admin/users'),

    updateRole: (userId: string, role: string) =>
      apiCall<{ success: boolean }>(`/admin/users/${userId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role }),
      }),

    getDashboard: () =>
      apiCall<any>('/admin/dashboard'),

    getSiteSettings: () =>
      apiCall<any>('/admin/settings'),

    updateSiteSetting: (key: string, value: any) =>
      apiCall<{ success: boolean }>('/admin/settings', {
        method: 'PUT',
        body: JSON.stringify({ key, value }),
      }),

    getChatbotConfig: () =>
      apiCall<any>('/admin/chatbot/config'),

    updateChatbotConfig: (config: any) =>
      apiCall<{ success: boolean }>('/admin/chatbot/config', {
        method: 'PUT',
        body: JSON.stringify(config),
      }),

    getAllVendorsWithDetails2: () =>
      apiCall<{ vendors: any[] }>('/admin/vendors-with-details'),
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

  orders: {
    getUserOrders: (userId: string) =>
      apiCall<{ orders: SupabaseOrder[] }>(`/orders?userId=${userId}`),

    create: (data: {
      userId: string;
      shippingAddress: string;
      paymentMethod: string;
      notes?: string;
    }) =>
      apiCall<{ order: SupabaseOrder }>('/orders', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  cart: {
    getCart: (userId: string) =>
      apiCall<SupabaseCart>(`/cart?userId=${userId}`),

    updateQuantity: (cartItemId: string, quantity: number) =>
      apiCall<{ success: boolean }>(`/cart/${cartItemId}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity }),
      }),

    removeItem: (cartItemId: string) =>
      apiCall<{ success: boolean }>(`/cart/${cartItemId}`, {
        method: 'DELETE',
      }),

    addItem: (userId: string, productId: string, quantity: number) =>
      apiCall<{ success: boolean }>('/cart', {
        method: 'POST',
        body: JSON.stringify({ userId, productId, quantity }),
      }),
  },

  settings: {
    getTaxSettings: () =>
      apiCall<any[]>('/settings/taxes'),

    getProductFormConfig: () =>
      apiCall<any[]>('/settings/product-form'),
  },

  vendorReviews: {
    getVendorReviews: (vendorId: string) =>
      apiCall<{ reviews: SupabaseReview[] }>(`/vendor-reviews?vendorId=${vendorId}`),

    create: (data: { vendorId: string; userId: string; rating: number; comment?: string }) =>
      apiCall<{ review: SupabaseReview }>('/vendor-reviews', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  support: {
    getTickets: (userId: string) =>
      apiCall<{ tickets: SupabaseTicket[] }>(`/support/tickets?userId=${userId}`),

    createTicket: (data: { userId: string; subject: string; description: string }) =>
      apiCall<{ ticket: SupabaseTicket }>('/support/tickets', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    updateTicketStatus: (ticketId: string, userId: string, status: string) =>
      apiCall<{ success: boolean }>(`/support/tickets/${ticketId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ userId, status }),
      }),

    addTicketComment: (data: { ticketId: string; senderId: string; text: string }) =>
      apiCall<{ success: boolean }>('/support/tickets/comments', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  landing: {
    getAll: () =>
      apiCall<any[]>('/landing'),

    upsert: (data: { section: string; key: string; value: string }) =>
      apiCall<{ success: boolean }>('/landing', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  crm: {
    getConversations: (params?: { platform?: string; status?: string }) => {
      const q = new URLSearchParams();
      if (params?.platform) q.set('platform', params.platform);
      if (params?.status) q.set('status', params.status);
      return apiCall<{ conversations: any[] }>(`/crm/conversations${q.toString() ? '?' + q.toString() : ''}`);
    },

    getMessages: (conversationId: string) =>
      apiCall<{ messages: any[] }>(`/crm/conversations/${conversationId}/messages`),

    getAllSettings: () =>
      apiCall<any[]>('/crm/settings'),

    setSetting: (key: string, value: string) =>
      apiCall<{ success: boolean }>('/crm/settings', {
        method: 'PUT',
        body: JSON.stringify({ key, value }),
      }),

    getAutoResponses: () =>
      apiCall<any[]>('/crm/auto-responses'),

    createAutoResponse: (data: { trigger: string; response: string; isActive: boolean; priority: number; platform: string }) =>
      apiCall<any>('/crm/auto-responses', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    updateAutoResponse: (data: { id: string; isActive?: boolean }) =>
      apiCall<{ success: boolean }>(`/crm/auto-responses/${data.id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    deleteAutoResponse: (id: string) =>
      apiCall<{ success: boolean }>(`/crm/auto-responses/${id}`, {
        method: 'DELETE',
      }),

    getFAQs: () =>
      apiCall<any[]>('/crm/faqs'),

    createFAQ: (data: { question: string; answer: string; keywords: string[]; isActive: boolean }) =>
      apiCall<any>('/crm/faqs', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    updateFAQ: (data: { id: string; isActive?: boolean }) =>
      apiCall<{ success: boolean }>(`/crm/faqs/${data.id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    deleteFAQ: (id: string) =>
      apiCall<{ success: boolean }>(`/crm/faqs/${id}`, {
        method: 'DELETE',
      }),

    markAsRead: (conversationId: string) =>
      apiCall<{ success: boolean }>(`/crm/conversations/${conversationId}/read`, {
        method: 'PUT',
      }),

    updateConversationStatus: (conversationId: string, status: string) =>
      apiCall<{ success: boolean }>(`/crm/conversations/${conversationId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      }),

    seedCRMSettings: () =>
      apiCall<{ success: boolean }>('/crm/seed', {
        method: 'POST',
      }),
  },

  facebook: {
    scrapeAndImport: (vendorId: string, urls: string[]) =>
      apiCall<{ results: any[]; created: number }>('/facebook/import', {
        method: 'POST',
        body: JSON.stringify({ vendorId, urls }),
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