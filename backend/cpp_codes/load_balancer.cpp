#include <bits/stdc++.h>
#include "json.hpp"

using namespace std;
using json = nlohmann::json;

double calculate_score(int distance, int curr_demand, int forecast_demand, int volume_free) {
    // distance -> 0.18 (inverse relationship - closer is better)
    // current_demand -> 0.25 (higher demand = higher score)
    // forecasted_demand -> 0.18 (higher forecast = higher score)
    // volume_free -> 0.15 (more free space = higher score)
    
    double weighted_score = 0;
    weighted_score += 0.18 * (1.0 / (distance + 1)); 
    weighted_score += 0.25 * curr_demand;
    weighted_score += 0.18 * forecast_demand;
    weighted_score += 0.15 * volume_free;
    
    return weighted_score;
}

int find_best_relocation_target(const json& j, int from_inv_id) {
    json upcoming_quantity = j["upcoming quantity"];
    json distance_from_inv = j["distance from_inv"];
    json current_demand = j["current_demand"];
    json forecasted_demand = j["forecasted_demand"];
    json volume_free = j["volume_free"];
    json threshold_for_alert = j["threshold_for_alert"];
    
    vector<pair<int, double>> inventory_scores; 
    
    
    for (auto& el : upcoming_quantity.items()) {
        int inv_id = stoi(el.key());
        
        if (inv_id == from_inv_id) continue;
        
        string inv_key = to_string(inv_id);
        
        int distance = distance_from_inv[inv_key];
        int curr_d = current_demand[inv_key];
        int forecast_d = forecasted_demand[inv_key];
        int vol_free = volume_free[inv_key];
        
        double score = calculate_score(distance, curr_d, forecast_d, vol_free);
        inventory_scores.push_back({inv_id, score});
        
        cout << "Inventory " << inv_id << ": Score = " << fixed << setprecision(3) 
             << score << " (Distance: " << distance << ", Current Demand: " << curr_d 
             << ", Forecast: " << forecast_d << ", Free Space: " << vol_free << ")" << endl;
    }
    
    sort(inventory_scores.begin(), inventory_scores.end(), 
         [](const pair<int, double>& a, const pair<int, double>& b) {
             return a.second > b.second;
         });
    
    if (!inventory_scores.empty()) {
        int best_inv = inventory_scores[0].first;
        double best_score = inventory_scores[0].second;
        
        cout << "Target Inventory: " << best_inv << endl;
        cout << "Score: " << fixed << setprecision(3) << best_score << endl;
        
        return best_inv;
    }
    
    return -1;
}

bool check_threshold_exceeded(const json& j, int inv_id) {
    string inv_key = to_string(inv_id);
    int current_load = j["upcoming quantity"][inv_key];
    int threshold = j["threshold_for_alert"][inv_key];
    
    return current_load > threshold;
}

int main() {
    ostringstream inputBuffer;
    string line;
    
    while (getline(cin, line)) {
        inputBuffer << line << endl;
    }
    
    string input = inputBuffer.str();
    json j = json::parse(input);
    
    int from_inv = j["from inv"];
    string from_inv_key = to_string(from_inv);
    
    cout << "Source Inventory: " << from_inv << endl;
    
    if (!check_threshold_exceeded(j, from_inv)) {
        cout << "Source inventory " << from_inv << " is within threshold limits." << endl;
        cout << "Current load: " << j["upcoming quantity"][from_inv_key] << endl;
        cout << "Threshold: " << j["threshold_for_alert"][from_inv_key] << endl;
        cout << "No relocation needed." << endl;
        return 0;
    }
    
    int source_load = j["upcoming quantity"][from_inv_key];
    int source_threshold = j["threshold_for_alert"][from_inv_key];
    int excess_load = source_load - source_threshold;
    
    cout << "Current load: " << source_load << endl;
    cout << "Threshold: " << source_threshold << endl;
    cout << "Excess load to relocate: " << excess_load << endl;
    
    int target_inv = find_best_relocation_target(j, from_inv);
    
    if (target_inv == -1) {
        cout << "\nERROR: No valid relocation target found!" << endl;
        return -1;
    }
    
    string target_inv_key = to_string(target_inv);
    int target_free_space = j["volume_free"][target_inv_key];
    int target_current_load = j["upcoming quantity"][target_inv_key];
    int target_threshold = j["threshold_for_alert"][target_inv_key];
    int target_available_capacity = target_threshold - target_current_load;
    
    cout << "Target inventory " << target_inv << " analysis:" << endl;
    cout << "Current load: " << target_current_load << endl;
    cout << "Threshold: " << target_threshold << endl;
    cout << "Available capacity: " << target_available_capacity << endl;
    cout << "Free space: " << target_free_space << endl;
    
    int relocatable_amount = min({excess_load, target_available_capacity, target_free_space});
    
    if (relocatable_amount <= 0) {
        cout << "\nWARNING: Target inventory cannot accommodate any load!" << endl;
        return -1;
    }
    
    cout << "Relocating " << relocatable_amount << " units from inventory " 
         << from_inv << " to inventory " << target_inv << endl;
    
    cout << "Source inventory " << from_inv << ": " 
         << (source_load - relocatable_amount) << " units (was " << source_load << ")" << endl;
    cout << "Target inventory " << target_inv << ": " 
         << (target_current_load + relocatable_amount) << " units (was " << target_current_load << ")" << endl;
    
    if (relocatable_amount < excess_load) {
        cout << "\nWARNING: Could not relocate all excess load. Remaining excess: " 
             << (excess_load - relocatable_amount) << " units" << endl;
    }
    
    return target_inv;
}
