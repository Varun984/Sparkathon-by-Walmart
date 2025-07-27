import db from "./connect.js";
import { 
    inventory, 
    items, 
    triggerMessage, 
    relocationMessage, 
    forecastingMetrics, 
    admin, 
    spikeMonitoring, 
    location, 
    inventoryItems,
    demandHistory,
    realTimeAlerts,
    dashboardMetrics
} from './schema.js';
import {eq, and, or, inArray, asc, desc, gte} from 'drizzle-orm';

//inventory ops
export const inventory_ops = {

    //creating the inventory
    async create(data){
        try{
            const result = await db.insert(inventory).values(data).returning();
            return {success: true, data: result};
        }catch(err) {
            return {success: false, error: err.message};
        }
    },

    //getting all inventories
    async getAll(){
        try{
            const result = await db.select().from(inventory);
            return {success: true, data: result};
        }catch(err) {
            return {success: false, error: err.message};
        }
    },

    //getting inventory by id
    async getById(id){
        try{
            const result = await db.select().from(inventory).where(eq(inventory.id, id));
            return {success: true, data: result};
        }catch(err) {
            return {success: false, error: err.message};
        }
    },

    //updating inventory by id
    async updateById(id, data){
        try{
            const result = await db.update(inventory).set(data).where(eq(inventory.id, id)).returning();
            return {success: true, data: result};
        }catch(err) {
            return {success: false, error: err.message};
        }
    },
    
    //deleting inventory by id
    async deleteById(id){
        try{
            const result = await db.delete(inventory).where(eq(inventory.id, id)).returning();
            return {success: true, data: result};
        }catch(err) {
            return {success: false, error: err.message};
        }
    },

    //get inventory by location
    async getByLocation(locationId){
        try{
            const result = await db.select().from(inventory).where(eq(inventory.locationId, locationId));
            return {success: true, data: result};
        }catch(err) {
            return {success: false, error: err.message};
        }
    },

    //get inventories by status
    async getByStatus(status){
        try{
            const result = await db.select().from(inventory).where(eq(inventory.status, status));
            return {success: true, data: result};
        }catch(err) {
            return {success: false, error: err.message};
        }
    }
};

//item ops
export const item_ops = {

    //create an item
    async create(data){
        try{
            const result = await db.insert(items).values(data).returning();
            return {success: true, data: result};
        }catch(err) {
            return {success: false, error: err.message};
        }
    },

    //get all items
    async getAll(){
        try{
            const result = await db.select().from(items);
            return {success: true, data: result};
        }catch(err) {
            return {success: false, error: err.message};
        }
    },

    //get item by id
    async getById(id){
        try{
            const result = await db.select().from(items).where(eq(items.item_id, id));
            return {success: true, data: result};
        }catch(err) {
            return {success: false, error: err.message};
        }
    },

    //update item by id
    async updateById(id, data){
        try{
            const result = await db.update(items).set(data).where(eq(items.item_id, id)).returning();
            return {success: true, data: result};
        }catch(err) {
            return {success: false, error: err.message};
        }
    },

    //delete item by id
    async deleteById(id){
        try{
            const result = await db.delete(items).where(eq(items.item_id, id)).returning();
            return {success: true, data: result};
        }catch(err) {
            return {success: false, error: err.message};
        }
    },

    //search items by name(optional -> most rare cases)
    async searchByName(name){
        try{
            const result = await db.select().from(items).where(eq(items.name, name));
            return {success: true, data: result};
        }catch(err) {
            return {success: false, error: err.message};
        }
    }
};

//location ops
export const location_ops = {

    //create a location
    async create(data){
        try{
            const result = await db.insert(location).values(data).returning();
            return {success: true, data: result};
        }catch(err) {
            return {success: false, error: err.message};
        }
    },

    //get all locations
    async getAll(){
        try{
            const result = await db.select().from(location);
            return {success: true, data: result};
        }catch(err) {
            return {success: false, error: err.message};
        }
    },

    //get location by id
    async getById(id){
        try{
            const result = await db.select().from(location).where(eq(location.id, id));
            return {success: true, data: result};
        }catch(err) {
            return {success: false, error: err.message};
        }
    },

    //update location by id
    async updateById(id, data){
        try{
            const result = await db.update(location).set(data).where(eq(location.id, id)).returning();
            return {success: true, data: result};
        }catch(err) {
            return {success: false, error: err.message};
        }
    },

    //delete location by id
    async deleteById(id){
        try{
            const result = await db.delete(location).where(eq(location.id, id)).returning();
            return {success: true, data: result};
        }catch(err) {
            return {success: false, error: err.message};
        }
    },

    //ge location by name
    async getByName(name){
        try{
            const result = await db.select().from(location).where(eq(location.name, name));
            return {success: true, data: result};
        }catch(err) {
            return {success: false, error: err.message};
        }
    }
};

//inventory items ops
export const inventoryItems_ops = {

    //add items to inventory
    async create(data){
        try{
            const result = await db.insert(inventoryItems).values(data).returning();
            return {success: true, data: result};
        }catch(err) {
            return {success: false, error: err.message};
        }
    },

    //get items by inventory id
    async getByInventoryId(inventoryId){
        try{
            const result = await db.select().from(inventoryItems).where(eq(inventoryItems.inventoryId, inventoryId));
            return {success: true, data: result};
        }catch(err) {
            return {success: false, error: err.message};
        }
    },

    //update inventory item quantity by id
    async updateQuantity(inventory_id, itemId, quantity){
        try{
            const result = await db.update(inventoryItems).set({quantity, updatedAt: new Date()}).where(and(eq(inventoryItems.inventoryId, inventory_id), eq(inventoryItems.itemId, itemId))).returning();
            return {success: true, data: result};
        }catch(err) {
            return {success: false, error: err.message};
        }
    },

    //remove item from inventory given itemid and inventoryid
    async removeItem(inventoryId, itemId){
        try{
            const result = await db.delete(inventoryItems).where(and(eq(inventoryItems.inventoryId, inventoryId), eq(inventoryItems.itemId, itemId))).returning();
            return {success: true, data: result};
        }catch(err) {
            return {success: false, error: err.message};
        }
    }
};

//trigger message ops
export const triggermessage_ops = {
    
    //create trigger message
    async create(data){
        try{
            const result = await db.insert(triggerMessage).values(data).returning();
            return {success: true, data: result};
        }catch(err) {
            return {success: false, error: err.message};
        }
    },

    //get all trigger messages
    async getAll(){
        try{
            const result = await db.select().from(triggerMessage);
            return {success: true, data: result};
        }catch(err) {
            return {success: false, error: err.message};
        }
    },

    //get trigger message by id
    async getById(id){
        try{
            const result = await db.select().from(triggerMessage).where(eq(triggerMessage.triggerMessageId, id));
            return {success: true, data: result};
        }catch(err) {
            return {success: false, error: err.message};
        }
    },

    //update trigger message by id
    async updateById(id, data){
        try{
            const result = await db.update(triggerMessage).set(data).where(eq(triggerMessage.triggerMessageId, id)).returning();
            return {success: true, data: result};
        }catch(err) {
            return {success: false, error: err.message};
        }
    },

    //update trigger message status by id
    async updateStatusById(id, status){
        try{
            const result = await db.update(triggerMessage).set({status, updatedAt: new Date()}).where(eq(triggerMessage.triggerMessageId, id)).returning();
            return {success: true, data: result};
        }catch(err) {
            return {success: false, error: err.message};
        }
    },

    //get messages by status
    async getByStatus(status){
        try{
            const result = await db.select().from(triggerMessage).where(eq(triggerMessage.status, status));
            return {success: true, data: result};
        }catch(err) {
            return {success: false, error: err.message};
        }
    },

    //delete trigger message by id
    async deleteById(id){
        try{
            const result = await db.delete(triggerMessage).where(eq(triggerMessage.triggerMessageId, id)).returning();
            return {success: true, data: result};
        }catch(err) {
            return {success: false, error: err.message};
        }
    }
};

//relocation message pos
export const relocationmessage_ops = {
    
    //create relocation message
    async create(data){
        try{
            const result = await db.insert(relocationMessage).values(data).returning();
            return {success: true, data: result};
        }catch(err) {
            return {success: false, error: err.message};
        }
    },

    //get all relocation messages
    async getAll(){
        try{
            const result = await db.select().from(relocationMessage);
            return {success: true, data: result};
        }catch(err) {
            return {success: false, error: err.message};
        }
    },

    //get relocation message by id
    async getById(id){
        try{
            const result = await db.select().from(relocationMessage).where(eq(relocationMessage.relocationMessageId, id));
            return {success: true, data: result};
        }catch(err) {
            return {success: false, error: err.message};
        }
    },

    //update relocation message by id
    async updateById(id, data){
        try{
            const result = await db.update(relocationMessage).set(data).where(eq(relocationMessage.relocationMessageId, id)).returning();
            return {success: true, data: result};
        }catch(err) {
            return {success: false, error: err.message};
        }
    },

    //get relocation messages by status
    async getByStatus(status){
        try{
            const result = await db.select().from(relocationMessage).where(eq(relocationMessage.status, status));
            return {success: true, data: result};
        }catch(err) {
            return {success: false, error: err.message};
        }
    },

    //get relocations by priority
    async getByPriority(priority){
        try{
            const result = await db.select().from(relocationMessage).where(eq(relocationMessage.priority, priority));
            return {success: true, data: result};
        }catch(err) {
            return {success: false, error: err.message};
        }
    },

    //delete relocation message by id
    async deleteById(id){
        try{
            const result = await db.delete(relocationMessage).where(eq(relocationMessage.relocationMessageId, id)).returning();
            return {success: true, data: result};
        }catch(err) {
            return {success: false, error: err.message};
        }
    }
};

//forcasting metrics 
export const forecastingMetrics_ops = {

    //create forcasting ops
    async create(data){
        try{
            const result = await db.insert(forecastingMetrics).values(data).returning();
            return {success: true, data: result};
        }catch(err) {
            return {success: false, error: err.message};
        }
    },
    
    //get all forcasting metrics
    async getAll(){
        try{
            const result = await db.select().from(forecastingMetrics);
            return {success: true, data: result};        
        }catch(err) {
            return {success: false, error: err.message};
        }
    },

    //get forecasting metric by id
    async getById(id){
        try{
            const result = await db.select().from(forecastingMetrics).where(eq(forecastingMetrics.forecastId, id));
            return {success: true, data: result};
        }catch(err) {
            return {success: false, error: err.message};
        }
    }, 

    //bruhh, how much should i do 😭, if someone from drizzle watching, please rollout the ython client man, please!!
    //get metrics by inventory id
    async getByInventoryId(inventoryId){
        try{
            const result = await db.select().from(forecastingMetrics).where(eq(forecastingMetrics.inventoryId, inventoryId));
            return {success: true, data: result};
        }catch(err) {
            return {success: false, error: err.message};
        }
    },

    //update forecasting metric by id
    async updateById(id, data){
        try{
            const result = await db.update(forecastingMetrics).set(data).where(eq(forecastingMetrics.forecastId, id)).returning();
            return {success: true, data: result};
        }catch(err) {
            return {success: false, error: err.message};
        }
    },

    //delete forecasting metric by id
    async deleteById(id){
        try{
            const result = await db.delete(forecastingMetrics).where(eq(forecastingMetrics.forecastId, id)).returning();
            return {success: true, data: result};
        }catch(err) {
            return {success: false, error: err.message};
        }
    },
};

//demand history ops
export const demandhistory_ops = {

    //create demand hostory
    async create(data){
        try{
            if (data.timestamp && typeof data.timestamp === 'string') {
                data.timestamp = new Date(data.timestamp);
            }
            const result = await db.insert(demandHistory).values(data).returning();
            return {success: true, data: result};
        }catch(err) {
            return {success: false, error: err.message};
        }
    },

    //get all demand history
    async getAll(){
        try{
            const result = await db.select().from(demandHistory);
            return {success: true, data: result};
        }catch(err) {
            return {success: false, error: err.message};
        }
    },

    //get demand history by id
    async getById(id){
        try{
            const result = await db.select().from(demandHistory).where(eq(demandHistory.id, id));
            return {success: true, data: result};
        }catch(err) {
            return {success: false, error: err.message};
        }
    },

    //get demand history by inventory id
    async getByInventoryId(inventoryId){
        try{
            const result = await db.select().from(demandHistory).where(eq(demandHistory.inventoryId, inventoryId));
            return {success: true, data: result};
        }catch(err) {
            return {success: false, error: err.message};
        }
    },

    //getdemand history by item id
    async getByItemId(itemId){
        try{
            const result = await db.select().from(demandHistory).where(eq(demandHistory.itemId, itemId));
            return {success: true, data: result};
        }catch(err) {
            return {success: false, error: err.message};
        }
    },

    //get demad hostory by source
    async getBySource(source){
        try{
            const result = await db.select().from(demandHistory).where(eq(demandHistory.source, source));
            return {success: true, data: result};
        }catch(err) {
            return {success: false, error: err.message};
        }
    },

    //delete demand history by id
    async deleteById(id){
        try{
            const result = await db.delete(demandHistory).where(eq(demandHistory.id, id)).returning();
            return {success: true, data: result};
        }catch(err) {
            return {success: false, error: err.message};
        }
    },
};

//real time alert ops - i'm fed up at this point now 😤
export const realtimealert_ops = {

    //create alert
    async create(data){
        try{
            const result = await db.insert(realTimeAlerts).values(data).returning();
            return {success: true, data: result};
        }catch(err) {
            return {success: false, error: err.message};
        }
    },

    //get all alerts
    async getAll(){
        try{
            const result = await db.select().from(realTimeAlerts);
            return {success: true, data: result};
        }catch(err) {
            return {success: false, error: err.message};
        }
    },

    //get unresolved alerts
    async getUnresolved(){
        try{
            const result = await db.select().from(realTimeAlerts).where(eq(realTimeAlerts.isResolved, false)).orderBy(desc(realTimeAlerts.createdAt));
            return {success: true, data: result};
        }catch(err) {
            return {success: false, error: err.message};
        }
    },

    //get alerts by severuty
    async getBySeverity(severity){
        try{
            const result = await db.select().from(realTimeAlerts).where(eq(realTimeAlerts.severity, severity));
            return {success: true, data: result};
        }catch(err) {
            return {success: false, error: err.message};
        }
    },

    //get alerts by type
    async getByType(type){
        try{
            const result = await db.select().from(realTimeAlerts).where(eq(realTimeAlerts.alertType, type));
            return {success: true, data: result};
        }catch(err) {
            return {success: false, error: err.message};
        }
    },

    //update alert if resolved
    async updateResolved(id){
        try{
            const result = await db.update(realTimeAlerts).set({isResolved:true, resolvedAt: new Date()}).where(eq(realTimeAlerts.id, id)).returning();
            return {success: true, data: result};
        }catch(err) {
            return {success: false, error: err.message};
        }
    },

    //delete alert by id
    async deleteById(id){
        try{
            const result = await db.delete(realTimeAlerts).where(eq(realTimeAlerts.id, id)).returning();
            return {success: true, data: result};
        }catch(err) {
            return {success: false, error: err.message};
        }
    },

    //get by inventory id
    async getByInventoryId(inventoryId){
        try{
            const result = await db.select().from(realTimeAlerts).where(eq(realTimeAlerts.inventoryId, inventoryId));
            return {success: true, data: result};
        }catch(err) {
            return {success: false, error: err.message};
        }
    }
};

//admin ops
export const admin_ops = {
    
    //create admin
    async create(data){
        try{
            const result = await db.insert(admin).values(data).returning();
            return {success: true, data: result};
        }catch(err) {
            return {success: false, error: err.message};
        }
    },

    //get all admins
    async getAll(){
        try{
            const result = await db.select().from(admin);
            return {success: true, data: result};
        }catch(err) {
            return {success: false, error: err.message};
        }
    },

    //get admin by id
    async getById(id){
        try{
            const result = await db.select().from(admin).where(eq(admin.admin_id, id));
            return {success: true, data: result};
        }catch(err) {
            return {success: false, error: err.message};
        }
    },

    //get admin by email
    async getByEmail(email){
        try{
            const result = await db.select().from(admin).where(eq(admin.email, email));
            return {success: true, data: result};
        }catch(err) {
            return {success: false, error: err.message};
        }
    },

    //update admin by id
    async updateById(id, data){
        try{
            const result = await db.update(admin).set(data).where(eq(admin.admin_id, id)).returning();
            return {success: true, data: result};
        }catch(err) {
            return {success: false, error: err.message};
        }
    },

    //delete admin by id
    async deleteById(id){
        try{
            const result = await db.delete(admin).where(eq(admin.admin_id, id)).returning();
            return {success: true, data: result};
        }catch(err) {
            return {success: false, error: err.message};
        }
    }
};

//spike monoitoring ops
export const spikemonitoring_ops = {

    //create spike monitoring
    async create(data){
        try{
            const result = await db.insert(spikeMonitoring).values(data).returning();
            return {success: true, data: result};
        }catch(err) {
            return {success: false, error: err.message};
        }
    },

    //get all spike monitoring records
    async getAll(){
        try{
            const result = await db.select().from(spikeMonitoring);
            return {success: true, data: result};        
        }catch(err) {
            return {success: false, error: err.message};
        }
    },

    //get all spike monitoring records by inventory id
    async getByInventoryId(inventoryId){
        try{
            const result = await db.select().from(spikeMonitoring).where(eq(spikeMonitoring.inventoryId, inventoryId));
            return {success: true, data: result};
        }catch(err) {
            return {success: false, error: err.message};
        }
    },

    //update spike moitoring by id
    async updateById(id, data){
        try{
            const result = await db.update(spikeMonitoring).set(data).where(eq(spikeMonitoring.spikeMonitoringId, id)).returning();
            return {success: true, data: result};
        }catch(err) {
            return {success: false, error: err.message};
        }
    },

    //delete spike monitoring by id
    async deleteById(id){
        try{
            const result = await db.delete(spikeMonitoring).where(eq(spikeMonitoring.spikeMonitoringId, id)).returning();
            return {success: true, data: result};
        }catch(err) {
            return {success: false, error: err.message};
        }
    }
};

//extra utility funcs
export const utility_ops = {
    async getInventoryOverview(inventoryId){
        try{
            const result = await db.select().from(inventory).leftJoin(inventoryItems, eq(inventory.id, inventoryItems.inventoryId)).leftJoin(items, eq(inventoryItems.itemId, items.item_id)).leftJoin(location, eq(inventory.locationId, location.id)).where(eq(inventory.id, inventoryId)).orderBy(asc(items.name));
            return {success: true, data: result};
        }catch(err){
            return {success: false, error: err.message};
        }
    },

    //dahsoboard summary for my easeness
    async getDashboardSummary() {
        try {
            const inventoryCount = await db.select().from(inventory);
            const itemsCount = await db.select().from(items);
            const unresolvedAlerts = await db.select().from(realTimeAlerts).where(eq(realTimeAlerts.isResolved, false));
            const pendingRelocations = await db.select().from(relocationMessage).where(eq(relocationMessage.status, 'pending'));
            
            return {
                success: true,
                data: {
                    totalInventories: inventoryCount.length,
                    totalItems: itemsCount.length,
                    unresolvedAlerts: unresolvedAlerts.length,
                    pendingRelocations: pendingRelocations.length
                }
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
};

export default {
    inventory: inventory_ops,
    items: item_ops,
    location: location_ops,
    inventoryItems: inventoryItems_ops,
    triggerMessage: triggermessage_ops,
    relocationMessage: relocationmessage_ops,
    forecastingMetrics: forecastingMetrics_ops,
    demandHistory: demandhistory_ops,
    realTimeAlerts: realtimealert_ops,
    admin: admin_ops,
    spikeMonitoring: spikemonitoring_ops,
    utility: utility_ops
};

//dashboar metrics ops
export const dashboardmetrics_ops = {

    async getAll(){
        try{
            const res = await db.select().from(dashboardMetrics);
            return { success: true, data: res };
        }catch(err){
            return { success: false, error: err };
        }
    }, 
    async recordDailyMetrics(data) {
        try {
            const result = await db.insert(dashboardMetrics).values(data).returning();
            return { success: true, data: result };
        } catch (err) {
            return { success: false, error: err.message };
        }
    },

    async getPreviousMetrics(metricType, daysBack = 7) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysBack);
            
            const result = await db.select()
                .from(dashboardMetrics)
                .where(and(
                    eq(dashboardMetrics.metricType, metricType),
                    gte(dashboardMetrics.recordedAt, cutoffDate)
                ))
                .orderBy(desc(dashboardMetrics.recordedAt))
                .limit(1);
            
            return { success: true, data: result };
        } catch (err) {
            return { success: false, error: err };
        }
    },

    async getMetricsByDate(date) {
        try {
            const result = await db.select()
                .from(dashboardMetrics)
                .where(eq(dashboardMetrics.recordedAt, date));
            return { success: true, data: result };
        } catch (err) {
            return { success: false, error: err.message };
        }
    }
};



if (process.argv.length >= 3) {
    const operation = process.argv[2];
    const data = process.argv[3] ? JSON.parse(process.argv[3]) : null;
    
    const [module, method] = operation.split('.');
    const operations = {
        inventory_ops,
        item_ops,
        location_ops,
        inventoryItems_ops,
        triggermessage_ops,
        relocationmessage_ops,
        forecastingMetrics_ops,
        demandhistory_ops,
        realtimealert_ops,
        admin_ops,
        spikemonitoring_ops,
        utility_ops,
        dashboardmetrics_ops
    };
    
    if (module && method && operations[module] && operations[module][method]) {
        if (method === 'updateById' && Array.isArray(data) && data.length === 2) {
            const [id, updateData] = data;
            operations[module][method](id, updateData)
                .then(result => {
                    console.log(JSON.stringify(result));
                    process.exit(0);
                })
                .catch(error => {
                    console.error(JSON.stringify({ success: false, error: error.message }));
                    process.exit(1);
                });
        } else if (method === 'updateQuantity' && Array.isArray(data) && data.length === 3) {
            const [inventoryId, itemId, quantity] = data;
            operations[module][method](inventoryId, itemId, quantity)
                .then(result => {
                    console.log(JSON.stringify(result));
                    process.exit(0);
                })
                .catch(error => {
                    console.error(JSON.stringify({ success: false, error: error.message }));
                    process.exit(1);
                });
        } else if (method === 'updateStatusById' && Array.isArray(data) && data.length === 2) {
            const [id, status] = data;
            operations[module][method](id, status)
                .then(result => {
                    console.log(JSON.stringify(result));
                    process.exit(0);
                })
                .catch(error => {
                    console.error(JSON.stringify({ success: false, error: error.message }));
                    process.exit(1);
                });
        } else if (method === 'removeItem' && Array.isArray(data) && data.length === 2) {
            const [inventoryId, itemId] = data;
            operations[module][method](inventoryId, itemId)
                .then(result => {
                    console.log(JSON.stringify(result));
                    process.exit(0);
                })
                .catch(error => {
                    console.error(JSON.stringify({ success: false, error: error.message }));
                    process.exit(1);
                });
        } else if (method === 'getPreviousMetrics' && Array.isArray(data) && data.length >= 1) {
            const [metricType, daysBack] = data;
            operations[module][method](metricType, daysBack)
                .then(result => {
                    console.log(JSON.stringify(result));
                    process.exit(0);
                })
                .catch(error => {
                    console.error(JSON.stringify({ success: false, error: error.message }));
                    process.exit(1);
                });
        } else {
            operations[module][method](data)
                .then(result => {
                    console.log(JSON.stringify(result));
                    process.exit(0);
                })
                .catch(error => {
                    console.error(JSON.stringify({ success: false, error: error.message }));
                    process.exit(1);
                });
        }
    } else {
        console.error(JSON.stringify({ success: false, error: "Invalid operation" }));
        process.exit(1);
    }
}






