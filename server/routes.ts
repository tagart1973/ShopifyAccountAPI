import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import { insertCustomerSchema, insertOrderSchema, insertWebhookSchema, insertApiLogSchema, insertConfigurationSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Middleware to log API calls
  app.use("/api", async (req, res, next) => {
    const start = Date.now();
    
    res.on('finish', async () => {
      const duration = Date.now() - start;
      await storage.createApiLog({
        method: req.method,
        endpoint: req.path,
        statusCode: res.statusCode,
        responseTime: duration,
        level: res.statusCode >= 400 ? "ERROR" : "INFO",
        message: `${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`
      });
    });
    
    next();
  });

  // Stats endpoint
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Customer endpoints
  app.get("/api/customers", async (req, res) => {
    try {
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  app.get("/api/customers/:id", async (req, res) => {
    try {
      const customer = await storage.getCustomer(req.params.id);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customer" });
    }
  });

  app.post("/api/customers", async (req, res) => {
    try {
      const customerData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(customerData);
      res.status(201).json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid customer data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create customer" });
    }
  });

  app.put("/api/customers/:id", async (req, res) => {
    try {
      const updateData = insertCustomerSchema.partial().parse(req.body);
      const customer = await storage.updateCustomer(req.params.id, updateData);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid customer data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update customer" });
    }
  });

  // Orders endpoints
  app.get("/api/orders", async (req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/customers/:id/orders", async (req, res) => {
    try {
      const orders = await storage.getOrdersByCustomerId(req.params.id);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customer orders" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(orderData);
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid order data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  // Webhook endpoints
  app.get("/api/webhooks", async (req, res) => {
    try {
      const webhooks = await storage.getWebhooks();
      res.json(webhooks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch webhooks" });
    }
  });

  app.post("/api/webhooks", async (req, res) => {
    try {
      const webhookData = insertWebhookSchema.parse(req.body);
      const webhook = await storage.createWebhook(webhookData);
      res.status(201).json(webhook);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid webhook data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create webhook" });
    }
  });

  app.put("/api/webhooks/:id", async (req, res) => {
    try {
      const updateData = insertWebhookSchema.partial().parse(req.body);
      const webhook = await storage.updateWebhook(req.params.id, updateData);
      if (!webhook) {
        return res.status(404).json({ message: "Webhook not found" });
      }
      res.json(webhook);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid webhook data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update webhook" });
    }
  });

  app.delete("/api/webhooks/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteWebhook(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Webhook not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete webhook" });
    }
  });

  // Webhook endpoints (for receiving webhooks)
  app.post("/webhooks/customer-created", async (req, res) => {
    try {
      // Process customer created webhook
      console.log("Customer created webhook received:", req.body);
      res.status(200).json({ message: "Webhook processed successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to process webhook" });
    }
  });

  app.post("/webhooks/order-placed", async (req, res) => {
    try {
      // Process order placed webhook
      console.log("Order placed webhook received:", req.body);
      res.status(200).json({ message: "Webhook processed successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to process webhook" });
    }
  });

  app.post("/webhooks/customer-updated", async (req, res) => {
    try {
      // Process customer updated webhook
      console.log("Customer updated webhook received:", req.body);
      res.status(200).json({ message: "Webhook processed successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to process webhook" });
    }
  });

  // Configuration endpoints
  app.get("/api/configuration", async (req, res) => {
    try {
      const config = await storage.getConfiguration();
      // Don't send encrypted values to frontend
      const safeConfig = config.map(c => ({
        ...c,
        value: c.encrypted ? "••••••••••••••••" : c.value
      }));
      res.json(safeConfig);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch configuration" });
    }
  });

  app.put("/api/configuration", async (req, res) => {
    try {
      const configData = insertConfigurationSchema.parse(req.body);
      const config = await storage.setConfiguration(configData);
      res.json({
        ...config,
        value: config.encrypted ? "••••••••••••••••" : config.value
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid configuration data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update configuration" });
    }
  });

  // Logs endpoints
  app.get("/api/logs", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const logs = await storage.getApiLogs(limit);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch logs" });
    }
  });

  // API Explorer endpoint - generic request handler
  app.all("/api/explorer/*", async (req, res) => {
    try {
      const endpoint = req.path.replace("/api/explorer", "");
      
      // This is a mock response for the API explorer
      const mockResponse = {
        customer: {
          id: "gid://shopify/Customer/123456789",
          email: "customer@example.com", 
          firstName: "John",
          lastName: "Doe",
          phone: "+1234567890",
          addresses: [
            {
              id: "gid://shopify/MailingAddress/987654321",
              address1: "123 Main St",
              city: "New York",
              province: "NY", 
              zip: "10001",
              country: "United States"
            }
          ],
          orders: {
            totalCount: 5,
            edges: []
          }
        }
      };

      res.json(mockResponse);
    } catch (error) {
      res.status(500).json({ message: "Explorer request failed" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
