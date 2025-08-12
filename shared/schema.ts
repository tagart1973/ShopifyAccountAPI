import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const customers = pgTable("customers", {
  id: varchar("id").primaryKey(),
  shopifyId: text("shopify_id").notNull().unique(),
  email: text("email").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  phone: text("phone"),
  addresses: jsonb("addresses").default([]),
  ordersCount: integer("orders_count").default(0),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const orders = pgTable("orders", {
  id: varchar("id").primaryKey(),
  shopifyId: text("shopify_id").notNull().unique(),
  customerId: text("customer_id").references(() => customers.id),
  orderNumber: text("order_number"),
  totalPrice: text("total_price"),
  currency: text("currency"),
  financialStatus: text("financial_status"),
  fulfillmentStatus: text("fulfillment_status"),
  lineItems: jsonb("line_items").default([]),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const webhooks = pgTable("webhooks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  event: text("event").notNull(),
  endpoint: text("endpoint").notNull(),
  isActive: boolean("is_active").default(true),
  lastTriggered: timestamp("last_triggered"),
  successRate: text("success_rate").default("100%"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const apiLogs = pgTable("api_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  method: text("method").notNull(),
  endpoint: text("endpoint").notNull(),
  statusCode: integer("status_code").notNull(),
  responseTime: integer("response_time"),
  level: text("level").notNull(),
  message: text("message"),
  timestamp: timestamp("timestamp").default(sql`now()`),
});

export const configuration = pgTable("configuration", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  encrypted: boolean("encrypted").default(false),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
});

export const insertWebhookSchema = createInsertSchema(webhooks).omit({
  id: true,
  createdAt: true,
  lastTriggered: true,
});

export const insertApiLogSchema = createInsertSchema(apiLogs).omit({
  id: true,
  timestamp: true,
});

export const insertConfigurationSchema = createInsertSchema(configuration).omit({
  id: true,
  updatedAt: true,
});

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Webhook = typeof webhooks.$inferSelect;
export type InsertWebhook = z.infer<typeof insertWebhookSchema>;
export type ApiLog = typeof apiLogs.$inferSelect;
export type InsertApiLog = z.infer<typeof insertApiLogSchema>;
export type Configuration = typeof configuration.$inferSelect;
export type InsertConfiguration = z.infer<typeof insertConfigurationSchema>;
