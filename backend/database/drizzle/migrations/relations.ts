import { relations } from "drizzle-orm/relations";
import { inventory, forecastingMetrics, inventoryItems, items, relocationMessage, realTimeAlerts, spikeMonitoring, location, demandHistory, triggerMessage } from "./schema";

export const forecastingMetricsRelations = relations(forecastingMetrics, ({one}) => ({
	inventory: one(inventory, {
		fields: [forecastingMetrics.inventoryId],
		references: [inventory.id]
	}),
}));

export const inventoryRelations = relations(inventory, ({one, many}) => ({
	forecastingMetrics: many(forecastingMetrics),
	inventoryItems: many(inventoryItems),
	relocationMessages_fromInventoryId: many(relocationMessage, {
		relationName: "relocationMessage_fromInventoryId_inventory_id"
	}),
	relocationMessages_toInventoryId: many(relocationMessage, {
		relationName: "relocationMessage_toInventoryId_inventory_id"
	}),
	realTimeAlerts: many(realTimeAlerts),
	spikeMonitorings: many(spikeMonitoring),
	location: one(location, {
		fields: [inventory.locationId],
		references: [location.id]
	}),
	demandHistories: many(demandHistory),
	triggerMessages: many(triggerMessage),
}));

export const inventoryItemsRelations = relations(inventoryItems, ({one}) => ({
	inventory: one(inventory, {
		fields: [inventoryItems.inventoryId],
		references: [inventory.id]
	}),
	item: one(items, {
		fields: [inventoryItems.itemId],
		references: [items.itemId]
	}),
}));

export const itemsRelations = relations(items, ({many}) => ({
	inventoryItems: many(inventoryItems),
	relocationMessages: many(relocationMessage),
	demandHistories: many(demandHistory),
}));

export const relocationMessageRelations = relations(relocationMessage, ({one}) => ({
	item: one(items, {
		fields: [relocationMessage.itemId],
		references: [items.itemId]
	}),
	inventory_fromInventoryId: one(inventory, {
		fields: [relocationMessage.fromInventoryId],
		references: [inventory.id],
		relationName: "relocationMessage_fromInventoryId_inventory_id"
	}),
	inventory_toInventoryId: one(inventory, {
		fields: [relocationMessage.toInventoryId],
		references: [inventory.id],
		relationName: "relocationMessage_toInventoryId_inventory_id"
	}),
}));

export const realTimeAlertsRelations = relations(realTimeAlerts, ({one}) => ({
	inventory: one(inventory, {
		fields: [realTimeAlerts.inventoryId],
		references: [inventory.id]
	}),
}));

export const spikeMonitoringRelations = relations(spikeMonitoring, ({one}) => ({
	inventory: one(inventory, {
		fields: [spikeMonitoring.inventoryId],
		references: [inventory.id]
	}),
}));

export const locationRelations = relations(location, ({many}) => ({
	inventories: many(inventory),
}));

export const demandHistoryRelations = relations(demandHistory, ({one}) => ({
	inventory: one(inventory, {
		fields: [demandHistory.inventoryId],
		references: [inventory.id]
	}),
	item: one(items, {
		fields: [demandHistory.itemId],
		references: [items.itemId]
	}),
}));

export const triggerMessageRelations = relations(triggerMessage, ({one}) => ({
	inventory: one(inventory, {
		fields: [triggerMessage.inventoryId],
		references: [inventory.id]
	}),
}));