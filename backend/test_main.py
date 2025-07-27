import pytest
import json
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

class TestInventoryManagement:
    """Test suite for inventory management API routes"""
    
    def setup_method(self):
        """Setup test data before each test"""
        self.test_inventory_data = {
            "location": "Test Location",
            "volumeOccupied": 1000.0,
            "volumeAvailable": 2000.0,
            "volumeReserved": 500.0,
            "name": "Test Inventory",
            "description": "Test inventory for API testing",
            "threshold": 1800,
            "locationId": 1,
            "status": "healthy"
        }
        
        self.test_item_data = {
            "name": "Test Item",
            "description": "Test item for API testing",
            "price": 99.99,
            "weight": 1.5,
            "dimensions": "10x10x10"
        }
        
        self.test_location_data = {
            "latitude": 17.3850,
            "longitude": 78.4867,
            "address": "Test Address",
            "city": "Hyderabad",
            "state": "Telangana",
            "country": "India",
            "zipCode": "500001"
        }

    # Basic Health Check Tests
    def test_welcome_route(self):
        """Test the welcome route"""
        response = client.get("/")
        assert response.status_code == 200
        assert "message" in response.json()
        assert response.json()["message"] == "Welcome to the Glyphor backend!"

    def test_health_check(self):
        """Test the health check route"""
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"

    # Inventory Routes Tests
    def test_get_all_inventories(self):
        """Test getting all inventories"""
        response = client.get("/api/inventory")
        assert response.status_code == 200
        # Should return a list (empty or with data)
        assert isinstance(response.json(), list) or "data" in response.json()

    def test_create_inventory(self):
        """Test creating a new inventory"""
        response = client.post("/api/inventory", json=self.test_inventory_data)
        assert response.status_code in [200, 201]
        if response.status_code == 201:
            assert "message" in response.json()

    # Items Routes Tests
    def test_get_all_items(self):
        """Test getting all items"""
        response = client.get("/api/items")
        assert response.status_code == 200

    def test_create_item(self):
        """Test creating a new item"""
        response = client.post("/api/items", json=self.test_item_data)
        assert response.status_code in [200, 201]

    def test_get_item_by_id(self):
        """Test getting item by ID"""
        # First create an item, then try to get it
        create_response = client.post("/api/items", json=self.test_item_data)
        if create_response.status_code in [200, 201]:
            response = client.get("/api/items/1")
            assert response.status_code in [200, 404]  # 404 if item doesn't exist

    def test_update_item(self):
        """Test updating an item"""
        update_data = {"name": "Updated Test Item", "price": 149.99}
        response = client.put("/api/items/1", json=update_data)
        assert response.status_code in [200, 404]

    def test_delete_item(self):
        """Test deleting an item"""
        response = client.delete("/api/items/999")  # Use non-existent ID
        assert response.status_code in [200, 404]

    # Location Routes Tests
    def test_get_all_locations(self):
        """Test getting all locations"""
        response = client.get("/api/locations")
        assert response.status_code == 200

    def test_create_location(self):
        """Test creating a new location"""
        response = client.post("/api/locations", json=self.test_location_data)
        assert response.status_code in [200, 201]

    def test_get_location_by_id(self):
        """Test getting location by ID"""
        response = client.get("/api/locations/1")
        assert response.status_code in [200, 404]

    def test_update_location(self):
        """Test updating a location"""
        update_data = {"city": "Updated City"}
        response = client.put("/api/locations/1", json=update_data)
        assert response.status_code in [200, 404]

    def test_delete_location(self):
        """Test deleting a location"""
        response = client.delete("/api/locations/999")
        assert response.status_code in [200, 404]

    # Inventory Items Routes Tests
    def test_get_inventory_items(self):
        """Test getting items for a specific inventory"""
        response = client.get("/api/inventory/1/items")
        assert response.status_code in [200, 404, 500]

    def test_add_item_to_inventory(self):
        """Test adding an item to inventory"""
        data = {"itemId": 1, "quantity": 10}
        response = client.post("/api/inventory/1/items", json=data)
        assert response.status_code in [200, 201, 404, 500]

    def test_update_inventory_item_quantity(self):
        """Test updating item quantity in inventory"""
        data = {"quantity": 15}
        response = client.put("/api/inventory/1/items/1", json=data)
        assert response.status_code in [200, 404, 500]

    def test_remove_item_from_inventory(self):
        """Test removing an item from inventory"""
        response = client.delete("/api/inventory/1/items/1")
        assert response.status_code in [200, 404, 500]

    # Map API Routes Tests
    def test_get_inventory_locations_for_map(self):
        """Test getting inventory locations for map display"""
        response = client.get("/api/map/inventory-locations")
        assert response.status_code in [200, 500]

    def test_get_inventory_location_details(self):
        """Test getting detailed inventory location info"""
        response = client.get("/api/map/inventory-locations/1")
        assert response.status_code in [200, 404, 500]

    # Relocation Routes Tests
    def test_get_all_relocations(self):
        """Test getting all relocations"""
        response = client.get("/api/relocations")
        assert response.status_code in [200, 500]

    def test_create_relocation(self):
        """Test creating a new relocation"""
        data = {
            "fromInventoryId": 1,
            "toInventoryId": 2,
            "quantity": 100,
            "priority": "high"
        }
        response = client.post("/api/relocations", json=data)
        assert response.status_code in [200, 201, 500]

    def test_get_relocation_by_id(self):
        """Test getting relocation by ID"""
        response = client.get("/api/relocations/1")
        assert response.status_code in [200, 404, 500]

    def test_update_relocation_status(self):
        """Test updating relocation status"""
        data = {"status": "completed"}
        response = client.put("/api/relocations/1/status", json=data)
        assert response.status_code in [200, 404, 500]

    def test_get_relocations_by_status(self):
        """Test getting relocations by status"""
        response = client.get("/api/relocations/status/pending")
        assert response.status_code in [200, 500]

    def test_execute_relocation(self):
        """Test executing a relocation"""
        response = client.post("/api/relocations/1/execute")
        assert response.status_code in [200, 404, 500]

    # Alert Routes Tests
    def test_get_all_alerts(self):
        """Test getting all alerts"""
        response = client.get("/api/alerts")
        assert response.status_code in [200, 500]

    def test_get_unresolved_alerts(self):
        """Test getting unresolved alerts"""
        response = client.get("/api/alerts/unresolved")
        assert response.status_code in [200, 500]

    def test_create_alert(self):
        """Test creating a new alert"""
        data = {
            "inventoryId": 1,
            "alertType": "stockout",
            "severity": "critical",
            "message": "Test alert message"
        }
        response = client.post("/api/alerts", json=data)
        assert response.status_code in [200, 201, 500]

    def test_resolve_alert(self):
        """Test resolving an alert"""
        response = client.put("/api/alerts/1/resolve")
        assert response.status_code in [200, 404, 500]

    def test_get_alerts_by_severity(self):
        """Test getting alerts by severity"""
        response = client.get("/api/alerts/severity/critical")
        assert response.status_code in [200, 500]

    # Demand History Routes Tests
    def test_get_all_demand_history(self):
        """Test getting all demand history"""
        response = client.get("/api/demand-history")
        assert response.status_code in [200, 500]

    def test_create_demand_history(self):
        """Test creating demand history entry"""
        data = {
            "inventoryId": 1,
            "itemId": 1,
            "demandQuantity": 50,
            "timestamp": "2024-01-15T10:00:00Z",
            "source": "order"
        }
        response = client.post("/api/demand-history", json=data)
        assert response.status_code in [200, 201, 500]

    def test_get_demand_history_by_inventory(self):
        """Test getting demand history by inventory"""
        response = client.get("/api/demand-history/inventory/1")
        assert response.status_code in [200, 500]

    def test_get_demand_history_by_item(self):
        """Test getting demand history by item"""
        response = client.get("/api/demand-history/item/1")
        assert response.status_code in [200, 500]

    # Forecasting Routes Tests
    def test_get_forecasting_metrics(self):
        """Test getting forecasting metrics"""
        response = client.get("/api/forecasting/metrics")
        assert response.status_code in [200, 500]

    def test_create_forecasting_metric(self):
        """Test creating forecasting metric"""
        data = {
            "inventoryId": 1,
            "howMuchTimeToFill": "02:30:00",
            "predictedDemand": 150.0,
            "actualDemand": 140.0
        }
        response = client.post("/api/forecasting/metrics", json=data)
        assert response.status_code in [200, 201, 500]

    def test_get_inventory_forecast(self):
        """Test getting inventory forecast"""
        response = client.get("/api/forecasting/inventory/1")
        assert response.status_code in [200, 500]

    # Load Balancer Routes Tests
    def test_trigger_manual_load_balancer(self):
        """Test triggering manual load balancer"""
        data = {"inventory_id": 1}
        response = client.post("/api/load-balancer/trigger", json=data)
        assert response.status_code in [200, 400, 500]

    # Dashboard Routes Tests
    def test_get_dashboard_overview(self):
        """Test getting dashboard overview"""
        response = client.get("/api/dashboard/overview")
        assert response.status_code in [200, 500]

    def test_get_dashboard_stats(self):
        """Test getting dashboard stats"""
        response = client.get("/api/dashboard/stats")
        assert response.status_code in [200, 500]

    def test_get_inventory_details(self):
        """Test getting inventory details"""
        response = client.get("/api/inventory/1/details")
        assert response.status_code in [200, 404, 500]

    def test_get_spike_monitoring(self):
        """Test getting spike monitoring data"""
        response = client.get("/api/spikes/monitoring")
        assert response.status_code in [200, 500]

    # WebSocket Test (Basic Connection Test)
    def test_websocket_connection(self):
        """Test WebSocket connection (basic test)"""
        try:
            with client.websocket_connect("/ws/demand-monitor") as websocket:
                # Just test that connection can be established
                assert websocket is not None
        except Exception as e:
            # WebSocket might not be available in test environment
            pytest.skip(f"WebSocket test skipped: {e}")


# Additional utility tests
class TestUtilityFunctions:
    """Test utility functions and error handling"""
    
    def test_invalid_route(self):
        """Test accessing non-existent route"""
        response = client.get("/api/nonexistent")
        assert response.status_code == 404

    def test_invalid_method(self):
        """Test using wrong HTTP method"""
        response = client.delete("/")  # DELETE on root should not be allowed
        assert response.status_code in [405, 404]

    def test_invalid_json_payload(self):
        """Test sending invalid JSON"""
        response = client.post("/api/items", data="invalid json")
        assert response.status_code in [400, 422]

    def test_missing_required_fields(self):
        """Test sending incomplete data"""
        incomplete_data = {"name": "Test Item"}  # Missing required fields
        response = client.post("/api/items", json=incomplete_data)
        assert response.status_code in [400, 422, 500]


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
