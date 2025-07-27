import json
import subprocess
import time

def stress_test_load_balancer():
    num_inventories = 100000
    
    stress_test_case = {
        "from inv": 1,
        "upcoming quantity": {},
        "distance from_inv": {},
        "current_demand": {},
        "forecasted_demand": {},
        "volume_free": {},
        "threshold_for_alert": {}
    }
    
    for i in range(1, num_inventories + 1):
        inv_id = str(i)
        
        if i == 1:
            stress_test_case["upcoming quantity"][inv_id] = 10000  # Way above threshold
            stress_test_case["distance from_inv"][inv_id] = 0
            stress_test_case["current_demand"][inv_id] = 500
            stress_test_case["forecasted_demand"][inv_id] = 600
            stress_test_case["volume_free"][inv_id] = 100
            stress_test_case["threshold_for_alert"][inv_id] = 1000  # Excess = 9000
        else:
            stress_test_case["upcoming quantity"][inv_id] = 50 + (i * 10) % 200
            stress_test_case["distance from_inv"][inv_id] = 1 + (i * 3) % 50
            stress_test_case["current_demand"][inv_id] = 20 + (i * 5) % 100
            stress_test_case["forecasted_demand"][inv_id] = 25 + (i * 7) % 120
            stress_test_case["volume_free"][inv_id] = 10 + (i * 4) % 80
            stress_test_case["threshold_for_alert"][inv_id] = 100 + (i * 8) % 300
    
    executable = "cpp_codes/load_balancer"
    
    print("=== STRESS TEST: 100 INVENTORY NETWORK ===")
    print(f"Source inventory load: {stress_test_case['upcoming quantity']['1']}")
    print(f"Source threshold: {stress_test_case['threshold_for_alert']['1']}")
    print(f"Excess load to relocate: {stress_test_case['upcoming quantity']['1'] - stress_test_case['threshold_for_alert']['1']}")
    print(f"Total inventories: {num_inventories}")
    
    compile_cmd = f"g++ -std=c++17 -O2 -o {executable} cpp_codes/load_balancer.cpp"
    
    try:
        result = subprocess.run(compile_cmd, shell=True, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"Compilation failed: {result.stderr}")
            return
        print("✅ Compilation successful with O2 optimization!")
    except Exception as e:
        print(f"Error during compilation: {e}")
        return
    
    json_input = json.dumps(stress_test_case)
    print(f"\nJSON input size: {len(json_input)} characters")
    
    try:
        start_time = time.time()
        
        result = subprocess.run(
            [executable], 
            input=json_input, 
            text=True, 
            capture_output=True,
            timeout=30  
        )
        
        end_time = time.time()
        execution_time = end_time - start_time
        
        print(f"\n⏱️  Execution time: {execution_time:.4f} seconds")
        print(f"📊 Performance: {num_inventories/execution_time:.0f} inventories/second")
        
        print("\n" + "="*50)
        print("STRESS TEST OUTPUT:")
        print("="*50)
        print(result.stdout)
        
        if result.returncode >= 0:
            if result.returncode > 0:
                print(f"✅ STRESS TEST PASSED - Target inventory: {result.returncode}")
            else:
                print(f"✅ STRESS TEST PASSED - No relocation needed")
        else:
            print(f"❌ STRESS TEST FAILED - Return code: {result.returncode}")
            
        if result.stderr:
            print(f"⚠️  Errors: {result.stderr}")
            
        print(f"\n📈 PERFORMANCE ANALYSIS:")
        print(f"   • Inventories processed: {num_inventories}")
        print(f"   • Execution time: {execution_time:.4f}s")
        print(f"   • Throughput: {num_inventories/execution_time:.0f} inventories/sec")
        print(f"   • Memory efficiency: Handled {len(json_input)} chars of JSON")
        
        if execution_time < 1.0:
            print(f"   • 🚀 EXCELLENT: Sub-second performance!")
        elif execution_time < 5.0:
            print(f"   • ✅ GOOD: Reasonable performance")
        else:
            print(f"   • ⚠️  SLOW: May need optimization")
            
    except subprocess.TimeoutExpired:
        print("❌ STRESS TEST FAILED: Timed out after 30 seconds")
    except Exception as e:
        print(f"❌ STRESS TEST FAILED: {e}")
    
    try:
        import os
        if os.path.exists(executable):
            os.remove(executable)
            print(f"\nCleaned up executable: {executable}")
    except:
        pass

if __name__ == "__main__":
    stress_test_load_balancer()

# this was the sample output:
# Target Inventory: 17
# Score: 63.930
# Target inventory 17 analysis:
# Current load: 220
# Threshold: 236
# Available capacity: 16
# Free space: 78
# Relocating 16 units from inventory 1 to inventory 17
# Source inventory 1: 9984 units (was 10000)
# Target inventory 17: 236 units (was 220)

# WARNING: Could not relocate all excess load. Remaining excess: 8984 units

# ✅ STRESS TEST PASSED - Target inventory: 17

# 📈 PERFORMANCE ANALYSIS:
#    • Inventories processed: 100
#    • Execution time: 0.0025s
#    • Throughput: 39442 inventories/sec
#    • Memory efficiency: Handled 6319 chars of JSON
#    • 🚀 EXCELLENT: Sub-second performance!

# Cleaned up executable: cpp_codes/load_balancer

# fucking 0.0025 seconds to process 100 inventories! how the fuck bruh
