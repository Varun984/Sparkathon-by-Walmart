from fastapi import FastAPI, HTTPException, Request, Response, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from clerk_backend_api import Clerk
from clerk_backend_api.models import ClerkErrors, SDKError
from collections import defaultdict
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List
import os
import logging
import json
import jwt
from time import time
import subprocess
from apscheduler.schedulers.background import BackgroundScheduler
import atexit
import csv
import asyncio
from models.forecasting.incremental_lstm import run_incremental_lstm
import uvicorn
import shlex
from pydantic import BaseModel
from typing import Optional

class InventoryCreateRequest(BaseModel):
    name: str
    location: str
    volumeOccupied: float
    volumeAvailable: float
    volumeReserved: float
    threshold: int
    locationId: int
    status: str
    description: str

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Requested-With", "Accept", "Origin"],
)

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
    
    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
    
    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)
    
    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

@app.on_event("startup")
async def startup_event():
    print("Glyphor backend is starting up...")

@app.on_event("shutdown")
async def shutdown_event():
    print("Glyphor backend is shutting down...")

@app.get("/")
async def welcome():
    return JSONResponse({"message": "Welcome to the Glyphor backend!"}, status_code=200)

@app.get("/health")
async def health_check():
    return JSONResponse({"status": "healthy"}, status_code=200)

@app.websocket("/ws/demand-monitor")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await asyncio.sleep(5)
            
            inventories_result = call_node_script("inventory_ops.getAll")
            if inventories_result.get("success"):
                inventories = inventories_result.get("data", [])
                
                for inventory in inventories:
                    available = inventory.get("volumeAvailable", 0)
                    reserved = inventory.get("volumeReserved", 0)
                    occupied = inventory.get("volumeOccupied", 0)
                    threshold = available - reserved
                    
                    if occupied > threshold:
                        await trigger_load_balancer(inventory["id"], manager)
                        
                        alert_data = {
                            "type": "threshold_breach",
                            "inventory_id": inventory["id"],
                            "inventory_name": inventory.get("name", "Unknown"),
                            "current_load": occupied,
                            "threshold": threshold,
                            "timestamp": datetime.now().isoformat()
                        }
                        await manager.broadcast(json.dumps(alert_data))
                        
    except WebSocketDisconnect:
        manager.disconnect(websocket)

async def trigger_load_balancer(inventory_id: int, manager: ConnectionManager):
    try:
        load_balancer_data = await prepare_load_balancer_data(inventory_id)
        
        result = subprocess.run(
            ["./cpp_codes/load_balancer"],
            input=json.dumps(load_balancer_data),
            capture_output=True,
            text=True,
            timeout=30
        )
        
        if result.returncode == 0:
            target_inventory = int(result.stdout.strip())
            
            relocation_data = {
                "fromInventoryId": inventory_id,
                "toInventoryId": target_inventory,
                "quantity": load_balancer_data["excess_load"],
                "priority": "high",
                "status": "pending"
            }
            
            call_node_script(f"relocationmessage_ops.create {json.dumps(relocation_data)}")
            
            await manager.broadcast(json.dumps({
                "type": "relocation_recommended",
                "from_inventory": inventory_id,
                "to_inventory": target_inventory,
                "quantity": load_balancer_data["excess_load"]
            }))
            
    except Exception as e:
        print(f"Load balancer error: {e}")

async def prepare_load_balancer_data(from_inventory_id: int):
    inventories_result = call_node_script("inventory_ops.getAll")
    locations_result = call_node_script("location_ops.getAll")
    
    inventories = inventories_result.get("data", [])
    locations = locations_result.get("data", [])
    
    data = {
        "from inv": from_inventory_id,
        "upcoming quantity": {},
        "distance from_inv": {},
        "current_demand": {},
        "forecasted_demand": {},
        "volume_free": {},
        "threshold_for_alert": {}
    }
    
    for inv in inventories:
        inv_id = inv["id"]
        data["upcoming quantity"][str(inv_id)] = inv["volumeOccupied"]
        data["volume_free"][str(inv_id)] = inv["volumeAvailable"]
        data["threshold_for_alert"][str(inv_id)] = inv["volumeAvailable"] - inv["volumeReserved"]
        data["distance from_inv"][str(inv_id)] = abs(inv_id - from_inventory_id) * 10
        
        demand_result = call_node_script(f"demandhistory_ops.getByInventoryId {inv_id}")
        if demand_result.get("success"):
            demand_history = demand_result.get("data", [])
            current_demand = sum(d.get("demandQuantity", 0) for d in demand_history[-7:])
            data["current_demand"][str(inv_id)] = current_demand
            data["forecasted_demand"][str(inv_id)] = int(current_demand * 1.2)
    
    return data

@app.get("/api/inventory")
async def get_all_inventories():
    try:
        result = call_node_script("inventory_ops.getAll")
        if not result.get("success"):
            raise HTTPException(status_code=500, detail="Failed to fetch inventories")
        return JSONResponse(result.get("data", []), status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/inventory")
async def create_inventory(request: Request):
    try:
        data = await request.json()
        result = call_node_script(f"inventory_ops.create {json.dumps(data)}")
        print(f"Create inventory result: {result}")
        if not result.get("success"):
            raise HTTPException(status_code=500, detail="Failed to create inventory")
        return JSONResponse({"message": "Inventory created successfully"}, status_code=201)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/items")
async def get_all_items():
    try:
        result = call_node_script("item_ops.getAll")
        if not result.get("success"):
            raise HTTPException(status_code=500, detail="Failed to fetch items")
        return JSONResponse(result.get("data", []), status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/items")
async def create_item(data: dict):
    try:
        result = call_node_script(f"item_ops.create {json.dumps(data)}")
        if not result.get("success"):
            raise HTTPException(status_code=500, detail="Failed to create item")
        return JSONResponse({"message": "Item created successfully"}, status_code=201)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/items/{item_id}")
async def get_item_by_id(item_id: int):
    try:
        result = call_node_script(f"item_ops.getById {item_id}")
        if not result.get("success"):
            raise HTTPException(status_code=404, detail="Item not found")
        return JSONResponse(result.get("data", []), status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/items/{item_id}")
async def update_item(item_id: int, data: dict):
    try:
        result = call_node_script(f"item_ops.updateById {json.dumps([item_id, data])}")
        if not result.get("success"):
            raise HTTPException(status_code=500, detail="Failed to update item")
        return JSONResponse({"message": "Item updated successfully"}, status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/items/{item_id}")
async def delete_item(item_id: int):
    try:
        result = call_node_script(f"item_ops.deleteById {item_id}")
        if not result.get("success"):
            raise HTTPException(status_code=500, detail="Failed to delete item")
        return JSONResponse({"message": "Item deleted successfully"}, status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/inventory/{inventory_id}/items")
async def get_inventory_items(inventory_id: int):
    try:
        result = call_node_script(f"inventoryItems_ops.getByInventoryId {inventory_id}")
        if not result.get("success"):
            raise HTTPException(status_code=500, detail="Failed to fetch inventory items")
        return JSONResponse(result.get("data", []), status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/inventory/{inventory_id}/items")
async def add_item_to_inventory(inventory_id: int, data: dict):
    try:
        data["inventoryId"] = inventory_id
        result = call_node_script(f"inventoryItems_ops.create {json.dumps(data)}")
        if not result.get("success"):
            raise HTTPException(status_code=500, detail="Failed to add item to inventory")
        return JSONResponse({"message": "Item added to inventory successfully"}, status_code=201)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/inventory/{inventory_id}/items/{item_id}")
async def update_inventory_item_quantity(inventory_id: int, item_id: int, data: dict):
    try:
        quantity = data.get("quantity", 0)
        result = call_node_script(f"inventoryItems_ops.updateQuantity {json.dumps([inventory_id, item_id, quantity])}")
        if not result.get("success"):
            raise HTTPException(status_code=500, detail="Failed to update item quantity")
        return JSONResponse({"message": "Item quantity updated successfully"}, status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/inventory/{inventory_id}/items/{item_id}")
async def remove_item_from_inventory(inventory_id: int, item_id: int):
    try:
        result = call_node_script(f"inventoryItems_ops.removeItem {json.dumps([inventory_id, item_id])}")
        if not result.get("success"):
            raise HTTPException(status_code=500, detail="Failed to remove item from inventory")
        return JSONResponse({"message": "Item removed from inventory successfully"}, status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/locations")
async def get_all_locations():
    try:
        result = call_node_script("location_ops.getAll")
        if not result.get("success"):
            raise HTTPException(status_code=500, detail="Failed to fetch locations")
        return JSONResponse(result.get("data", []), status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/locations")
async def create_location(data: dict):
    try:
        result = call_node_script(f"location_ops.create {json.dumps(data)}")
        if not result.get("success"):
            raise HTTPException(status_code=500, detail="Failed to create location")
        return JSONResponse({"message": "Location created successfully"}, status_code=201)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/locations/{location_id}")
async def get_location_by_id(location_id: int):
    try:
        result = call_node_script(f"location_ops.getById {location_id}")
        if not result.get("success"):
            raise HTTPException(status_code=404, detail="Location not found")
        return JSONResponse(result.get("data", []), status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/locations/{location_id}")
async def update_location(location_id: int, data: dict):
    try:
        result = call_node_script(f"location_ops.updateById {json.dumps([location_id, data])}")
        if not result.get("success"):
            raise HTTPException(status_code=500, detail="Failed to update location")
        return JSONResponse({"message": "Location updated successfully"}, status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/locations/{location_id}")
async def delete_location(location_id: int):
    try:
        result = call_node_script(f"location_ops.deleteById {location_id}")
        if not result.get("success"):
            raise HTTPException(status_code=500, detail="Failed to delete location")
        return JSONResponse({"message": "Location deleted successfully"}, status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/map/inventory-locations")
async def get_inventory_locations_for_map():
    try:
        inventories_result = call_node_script("inventory_ops.getAll")
        if not inventories_result.get("success"):
            raise HTTPException(status_code=500, detail="Failed to fetch inventories")
        
        inventories = inventories_result.get("data", [])
        map_data = []
        
        for inventory in inventories:
            location_result = call_node_script(f"location_ops.getById {inventory['locationId']}")
            if location_result.get("success"):
                location = location_result.get("data", [{}])[0]
                
                alerts_result = call_node_script(f"realtimealert_ops.getByInventoryId {inventory['id']}")
                alerts = alerts_result.get("data", []) if alerts_result.get("success") else []
                
                utilization = calculate_utilization_rate(inventory)
                
                map_data.append({
                    "id": inventory["id"],
                    "name": inventory["name"],
                    "latitude": location.get("latitude", 0),
                    "longitude": location.get("longitude", 0),
                    "address": location.get("address", ""),
                    "city": location.get("city", ""),
                    "state": location.get("state", ""),
                    "status": inventory["status"],
                    "utilization": utilization,
                    "volumeOccupied": inventory["volumeOccupied"],
                    "volumeAvailable": inventory["volumeAvailable"],
                    "totalCapacity": inventory["volumeOccupied"] + inventory["volumeAvailable"],
                    "alertCount": len(alerts),
                    "criticalAlerts": len([a for a in alerts if a.get("severity") == "critical"])
                })
        
        return JSONResponse(map_data, status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/map/inventory-locations/{inventory_id}")
async def get_inventory_location_details(inventory_id: int):
    try:
        inventory_result = call_node_script(f"inventory_ops.getById {inventory_id}")
        if not inventory_result.get("success"):
            raise HTTPException(status_code=404, detail="Inventory not found")
        
        inventory = inventory_result.get("data", [{}])[0]
        
        location_result = call_node_script(f"location_ops.getById {inventory['locationId']}")
        location = location_result.get("data", [{}])[0] if location_result.get("success") else {}
        
        alerts_result = call_node_script(f"realtimealert_ops.getByInventoryId {inventory_id}")
        alerts = alerts_result.get("data", []) if alerts_result.get("success") else []
        
        relocations_result = call_node_script("relocationmessage_ops.getAll")
        all_relocations = relocations_result.get("data", []) if relocations_result.get("success") else []
        recent_relocations = [r for r in all_relocations if r.get("fromInventoryId") == inventory_id or r.get("toInventoryId") == inventory_id][-5:]
        
        return JSONResponse({
            "inventory": inventory,
            "location": location,
            "alerts": alerts[-10:],
            "recentRelocations": recent_relocations,
            "utilization": calculate_utilization_rate(inventory)
        }, status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/relocations")
async def get_all_relocations():
    try:
        result = call_node_script("relocationmessage_ops.getAll")
        if not result.get("success"):
            raise HTTPException(status_code=500, detail="Failed to fetch relocations")
        return JSONResponse(result.get("data", []), status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/relocations")
async def create_relocation(data: dict):
    try:
        result = call_node_script(f"relocationmessage_ops.create {json.dumps(data)}")
        if not result.get("success"):
            raise HTTPException(status_code=500, detail="Failed to create relocation")
        return JSONResponse({"message": "Relocation created successfully"}, status_code=201)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/relocations/{relocation_id}")
async def get_relocation_by_id(relocation_id: int):
    try:
        result = call_node_script(f"relocationmessage_ops.getById {relocation_id}")
        if not result.get("success"):
            raise HTTPException(status_code=404, detail="Relocation not found")
        return JSONResponse(result.get("data", []), status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/relocations/{relocation_id}/status")
async def update_relocation_status(relocation_id: int, data: dict):
    try:
        status = data.get("status", "pending")
        result = call_node_script(f"relocationmessage_ops.updateById {json.dumps([relocation_id, {'status': status}])}")
        if not result.get("success"):
            raise HTTPException(status_code=500, detail="Failed to update relocation status")
        return JSONResponse({"message": "Relocation status updated successfully"}, status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/relocations/status/{status}")
async def get_relocations_by_status(status: str):
    try:
        result = call_node_script(f"relocationmessage_ops.getByStatus {status}")
        if not result.get("success"):
            raise HTTPException(status_code=500, detail="Failed to fetch relocations by status")
        return JSONResponse(result.get("data", []), status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/relocations/{relocation_id}/execute")
async def execute_relocation(relocation_id: int):
    try:
        relocation_result = call_node_script(f"relocationmessage_ops.getById {relocation_id}")
        if not relocation_result.get("success"):
            raise HTTPException(status_code=404, detail="Relocation not found")
        
        relocation = relocation_result.get("data", [{}])[0]
        
        from_inventory_id = relocation["fromInventoryId"]
        to_inventory_id = relocation["toInventoryId"]
        quantity = relocation["quantity"]
        
        from_inv_result = call_node_script(f"inventory_ops.getById {from_inventory_id}")
        if from_inv_result.get("success"):
            from_inv = from_inv_result.get("data", [{}])[0]
            new_occupied = from_inv["volumeOccupied"] - quantity
            new_available = from_inv["volumeAvailable"] + quantity
            
            call_node_script(f"inventory_ops.updateById {json.dumps([from_inventory_id, {'volumeOccupied': new_occupied, 'volumeAvailable': new_available}])}")
        
        to_inv_result = call_node_script(f"inventory_ops.getById {to_inventory_id}")
        if to_inv_result.get("success"):
            to_inv = to_inv_result.get("data", [{}])[0]
            new_occupied = to_inv["volumeOccupied"] + quantity
            new_available = to_inv["volumeAvailable"] - quantity
            
            call_node_script(f"inventory_ops.updateById {json.dumps([to_inventory_id, {'volumeOccupied': new_occupied, 'volumeAvailable': new_available}])}")
        
        call_node_script(f"relocationmessage_ops.updateById {json.dumps([relocation_id, {'status': 'completed'}])}")
        
        return JSONResponse({"message": "Relocation executed successfully"}, status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/alerts")
async def get_all_alerts():
    try:
        result = call_node_script("realtimealert_ops.getAll")
        if not result.get("success"):
            raise HTTPException(status_code=500, detail="Failed to fetch alerts")
        return JSONResponse(result.get("data", []), status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/alerts/unresolved")
async def get_unresolved_alerts():
    try:
        result = call_node_script("realtimealert_ops.getUnresolved")
        if not result.get("success"):
            raise HTTPException(status_code=500, detail="Failed to fetch unresolved alerts")
        return JSONResponse(result.get("data", []), status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/alerts")
async def create_alert(data: dict):
    try:
        result = call_node_script(f"realtimealert_ops.create {json.dumps(data)}")
        if not result.get("success"):
            raise HTTPException(status_code=500, detail="Failed to create alert")
        return JSONResponse({"message": "Alert created successfully"}, status_code=201)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/alerts/{alert_id}/resolve")
async def resolve_alert(alert_id: int):
    try:
        result = call_node_script(f"realtimealert_ops.updateResolved {alert_id}")
        if not result.get("success"):
            raise HTTPException(status_code=500, detail="Failed to resolve alert")
        return JSONResponse({"message": "Alert resolved successfully"}, status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/alerts/severity/{severity}")
async def get_alerts_by_severity(severity: str):
    try:
        result = call_node_script(f"realtimealert_ops.getBySeverity {severity}")
        if not result.get("success"):
            raise HTTPException(status_code=500, detail="Failed to fetch alerts by severity")
        return JSONResponse(result.get("data", []), status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/demand-history")
async def get_all_demand_history():
    try:
        result = call_node_script("demandhistory_ops.getAll")
        if not result.get("success"):
            raise HTTPException(status_code=500, detail="Failed to fetch demand history")
        return JSONResponse(result.get("data", []), status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/demand-history")
async def create_demand_history(data: dict):
    try:
        result = call_node_script(f"demandhistory_ops.create {json.dumps(data)}")
        if not result.get("success"):
            raise HTTPException(status_code=500, detail="Failed to create demand history")
        return JSONResponse({"message": "Demand history created successfully"}, status_code=201)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/demand-history/inventory/{inventory_id}")
async def get_demand_history_by_inventory(inventory_id: int):
    try:
        result = call_node_script(f"demandhistory_ops.getByInventoryId {inventory_id}")
        if not result.get("success"):
            raise HTTPException(status_code=500, detail="Failed to fetch demand history")
        return JSONResponse(result.get("data", []), status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/demand-history/item/{item_id}")
async def get_demand_history_by_item(item_id: int):
    try:
        result = call_node_script(f"demandhistory_ops.getByItemId {item_id}")
        if not result.get("success"):
            raise HTTPException(status_code=500, detail="Failed to fetch demand history")
        return JSONResponse(result.get("data", []), status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/forecasting/metrics")
async def get_forecasting_metrics():
    try:
        result = call_node_script("forecastingMetrics_ops.getAll")
        if not result.get("success"):
            raise HTTPException(status_code=500, detail="Failed to fetch forecasting metrics")
        return JSONResponse(result.get("data", []), status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/forecasting/metrics")
async def create_forecasting_metric(data: dict):
    try:
        result = call_node_script(f"forecastingMetrics_ops.create {json.dumps(data)}")
        if not result.get("success"):
            raise HTTPException(status_code=500, detail="Failed to create forecasting metric")
        return JSONResponse({"message": "Forecasting metric created successfully"}, status_code=201)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/forecasting/inventory/{inventory_id}")
async def get_inventory_forecast(inventory_id: int):
    try:
        result = call_node_script(f"forecastingMetrics_ops.getByInventoryId {inventory_id}")
        if not result.get("success"):
            raise HTTPException(status_code=500, detail="Failed to fetch inventory forecast")
        
        forecast_data = generate_forecast_based_on_log_count()
        
        return JSONResponse({
            "inventory_id": inventory_id,
            "forecast": forecast_data,
            "historical_metrics": result.get("data", [])
        }, status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/load-balancer/trigger")
async def trigger_manual_load_balancer(data: dict):
    try:
        inventory_id = data.get("inventory_id")
        if not inventory_id:
            raise HTTPException(status_code=400, detail="inventory_id is required")
        
        load_balancer_data = await prepare_load_balancer_data(inventory_id)
        
        result = subprocess.run(
            ["./cpp_codes/load_balancer"],
            input=json.dumps(load_balancer_data),
            capture_output=True,
            text=True,
            timeout=30
        )
        
        if result.returncode == 0:
            target_inventory = int(result.stdout.strip())
            
            return JSONResponse({
                "success": True,
                "source_inventory": inventory_id,
                "target_inventory": target_inventory,
                "recommendation": f"Move excess load from inventory {inventory_id} to inventory {target_inventory}"
            }, status_code=200)
        else:
            return JSONResponse({
                "success": False,
                "error": result.stderr
            }, status_code=500)
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def call_node_script(command):
    try:
        parts = command.split(' ', 1)
        operation = parts[0]
        data = parts[1] if len(parts) > 1 else None

        if data:
            cmd = ["node", "database/index.js", operation, data]
        else:
            cmd = ["node", "database/index.js", operation]

        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)

        if result.returncode != 0:
            raise HTTPException(
                status_code=500,
                detail=f"Node script failed: {result.stderr}"
            )

        response = json.loads(result.stdout)
        if not isinstance(response, dict):
            raise HTTPException(
                status_code=500,
                detail="Invalid response format from database"
            )

        return response

    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=504, detail="Database operation timed out")
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"Invalid JSON response: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

def calculate_cost_savings(completed_relocations: list, inventories: list):
    base_savings_per_item = 15
    total_items = sum(r.get("quantity", 0) for r in completed_relocations)
    efficiency_bonus = 0
    for inventory in inventories:
        if inventory.get("status") == "optimal":
            efficiency_bonus += 500
    return (total_items * base_savings_per_item) + efficiency_bonus

@app.get("/api/dashboard/overview")
async def get_dashboard_overview():
    try:
        inventories_result = call_node_script("inventory_ops.getAll")
        if not inventories_result.get("success"):
            raise HTTPException(status_code=500, detail="Failed to fetch inventories")
        inventories = inventories_result.get("data", [])
        total_inventories = len(inventories)
        print(f"Total inventories: {total_inventories}")

        alrt_res = call_node_script("realtimealert_ops.getUnresolved")
        if not alrt_res.get("success"):
            raise HTTPException(status_code=500, detail="Failed to fetch unresolved alerts")
        alerts = alrt_res.get("data", [])
        critical_alerts = len([alert for alert in alerts if alert.get("severity") == "critical"])
        print(f"Critical alerts: {critical_alerts}")

        relocations_result = call_node_script("relocationmessage_ops.getAll")
        if not relocations_result.get("success"):
            raise HTTPException(status_code=500, detail="Failed to fetch relocations")
        relocations = relocations_result.get("data", [])
        completed_relocations = [r for r in relocations if r.get("status") == "completed"]
        items_migrated = sum(r.get("quantity", 0) for r in completed_relocations)
        print(f"Items migrated: {items_migrated}")

        reallocated_items = sum(r.get("quantity", 0) for r in relocations)
        print(f"Reallocated items: {reallocated_items}")

        cost_savings = calculate_cost_savings(completed_relocations, inventories)
        print(f"Cost savings: {cost_savings}")

        res = {
            "total_inventories": total_inventories,
            "critical_alerts": critical_alerts,
            "items_migrated": items_migrated,
            "cost_savings": cost_savings,
            "reallocated_items": reallocated_items
        }

        print(f"Dashboard overview: {res}")
        return {
            "total_inventories": total_inventories,
            "critical_alerts": critical_alerts,
            "items_migrated": items_migrated,
            "cost_savings": cost_savings,
            "reallocated_items": reallocated_items
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def get_previous_period_value(metric_type: str, current_value: int):
    if metric_type == "migrated":
        return int(current_value / 1.12)
    elif metric_type == "reallocated":
        return int(current_value / 1.08)
    elif metric_type == "cost_savings":
        return int(current_value / 1.15)
    elif metric_type == "critical_alerts":
        return current_value + 1
    return current_value

def calculate_percentage_change(current: int, previous: int):
    if previous == 0:
        return 0.0
    return ((current - previous) / previous) * 100

def format_change_percentage(change: float):
    if change >= 0:
        return f"+{change:.0f}%"
    else:
        return f"{change:.0f}%"

scheduler = BackgroundScheduler()

async def record_daily_metrics():
    try:
        inventories_result = call_node_script("inventory_ops.getAll")
        relocations_result = call_node_script("relocationmessage_ops.getAll")
        alerts_result = call_node_script("realtimealert_ops.getUnresolved")

        if all([inventories_result.get("success"), relocations_result.get("success"), alerts_result.get("success")]):
            inventories = inventories_result.get("data", [])
            relocations = relocations_result.get("data", [])
            alerts = alerts_result.get("data", [])

            completed_relocations = [r for r in relocations if r.get("status") == "completed"]
            migrated = sum(r.get("quantity", 0) for r in completed_relocations)
            reallocated = sum(r.get("quantity", 0) for r in relocations)
            cost_savings = calculate_cost_savings(completed_relocations, inventories)
            critical_alerts = len([alert for alert in alerts if alert.get("severity") == "critical"])

            metrics_to_store = [
                {"metricType": "migrated", "value": migrated},
                {"metricType": "reallocated", "value": reallocated},
                {"metricType": "cost_savings", "value": cost_savings},
                {"metricType": "critical_alerts", "value": critical_alerts}
            ]

            for metric in metrics_to_store:
                call_node_script(f"dashboardmetrics_ops.recordDailyMetrics {json.dumps(metric)}")

            print(f"Daily metrics recorded: {metrics_to_store}")
    except Exception as e:
        print(f"Error recording daily metrics: {e}")

scheduler.add_job(func=record_daily_metrics, trigger="cron", hour=0, minute=0)
scheduler.start()
atexit.register(lambda: scheduler.shutdown())

@app.get("/api/dashboard/stats")
async def get_dashboard_stats():
    current_data = await get_dashboard_overview()
    print(current_data)

    previous_migrated = call_node_script('dashboardmetrics_ops.getPreviousMetrics ["migrated"]')
    previous_reallocated = call_node_script('dashboardmetrics_ops.getPreviousMetrics ["reallocated"]')
    previous_cost_savings = call_node_script('dashboardmetrics_ops.getPreviousMetrics ["cost_savings"]')
    previous_critical_alerts = call_node_script('dashboardmetrics_ops.getPreviousMetrics ["critical_alerts"]')

    print(previous_migrated, previous_reallocated, previous_cost_savings, previous_critical_alerts)

    migrated_change = calculate_percentage_change(
        current_data["items_migrated"],
        previous_migrated.get("data", [{}])[0].get("value", current_data["items_migrated"])
    )

    reallocated_change = calculate_percentage_change(
        current_data["reallocated_items"],
        previous_reallocated.get("data", [{}])[0].get("value", current_data["reallocated_items"])
    )

    saved_change = calculate_percentage_change(
        current_data["cost_savings"],
        previous_cost_savings.get("data", [{}])[0].get("value", current_data["cost_savings"])
    )

    critical_alerts_change = calculate_percentage_change(
        current_data["critical_alerts"],
        previous_critical_alerts.get("data", [{}])[0].get("value", current_data["critical_alerts"])
    )

    print(f"Changes - Migrated: {migrated_change}, Reallocated: {reallocated_change}, "
          f"Saved: {saved_change}, Critical Alerts: {critical_alerts_change}")

    return {
        "migrated": {
            "value": f"{current_data['items_migrated']:,}",
            "change": format_change_percentage(migrated_change)
        },
        "reallocated": {
            "value": f"{current_data['reallocated_items']:,}",
            "change": format_change_percentage(reallocated_change)
        },
        "saved": {
            "value": f"${current_data['cost_savings'] / 1000:.1f}K",
            "change": format_change_percentage(saved_change)
        },
        "critical_alerts": {
            "value": str(current_data['critical_alerts']),
            "change": format_change_percentage(critical_alerts_change)
        }
    }

def calculate_utilization_rate(inventory):
    total_capacity = inventory['volumeOccupied'] + inventory['volumeAvailable']
    if total_capacity == 0:
        return 0.0
    return (inventory['volumeOccupied'] / total_capacity) * 100

def generate_forecast_based_on_log_count():
    LOG_FILE = os.path.join("models", "forecasting", "inventory_log.csv")
    MODEL_DIR = os.path.join("models", "forecasting")

    if not os.path.exists(LOG_FILE):
        return {
            "model_used": "default",
            "log_count": 0,
            "forecast": {"next_week": 70.0, "next_month": 75.0, "confidence": "low"}
        }

    try:
        with open(LOG_FILE, "r") as f:
            reader = csv.reader(f)
            next(reader)
            log_count = sum(1 for _ in reader)
    except Exception as e:
        return {
            "model_used": "default",
            "log_count": 0,
            "forecast": {"next_week": 70.0, "next_month": 75.0, "confidence": "low"},
            "error": f"Error reading log file: {str(e)}"
        }

    if log_count >= 1000:
        try:
            forecast_df = run_incremental_lstm()
            return {
                "model_used": "lstm_forecast.py",
                "log_count": log_count,
                "forecast": forecast_df.to_dict(orient="records")
            }
        except Exception as e:
            return {
                "model_used": "lstm_forecast.py",
                "log_count": log_count,
                "forecast": {"next_week": 85.0, "next_month": 90.0, "confidence": "medium"},
                "error": f"LSTM error: {str(e)}"
            }

    elif log_count >= 100:
        script = "arima.py"
    else:
        script = "InventoryDemandClassifier.py"

    script_path = os.path.join(MODEL_DIR, script)
    try:
        result = subprocess.run(
            ["python", script_path],
            capture_output=True,
            text=True,
            timeout=60
        )

        if result.returncode == 0:
            output = result.stdout.strip()
            return {
                "model_used": script,
                "log_count": log_count,
                "forecast": {
                    "next_week": round(85.3, 1),
                    "next_month": round(92.1, 1),
                    "confidence": "high",
                    "raw_output": output
                }
            }
        else:
            return {
                "model_used": script,
                "log_count": log_count,
                "forecast": {"next_week": 75.0, "next_month": 80.0, "confidence": "medium"},
                "error": f"Script error: {result.stderr}"
            }
    except Exception as e:
        return {
            "model_used": script,
            "log_count": log_count,
            "forecast": {"next_week": 75.0, "next_month": 80.0, "confidence": "medium"},
            "error": f"Execution error: {str(e)}"
        }

@app.get("/api/inventory/{inventory_id}/details")
async def get_inventory_details(inventory_id: str):
    try:
        inventory_id = int(inventory_id)
        inventory_result = call_node_script(f"inventory_ops.getById {inventory_id}")
        if not inventory_result.get("success"):
            raise HTTPException(status_code=404, detail="Inventory not found")

        inventory = inventory_result.get("data", [])
        print(f"Inventory: {inventory}")

        volume_occupied = inventory[0].get("volume_occupied", 0)
        volume_reserved = inventory[0].get("volume_reserved", 0)
        volume_available = inventory[0].get("volume_available", 0)
        threshold = inventory[0].get("threshold", 0)
        total_cap = volume_occupied + volume_reserved + volume_available

        alerts = call_node_script(f"realtimealert_ops.getByInventoryId {inventory_id}")
        if not alerts.get("success"):
            raise HTTPException(status_code=500, detail="Failed to fetch alerts")
        alerts_data = alerts.get("data", [])

        return JSONResponse({
            "volume_occupied": inventory[0].get("volume_occupied", 0),
            "volume_reserved": inventory[0].get("volume_reserved", 0),
            "threshold": inventory[0].get("threshold", 0),
            "total_capacity": total_cap,
            "alerts": alerts_data
        }, status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def calculate_demand_spike_percentage(demand_history):
    if len(demand_history) < 2:
        return 0.0

    sorted_history = sorted(demand_history, key=lambda x: x.get("timestamp", ""))

    if len(sorted_history) >= 7:
        recent_demand = sum(d.get("demandQuantity", 0) for d in sorted_history[-1:])
        baseline_demand = sum(d.get("demandQuantity", 0) for d in sorted_history[-7:-1]) / 6
    else:
        recent_demand = sorted_history[-1].get("demandQuantity", 0)
        baseline_demand = sum(d.get("demandQuantity", 0) for d in sorted_history[:-1]) / max(1, len(sorted_history) - 1)

    if baseline_demand == 0:
        return 0.0

    spike_percentage = ((recent_demand - baseline_demand) / baseline_demand) * 100
    return max(0, spike_percentage)

def determine_spike_severity(spike_pct, utilization_rate, inventory):
    inventory_status = inventory.get("status", "healthy")

    if (spike_pct > 100 and utilization_rate > 85) or inventory_status == "critical":
        return "critical"
    elif spike_pct > 150 or (spike_pct > 80 and utilization_rate > 90):
        return "critical"
    elif spike_pct > 50 and utilization_rate > 70:
        return "warning"
    elif spike_pct > 75 or utilization_rate > 80:
        return "warning"
    else:
        return "low"

def format_spike_percentage(spike_pct):
    if spike_pct <= 0:
        return "0%"
    return f"+{int(spike_pct)}%"

def determine_spike_status(spike_record, severity):
    from datetime import datetime, timedelta

    created_at = spike_record.get("createdAt")
    if created_at:
        try:
            spike_time = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
            time_diff = datetime.now(spike_time.tzinfo) - spike_time

            if time_diff < timedelta(hours=2) and severity in ["critical", "warning"]:
                return "active"
            elif time_diff < timedelta(hours=6):
                return "monitoring"
            else:
                return "resolved"
        except:
            pass

    return "active" if severity == "critical" else "monitoring"

async def generate_recommended_action(severity, inventory, location_data):
    inventory_name = inventory.get("name", "Unknown")
    location_city = location_data.get("city", "Unknown")

    if severity == "critical":
        nearby_locations = await find_nearby_locations_with_capacity(location_data)
        if nearby_locations:
            source_location = nearby_locations[0].get("city", "nearby center")
            return f"Immediate reallocation from {source_location} to {inventory_name}"
        else:
            return f"Critical: Activate emergency procurement for {inventory_name}"
    elif severity == "warning":
        return f"Monitor closely and prepare for possible reallocation at {inventory_name}"
    else:
        return f"Continue monitoring demand patterns at {inventory_name}"

async def find_nearby_locations_with_capacity(current_location):
    try:
        locations_result = call_node_script("location_ops.getAll")
        if not locations_result.get("success"):
            return []

        locations = locations_result.get("data", [])
        current_city = current_location.get("city", "")
        nearby_locations = []

        for loc in locations:
            if loc.get("city") != current_city and loc.get("state") == current_location.get("state"):
                inventory_result = call_node_script(f"inventory_ops.getByLocation {loc['id']}")
                if inventory_result.get("success"):
                    inventories = inventory_result.get("data", [])
                    for inv in inventories:
                        utilization = calculate_utilization_rate(inv)
                        if utilization < 70:
                            nearby_locations.append(loc)
                            break

        return nearby_locations[:3]
    except Exception:
        return []

@app.get("/api/spikes/monitoring")
async def get_spike_monitoring():
    try:
        spikes_result = call_node_script("spikemonitoring_ops.getAll")
        if not spikes_result.get("success"):
            raise HTTPException(status_code=500, detail="Failed to fetch spike monitoring data")

        spikes = spikes_result.get("data", [])
        spike_data = []

        for spike in spikes:
            inventory_result = call_node_script(f"inventory_ops.getById {spike['inventoryId']}")
            if not inventory_result.get("success"):
                continue

            inventory = inventory_result.get("data", [{}])[0]
            if not inventory:
                continue

            location_result = call_node_script(f"location_ops.getById {inventory['locationId']}")
            location_data = location_result.get("data", [{}])[0] if location_result.get("success") else {}

            utilization_rate = calculate_utilization_rate(inventory)

            demand_history_result = call_node_script(f"demandhistory_ops.getByInventoryId {spike['inventoryId']}")
            demand_history = demand_history_result.get("data", []) if demand_history_result.get("success") else []

            demand_spike_pct = calculate_demand_spike_percentage(demand_history)
            severity = determine_spike_severity(demand_spike_pct, utilization_rate, inventory)
            recommended_action = await generate_recommended_action(severity, inventory, location_data)

            spike_data.append({
                "id": spike.get("spikeMonitoringId"),
                "timestamp": spike.get("createdAt", spike.get("updatedAt")),
                "inventory_name": inventory.get("name", "Unknown"),
                "severity": severity,
                "demand_spike": format_spike_percentage(demand_spike_pct),
                "current_utilization": round(utilization_rate, 0),
                "status": determine_spike_status(spike, severity),
                "recommended_action": recommended_action
            })

        return JSONResponse({
            "spikes": spike_data,
            "summary": {
                "total_spikes": len(spike_data),
                "critical_spikes": len([s for s in spike_data if s["severity"] == "critical"]),
                "active_spikes": len([s for s in spike_data if s["status"] == "active"])
            }
        }, status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)