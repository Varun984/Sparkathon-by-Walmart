import { pgTable, serial, text, varchar, boolean, timestamp, integer, uuid, doublePrecision,  pgEnum, time } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

//so need to design the schemas here
//this is the prob statement
// Problem: Overstocking at one fulfillment center and stockouts at another leads to delays and inefficiencies.
// Idea: Build an AI-powered system that predicts demand spikes at a hyperlocal level and triggers real-time dynamic inventory reallocation between nearby stores and micro-fulfillment centers.
// Tech: Machine Learning (Time series forecasting), Real-time APIs, Cloud-based logistics management.

//so the main things will be like 

//enum for inventory threshold breach
export const inventoryEnum = pgEnum("inventory_threshold_enum", ["critical", "healthy", "warning"]); //breached->critical, not_breached->healthy, close_to_breach->warning
//1. inventory -> inventory id, items={}, location, volume occupied, volume available, volume reserved, name, description, created_at, updated_at, threshold, status
export const inventory = pgTable('inventory', {
    id: serial('id').primaryKey(),
    location: varchar('location', { length: 255 }).notNull(),
    volumeOccupied: doublePrecision('volume_occupied').notNull(),
    volumeAvailable: doublePrecision('volume_available').notNull(),
    volumeReserved: doublePrecision('volume_reserved').notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description').notNull(),
    threshold: integer('threshold').notNull(),
    locationId: integer("location_id")
        .notNull()
        .references(() => location.id, { onDelete: 'cascade' }),
    status: inventoryEnum('status').notNull().default('healthy'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().$onUpdateFn(() => new Date()),
});

//2. items -> item id, name, description, category, price, weight, dimensions, created_at, updated_at
export const items = pgTable("items", {
    item_id: serial("item_id").primaryKey(),
    name : varchar("name", { length: 255 }).notNull(),
    description : text("description").notNull(),
    // category : varchar("category", { length: 255 }).notNull(),
    price : doublePrecision("price").notNull(),
    weight : doublePrecision("weight").notNull(),
    dimensions : text("dimensions").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().$onUpdateFn(() => new Date()),
});

//enum for status -> pending, cannot_fulfill, fulfilled, cancelled
export const statusEnum = pgEnum("status_enum", ["pending", "cannot_fulfill", "fulfilled", "cancelled"]);

//3. triggermessage -> trigger message id, inventory_id, message, status, created_at
export const triggerMessage = pgTable("trigger_message", {
    triggerMessageId: serial("trigger_message_id").primaryKey(),
    inventoryId: integer("inventory_id")
        .notNull()
        .references(() => inventory.id, { onDelete: 'cascade' }),
    message: text("message").notNull(),
    status: statusEnum("status").notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

//schema for status in relocation message
export const relocationStatusEnum = pgEnum("relocation_status_enum", ["pending", "in_progress", "completed", "failed"]);

//4. relocation message -> relocation message id, item_id, from_inventory_id, to_inventory_id, status, updated_at
export const relocationMessage = pgTable("relocation_message", {
    relocationMessageId: serial("relocation_message_id").primaryKey(),
    itemId: integer("item_id")
        .notNull()
        .references(() => items.item_id, { onDelete: 'cascade' }),
    fromInventoryId: integer("from_inventory_id")
        .notNull()
        .references(() => inventory.id, { onDelete: 'cascade' }),
    toInventoryId: integer("to_inventory_id")
        .notNull()
        .references(() => inventory.id, { onDelete: 'cascade' }),
    quantity: integer("quantity").notNull(), 
    priority: varchar("priority", { length: 50 }).default("medium"),
    estimatedCompletionTime: timestamp("estimated_completion_time", { withTimezone: true }),
    status: relocationStatusEnum("status").notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(), 
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().$onUpdateFn(() => new Date()),
});

//5. forecasting metrics -> forecast_id, inventory_id, how_much_time_to_fill, predicted_demand, actual_demand, created_at, updated_at
export const forecastingMetrics = pgTable("forecasting_metrics", {
    forecastId: serial("forecast_id").primaryKey(),
    inventoryId: integer("inventory_id")
        .notNull()
        .references(() => inventory.id, { onDelete: 'cascade' }),
    howMuchTimeToFill: time("how_much_time_to_fill").notNull(),
    predictedDemand: doublePrecision("predicted_demand").notNull(),
    actualDemand: doublePrecision("actual_demand").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().$onUpdateFn(() => new Date()),
});

//6. admin -> admin_id, name, email, password, created_at, updated_at
export const admin = pgTable("admin", {
    admin_id : serial("admin_id").primaryKey(),
    name : varchar("name", { length: 255 }).notNull(),
    email : varchar("email", { length: 255 }).notNull().unique(),
    password : varchar("password", { length: 255 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().$onUpdateFn(() => new Date()),
});

//7. spike_monitoring -> spike_monitoring_id, inventory_id, created_at, updated_at
export const spikeMonitoring = pgTable("spike_monitoring", {
    spikeMonitoringId: serial("spike_monitoring_id").primaryKey(),
    inventoryId: integer("inventory_id")
        .notNull()
        .references(() => inventory.id, { onDelete: 'cascade' }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().$onUpdateFn(() => new Date()),
});

//8. location -> latitude, longitude, address, city, state, country, zip_code
export const location = pgTable("location", {
    id: serial("id").primaryKey(),
    latitude: doublePrecision("latitude").notNull(),
    longitude: doublePrecision("longitude").notNull(),
    address: varchar("address", { length: 255 }).notNull(),
    city: varchar("city", { length: 100 }).notNull(),
    state: varchar("state", { length: 100 }).notNull(),
    country: varchar("country", { length: 100 }).notNull(),
    zipCode: varchar("zip_code", { length: 10 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().$onUpdateFn(() => new Date()),
});

// 9. demand history -> demand_history_id, inventory_id, item_id, demand_quantity, timestamp, source
export const demandHistory = pgTable("demand_history", {
    id: serial("id").primaryKey(),
    inventoryId: integer("inventory_id")
        .notNull()
        .references(() => inventory.id, { onDelete: 'cascade' }),
    itemId: integer("item_id")
        .notNull()
        .references(() => items.item_id, { onDelete: 'cascade' }),
    demandQuantity: integer("demand_quantity").notNull(),
    timestamp: timestamp("timestamp", { withTimezone: true }).notNull(),
    source: varchar("source", { length: 100 }), // e.g., "order", "forecast", "manual"
});

// 10. real time alerts -> real_time_alerts_id, inventory_id, alert_type, severity, message, is_resolved, created_at, resolved_at
export const realTimeAlerts = pgTable("real_time_alerts", {
    id: serial("id").primaryKey(),
    inventoryId: integer("inventory_id")
        .notNull()
        .references(() => inventory.id, { onDelete: 'cascade' }),
    alertType: varchar("alert_type", { length: 100 }).notNull(), // "stockout", "overstock", "demand_spike"
    severity: varchar("severity", { length: 50 }).notNull(), // "low", "medium", "high", "critical"
    message: text("message").notNull(),
    isResolved: boolean("is_resolved").default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
});

export const dashbEnum = pgEnum("dashboard_metrics_enum", ["migrated", "reallocated", "cost_savings", "critical_alerts"]);
//11. adding dashoboard metrics t store and check daily
export const dashboardMetrics = pgTable("dashboard_metrics", {
    id: serial("id").primaryKey(),
    metricType: dashbEnum("metric_type").notNull(), 
    value: integer("value").notNull(),
    recordedAt: timestamp("recorded_at", { withTimezone: true }).defaultNow(),
    period: varchar("period", { length: 20 }).notNull().default("daily"), 
});

//now we need to integrate the items with inventory
export const inventoryItems = pgTable("inventory_items", {
    inventoryId: integer("inventory_id")
        .notNull()
        .references(() => inventory.id, { onDelete: 'cascade' }),
    itemId: integer("item_id")
        .notNull()
        .references(() => items.item_id, { onDelete: 'cascade' }),
    quantity: integer("quantity").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().$onUpdateFn(() => new Date()),
});

//the relations over here
export const inventoryRelations = relations(inventory, ({ many, one }) => ({
    items: many(inventoryItems),
    location: one(location, {
        fields: [inventory.locationId],
        references: [location.id],
    }),
    triggerMessages: many(triggerMessage),
    relocationMessages: many(relocationMessage),
    forecastingMetrics: many(forecastingMetrics),
    spikeMonitoring: many(spikeMonitoring),
}));

export const itemRelations = relations(items, ({ many }) => ({
    inventories: many(inventoryItems),
}));

export const inventoryItemRelations = relations(inventoryItems, ({ one }) => ({
    inventory: one(inventory, {
        fields: [inventoryItems.inventoryId],
        references: [inventory.id],
    }),
    item: one(items, {
        fields: [inventoryItems.itemId],
        references: [items.item_id],
    }),
}));

export const triggerMessageRelations = relations(triggerMessage, ({ one }) => ({
    inventory: one(inventory, {
        fields: [triggerMessage.inventoryId],
        references: [inventory.id],
    }),
}));

export const relocationMessageRelations = relations(relocationMessage, ({ one }) => ({
    fromInventory: one(inventory, {
        fields: [relocationMessage.fromInventoryId],
        references: [inventory.id],
    }),
    toInventory: one(inventory, {
        fields: [relocationMessage.toInventoryId],
        references: [inventory.id],
    }),
}));

export const forecastingMetricsRelations = relations(forecastingMetrics, ({ one }) => ({
    inventory: one(inventory, {
        fields: [forecastingMetrics.inventoryId],
        references: [inventory.id],
    }),

}));

export const adminRelations = relations(admin, ({ many }) => ({
    inventories: many(inventory),
}));

export const spikeMonitoringRelations = relations(spikeMonitoring, ({ one }) => ({
    inventory: one(inventory, {
        fields: [spikeMonitoring.inventoryId],
        references: [inventory.id],
    }),
}));

export const locationRelations = relations(location, ({ many }) => ({
    inventories: many(inventory),
}));

