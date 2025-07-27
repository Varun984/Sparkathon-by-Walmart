import { pgTable, unique, serial, varchar, timestamp, text, doublePrecision, foreignKey, integer, time, boolean, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const dashboardMetricsEnum = pgEnum("dashboard_metrics_enum", ['migrated', 'reallocated', 'cost_savings', 'critical_alerts'])
export const inventoryThresholdEnum = pgEnum("inventory_threshold_enum", ['critical', 'healthy', 'warning'])
export const relocationStatusEnum = pgEnum("relocation_status_enum", ['pending', 'in_progress', 'completed', 'failed'])
export const statusEnum = pgEnum("status_enum", ['pending', 'cannot_fulfill', 'fulfilled', 'cancelled'])


export const admin = pgTable("admin", {
	adminId: serial("admin_id").primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 255 }).notNull(),
	password: varchar({ length: 255 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	unique("admin_email_unique").on(table.email),
]);

export const items = pgTable("items", {
	itemId: serial("item_id").primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text().notNull(),
	price: doublePrecision().notNull(),
	weight: doublePrecision().notNull(),
	dimensions: text().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const forecastingMetrics = pgTable("forecasting_metrics", {
	forecastId: serial("forecast_id").primaryKey().notNull(),
	inventoryId: integer("inventory_id").notNull(),
	howMuchTimeToFill: time("how_much_time_to_fill").notNull(),
	predictedDemand: doublePrecision("predicted_demand").notNull(),
	actualDemand: doublePrecision("actual_demand").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.inventoryId],
			foreignColumns: [inventory.id],
			name: "forecasting_metrics_inventory_id_inventory_id_fk"
		}).onDelete("cascade"),
]);

export const inventoryItems = pgTable("inventory_items", {
	inventoryId: integer("inventory_id").notNull(),
	itemId: integer("item_id").notNull(),
	quantity: integer().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.inventoryId],
			foreignColumns: [inventory.id],
			name: "inventory_items_inventory_id_inventory_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.itemId],
			foreignColumns: [items.itemId],
			name: "inventory_items_item_id_items_item_id_fk"
		}).onDelete("cascade"),
]);

export const relocationMessage = pgTable("relocation_message", {
	relocationMessageId: serial("relocation_message_id").primaryKey().notNull(),
	itemId: integer("item_id").notNull(),
	fromInventoryId: integer("from_inventory_id").notNull(),
	toInventoryId: integer("to_inventory_id").notNull(),
	quantity: integer().notNull(),
	priority: varchar({ length: 50 }).default('medium'),
	estimatedCompletionTime: timestamp("estimated_completion_time", { withTimezone: true, mode: 'string' }),
	status: relocationStatusEnum().default('pending').notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.itemId],
			foreignColumns: [items.itemId],
			name: "relocation_message_item_id_items_item_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.fromInventoryId],
			foreignColumns: [inventory.id],
			name: "relocation_message_from_inventory_id_inventory_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.toInventoryId],
			foreignColumns: [inventory.id],
			name: "relocation_message_to_inventory_id_inventory_id_fk"
		}).onDelete("cascade"),
]);

export const location = pgTable("location", {
	id: serial().primaryKey().notNull(),
	latitude: doublePrecision().notNull(),
	longitude: doublePrecision().notNull(),
	address: varchar({ length: 255 }).notNull(),
	city: varchar({ length: 100 }).notNull(),
	state: varchar({ length: 100 }).notNull(),
	country: varchar({ length: 100 }).notNull(),
	zipCode: varchar("zip_code", { length: 10 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const realTimeAlerts = pgTable("real_time_alerts", {
	id: serial().primaryKey().notNull(),
	inventoryId: integer("inventory_id").notNull(),
	alertType: varchar("alert_type", { length: 100 }).notNull(),
	severity: varchar({ length: 50 }).notNull(),
	message: text().notNull(),
	isResolved: boolean("is_resolved").default(false),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	resolvedAt: timestamp("resolved_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.inventoryId],
			foreignColumns: [inventory.id],
			name: "real_time_alerts_inventory_id_inventory_id_fk"
		}).onDelete("cascade"),
]);

export const spikeMonitoring = pgTable("spike_monitoring", {
	spikeMonitoringId: serial("spike_monitoring_id").primaryKey().notNull(),
	inventoryId: integer("inventory_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.inventoryId],
			foreignColumns: [inventory.id],
			name: "spike_monitoring_inventory_id_inventory_id_fk"
		}).onDelete("cascade"),
]);

export const inventory = pgTable("inventory", {
	id: serial().primaryKey().notNull(),
	location: varchar({ length: 255 }).notNull(),
	volumeOccupied: doublePrecision("volume_occupied").notNull(),
	volumeAvailable: doublePrecision("volume_available").notNull(),
	volumeReserved: doublePrecision("volume_reserved").notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text().notNull(),
	threshold: integer().notNull(),
	locationId: integer("location_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	status: inventoryThresholdEnum().default('healthy').notNull(),
}, (table) => [
	foreignKey({
			columns: [table.locationId],
			foreignColumns: [location.id],
			name: "inventory_location_id_location_id_fk"
		}).onDelete("cascade"),
]);

export const demandHistory = pgTable("demand_history", {
	id: serial().primaryKey().notNull(),
	inventoryId: integer("inventory_id").notNull(),
	itemId: integer("item_id").notNull(),
	demandQuantity: integer("demand_quantity").notNull(),
	timestamp: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
	source: varchar({ length: 100 }),
}, (table) => [
	foreignKey({
			columns: [table.inventoryId],
			foreignColumns: [inventory.id],
			name: "demand_history_inventory_id_inventory_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.itemId],
			foreignColumns: [items.itemId],
			name: "demand_history_item_id_items_item_id_fk"
		}).onDelete("cascade"),
]);

export const triggerMessage = pgTable("trigger_message", {
	triggerMessageId: serial("trigger_message_id").primaryKey().notNull(),
	inventoryId: integer("inventory_id").notNull(),
	message: text().notNull(),
	status: statusEnum().default('pending').notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.inventoryId],
			foreignColumns: [inventory.id],
			name: "trigger_message_inventory_id_inventory_id_fk"
		}).onDelete("cascade"),
]);

export const dashboardMetrics = pgTable("dashboard_metrics", {
	id: serial().primaryKey().notNull(),
	metricType: dashboardMetricsEnum("metric_type").notNull(),
	value: integer().notNull(),
	recordedAt: timestamp("recorded_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	period: varchar({ length: 20 }).default('daily').notNull(),
});
