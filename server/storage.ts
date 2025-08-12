import { type Customer, type InsertCustomer, type Order, type InsertOrder, type Webhook, type InsertWebhook, type ApiLog, type InsertApiLog, type Configuration, type InsertConfiguration } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Customers
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: string): Promise<Customer | undefined>;
  getCustomerByShopifyId(shopifyId: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: string, customer: Partial<InsertCustomer>): Promise<Customer | undefined>;
  
  // Orders
  getOrders(): Promise<Order[]>;
  getOrdersByCustomerId(customerId: string): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  
  // Webhooks
  getWebhooks(): Promise<Webhook[]>;
  getWebhook(id: string): Promise<Webhook | undefined>;
  createWebhook(webhook: InsertWebhook): Promise<Webhook>;
  updateWebhook(id: string, webhook: Partial<InsertWebhook>): Promise<Webhook | undefined>;
  deleteWebhook(id: string): Promise<boolean>;
  
  // API Logs
  getApiLogs(limit?: number): Promise<ApiLog[]>;
  createApiLog(log: InsertApiLog): Promise<ApiLog>;
  
  // Configuration
  getConfiguration(): Promise<Configuration[]>;
  getConfigurationByKey(key: string): Promise<Configuration | undefined>;
  setConfiguration(config: InsertConfiguration): Promise<Configuration>;
  
  // Stats
  getStats(): Promise<{
    apiRequests: number;
    activeWebhooks: number;
    cacheHitRate: string;
    avgResponseTime: string;
  }>;
}

export class MemStorage implements IStorage {
  private customers: Map<string, Customer> = new Map();
  private orders: Map<string, Order> = new Map();
  private webhooks: Map<string, Webhook> = new Map();
  private apiLogs: ApiLog[] = [];
  private configuration: Map<string, Configuration> = new Map();

  constructor() {
    // Initialize with some default configuration
    this.setConfiguration({
      key: "SHOPIFY_STORE_URL",
      value: "your-store.myshopify.com",
      encrypted: false
    });
    this.setConfiguration({
      key: "SHOPIFY_ACCESS_TOKEN", 
      value: "",
      encrypted: true
    });
    this.setConfiguration({
      key: "REDIS_URL",
      value: "redis://localhost:6379",
      encrypted: false
    });
    this.setConfiguration({
      key: "PORT",
      value: "5000",
      encrypted: false
    });
    this.setConfiguration({
      key: "ENABLE_RATE_LIMITING",
      value: "true",
      encrypted: false
    });
    this.setConfiguration({
      key: "RATE_LIMIT_RPM",
      value: "100",
      encrypted: false
    });
    this.setConfiguration({
      key: "ENABLE_CACHING",
      value: "true", 
      encrypted: false
    });
    this.setConfiguration({
      key: "CACHE_TTL",
      value: "300",
      encrypted: false
    });
    this.setConfiguration({
      key: "ENABLE_REQUEST_LOGGING",
      value: "true",
      encrypted: false
    });

    // Initialize some sample webhooks
    this.createWebhook({
      name: "Customer Created",
      event: "customers/create",
      endpoint: "/webhooks/customer-created",
      isActive: true,
      successRate: "98.5%"
    });
    this.createWebhook({
      name: "Order Placed", 
      event: "orders/create",
      endpoint: "/webhooks/order-placed",
      isActive: true,
      successRate: "100%"
    });
    this.createWebhook({
      name: "Customer Updated",
      event: "customers/update", 
      endpoint: "/webhooks/customer-updated",
      isActive: false,
      successRate: "94.2%"
    });
  }

  async getCustomers(): Promise<Customer[]> {
    return Array.from(this.customers.values());
  }

  async getCustomer(id: string): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async getCustomerByShopifyId(shopifyId: string): Promise<Customer | undefined> {
    return Array.from(this.customers.values()).find(c => c.shopifyId === shopifyId);
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const id = randomUUID();
    const customer: Customer = {
      ...insertCustomer,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.customers.set(id, customer);
    return customer;
  }

  async updateCustomer(id: string, updateData: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const customer = this.customers.get(id);
    if (!customer) return undefined;
    
    const updated = { ...customer, ...updateData, updatedAt: new Date() };
    this.customers.set(id, updated);
    return updated;
  }

  async getOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async getOrdersByCustomerId(customerId: string): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(o => o.customerId === customerId);
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = randomUUID();
    const order: Order = {
      ...insertOrder,
      id,
      createdAt: new Date()
    };
    this.orders.set(id, order);
    return order;
  }

  async getWebhooks(): Promise<Webhook[]> {
    return Array.from(this.webhooks.values());
  }

  async getWebhook(id: string): Promise<Webhook | undefined> {
    return this.webhooks.get(id);
  }

  async createWebhook(insertWebhook: InsertWebhook): Promise<Webhook> {
    const id = randomUUID();
    const webhook: Webhook = {
      ...insertWebhook,
      id,
      createdAt: new Date(),
      lastTriggered: null
    };
    this.webhooks.set(id, webhook);
    return webhook;
  }

  async updateWebhook(id: string, updateData: Partial<InsertWebhook>): Promise<Webhook | undefined> {
    const webhook = this.webhooks.get(id);
    if (!webhook) return undefined;
    
    const updated = { ...webhook, ...updateData };
    this.webhooks.set(id, updated);
    return updated;
  }

  async deleteWebhook(id: string): Promise<boolean> {
    return this.webhooks.delete(id);
  }

  async getApiLogs(limit = 50): Promise<ApiLog[]> {
    return this.apiLogs
      .sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0))
      .slice(0, limit);
  }

  async createApiLog(insertLog: InsertApiLog): Promise<ApiLog> {
    const id = randomUUID();
    const log: ApiLog = {
      ...insertLog,
      id,
      timestamp: new Date()
    };
    this.apiLogs.push(log);
    
    // Keep only last 1000 logs
    if (this.apiLogs.length > 1000) {
      this.apiLogs = this.apiLogs.slice(-1000);
    }
    
    return log;
  }

  async getConfiguration(): Promise<Configuration[]> {
    return Array.from(this.configuration.values());
  }

  async getConfigurationByKey(key: string): Promise<Configuration | undefined> {
    return this.configuration.get(key);
  }

  async setConfiguration(insertConfig: InsertConfiguration): Promise<Configuration> {
    const existing = this.configuration.get(insertConfig.key);
    const id = existing?.id || randomUUID();
    
    const config: Configuration = {
      ...insertConfig,
      id,
      updatedAt: new Date()
    };
    
    this.configuration.set(insertConfig.key, config);
    return config;
  }

  async getStats(): Promise<{
    apiRequests: number;
    activeWebhooks: number;
    cacheHitRate: string;
    avgResponseTime: string;
  }> {
    const activeWebhooks = Array.from(this.webhooks.values()).filter(w => w.isActive).length;
    const apiRequests = this.apiLogs.length;
    
    return {
      apiRequests,
      activeWebhooks,
      cacheHitRate: "94.2%",
      avgResponseTime: "142ms"
    };
  }
}

export const storage = new MemStorage();
