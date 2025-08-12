// Shopify API client utilities
export interface ShopifyCustomer {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  addresses?: any[];
  ordersCount?: number;
}

export interface ShopifyOrder {
  id: string;
  customerId: string;
  orderNumber: string;
  totalPrice: string;
  currency: string;
  financialStatus: string;
  fulfillmentStatus: string;
  lineItems: any[];
}

export class ShopifyAPIClient {
  private baseUrl: string;
  private accessToken: string;

  constructor(storeUrl: string, accessToken: string) {
    this.baseUrl = `https://${storeUrl}`;
    this.accessToken = accessToken;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': this.accessToken,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Shopify API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  async getCustomer(customerId: string): Promise<ShopifyCustomer> {
    return this.request(`/admin/api/2023-10/customers/${customerId}.json`);
  }

  async getCustomers(limit = 50): Promise<ShopifyCustomer[]> {
    const response = await this.request(`/admin/api/2023-10/customers.json?limit=${limit}`);
    return response.customers;
  }

  async createCustomer(customer: Partial<ShopifyCustomer>): Promise<ShopifyCustomer> {
    return this.request('/admin/api/2023-10/customers.json', {
      method: 'POST',
      body: JSON.stringify({ customer }),
    });
  }

  async updateCustomer(customerId: string, customer: Partial<ShopifyCustomer>): Promise<ShopifyCustomer> {
    return this.request(`/admin/api/2023-10/customers/${customerId}.json`, {
      method: 'PUT',
      body: JSON.stringify({ customer }),
    });
  }

  async getCustomerOrders(customerId: string): Promise<ShopifyOrder[]> {
    const response = await this.request(`/admin/api/2023-10/customers/${customerId}/orders.json`);
    return response.orders;
  }
}

export function createShopifyClient(storeUrl: string, accessToken: string): ShopifyAPIClient {
  return new ShopifyAPIClient(storeUrl, accessToken);
}
