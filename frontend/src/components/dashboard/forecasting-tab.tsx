import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Search,
  Calendar,
  BarChart3,
  Package,
  MapPin,
  Clock,
  Target,
  Activity,
  RefreshCw,
  Download,
  Filter,
  Eye,
  Settings,
  ChevronRight,
  ChevronDown
} from "lucide-react"

export function InventoryTab() {
  const [searchTerm, setSearchTerm] = useState("")
  const [locationFilter, setLocationFilter] = useState("all")
  const [timeRange, setTimeRange] = useState("30days")
  const [selectedMetric, setSelectedMetric] = useState("utilization")
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set())

  // Sample inventory data - replace with actual API call
  const inventoryData = [
    {
      id: 1,
      inventoryName: "Hyderabad MFC",
      location: "Hyderabad",
      volumeOccupied: 8900,
      volumeReserved: 1200,
      threshold: 9500,
      totalCapacity: 12000,
      utilizationRate: 74.2,
      trend: "increasing",
      trendPercentage: 12.5,
      status: "optimal",
      description: "Main fulfillment center serving South India region",
      lastUpdated: "2024-01-15 14:30:00",
      forecast: {
        nextWeek: 85.3,
        nextMonth: 92.1,
        confidence: "high"
      },
      alerts: []
    },
    {
      id: 2,
      inventoryName: "Mumbai Main Inventory",
      location: "Mumbai",
      volumeOccupied: 10200,
      volumeReserved: 800,
      threshold: 11000,
      totalCapacity: 13500,
      utilizationRate: 81.5,
      trend: "stable",
      trendPercentage: 2.1,
      status: "warning",
      description: "Primary inventory hub for Western region operations",
      lastUpdated: "2024-01-15 14:25:00",
      forecast: {
        nextWeek: 83.7,
        nextMonth: 88.9,
        confidence: "medium"
      },
      alerts: ["Approaching capacity threshold"]
    },
    {
      id: 3,
      inventoryName: "Delhi Central Inventory",
      location: "Delhi",
      volumeOccupied: 7800,
      volumeReserved: 1500,
      threshold: 8500,
      totalCapacity: 11000,
      utilizationRate: 84.5,
      trend: "decreasing",
      trendPercentage: -5.3,
      status: "critical",
      description: "Central distribution center for North India",
      lastUpdated: "2024-01-15 14:20:00",
      forecast: {
        nextWeek: 78.2,
        nextMonth: 75.6,
        confidence: "high"
      },
      alerts: ["High utilization", "Reallocation recommended"]
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal': return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800'
      case 'warning': return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800'
      case 'critical': return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800'
      default: return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'optimal': return <CheckCircle className="h-4 w-4" />
      case 'warning': return <AlertTriangle className="h-4 w-4" />
      case 'critical': return <AlertTriangle className="h-4 w-4" />
      default: return null
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
      case 'decreasing': return <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
      case 'stable': return <Activity className="h-4 w-4 text-gray-600 dark:text-gray-400" />
      default: return null
    }
  }

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 85) return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/30'
    if (utilization >= 70) return 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/30'
    return 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/30'
  }

  const getProgressColor = (utilization: number) => {
    if (utilization >= 85) return 'bg-red-500 dark:bg-red-400'
    if (utilization >= 70) return 'bg-amber-500 dark:bg-amber-400'
    return 'bg-emerald-500 dark:bg-emerald-400'
  }

  const toggleCardExpansion = (id: number) => {
    const newExpanded = new Set(expandedCards)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedCards(newExpanded)
  }

  const filteredInventory = inventoryData.filter(inventory => {
    const matchesSearch = inventory.inventoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inventory.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLocation = locationFilter === 'all' || inventory.location.toLowerCase() === locationFilter
    return matchesSearch && matchesLocation
  })

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">Inventory Forecasting</h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Monitor and manage your inventory across all locations with predictive analytics</p>
        </div>
        
        <div className="flex items-center space-x-8 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-emerald-500 dark:bg-emerald-400 rounded-full"></div>
            <span className="text-gray-700 dark:text-gray-300">
              <span className="font-semibold">{filteredInventory.filter(i => i.status === 'optimal').length}</span> Optimal
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-amber-500 dark:bg-amber-400 rounded-full"></div>
            <span className="text-gray-700 dark:text-gray-300">
              <span className="font-semibold">{filteredInventory.filter(i => i.status === 'warning').length}</span> Warning
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 dark:bg-red-400 rounded-full"></div>
            <span className="text-gray-700 dark:text-gray-300">
              <span className="font-semibold">{filteredInventory.filter(i => i.status === 'critical').length}</span> Critical
            </span>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <Card className="border border-gray-200 dark:border-gray-700 dark:bg-gray-800/50">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
                <Input
                  placeholder="Search inventory or location..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 focus:border-blue-300 dark:focus:border-blue-500 focus:ring-blue-200 dark:focus:ring-blue-800"
                />
              </div>
              
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-full sm:w-48 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100">
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
                  <SelectItem value="all" className="dark:text-gray-100 dark:focus:bg-gray-700">All Locations</SelectItem>
                  <SelectItem value="hyderabad" className="dark:text-gray-100 dark:focus:bg-gray-700">Hyderabad</SelectItem>
                  <SelectItem value="mumbai" className="dark:text-gray-100 dark:focus:bg-gray-700">Mumbai</SelectItem>
                  <SelectItem value="delhi" className="dark:text-gray-100 dark:focus:bg-gray-700">Delhi</SelectItem>
                </SelectContent>
              </Select>

              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-full sm:w-48 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100">
                  <SelectValue placeholder="Time Range" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
                  <SelectItem value="7days" className="dark:text-gray-100 dark:focus:bg-gray-700">Last 7 Days</SelectItem>
                  <SelectItem value="30days" className="dark:text-gray-100 dark:focus:bg-gray-700">Last 30 Days</SelectItem>
                  <SelectItem value="90days" className="dark:text-gray-100 dark:focus:bg-gray-700">Last 90 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" className="flex items-center space-x-2 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </Button>
              <Button variant="outline" size="sm" className="flex items-center space-x-2 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                <Download className="h-4 w-4" />
                <span>Export</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Cards */}
      <div className="grid gap-6">
        {filteredInventory.map((inventory) => (
          <Card key={inventory.id} className="border border-gray-200 dark:border-gray-700 dark:bg-gray-800/50 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-gray-900/20 transition-shadow">
            <CardContent className="p-6">
              {/* Collapsed View */}
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleCardExpansion(inventory.id)}
              >
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    {expandedCards.has(inventory.id) ? 
                      <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-400" /> : 
                      <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    }
                  </Button>
                  
                  <div className="space-y-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{inventory.inventoryName}</h3>
                      <Badge className={`${getStatusColor(inventory.status)} flex items-center space-x-1`}>
                        {getStatusIcon(inventory.status)}
                        <span className="capitalize">{inventory.status}</span>
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                      <MapPin className="h-4 w-4" />
                      <span>{inventory.location}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-8">
                  {/* Progress Bar */}
                  <div className="space-y-2 min-w-[200px]">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Utilization</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{inventory.utilizationRate}%</span>
                    </div>
                    <div className="relative">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${getProgressColor(inventory.utilizationRate)}`}
                          style={{ width: `${inventory.utilizationRate}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right space-y-1">
                    <div className="flex items-center space-x-1">
                      {getTrendIcon(inventory.trend)}
                      <span className={`text-lg font-semibold ${
                        inventory.trend === 'increasing' ? 'text-emerald-600 dark:text-emerald-400' : 
                        inventory.trend === 'decreasing' ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {inventory.trend === 'stable' ? '±' : inventory.trend === 'increasing' ? '+' : ''}{inventory.trendPercentage}%
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">7-day trend</div>
                  </div>

                  <div className="text-right space-y-1">
                    <div className="text-sm text-gray-900 dark:text-gray-100">{inventory.lastUpdated}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Last updated</div>
                  </div>
                </div>
              </div>

              {/* Expanded View */}
              {expandedCards.has(inventory.id) && (
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-6">
                  <p className="text-gray-600 dark:text-gray-400">{inventory.description}</p>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                        <Package className="h-4 w-4" />
                        <span>Volume Occupied</span>
                      </div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {inventory.volumeOccupied.toLocaleString()} m³
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                        <Target className="h-4 w-4" />
                        <span>Volume Reserved</span>
                      </div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {inventory.volumeReserved.toLocaleString()} m³
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                        <AlertTriangle className="h-4 w-4" />
                        <span>Threshold</span>
                      </div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {inventory.threshold.toLocaleString()} m³
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                        <BarChart3 className="h-4 w-4" />
                        <span>Total Capacity</span>
                      </div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {inventory.totalCapacity.toLocaleString()} m³
                      </div>
                    </div>
                  </div>

                  {/* Forecast Section */}
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6 border dark:border-gray-700">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5" />
                      <span>Forecast Analytics</span>
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <div className="text-sm text-gray-600 dark:text-gray-400">Next Week Prediction</div>
                        <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{inventory.forecast.nextWeek}%</div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm text-gray-600 dark:text-gray-400">Next Month Prediction</div>
                        <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{inventory.forecast.nextMonth}%</div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm text-gray-600 dark:text-gray-400">Confidence Level</div>
                        <Badge variant="outline" className={`${
                          inventory.forecast.confidence === 'high' ? 'text-emerald-700 border-emerald-200 dark:text-emerald-400 dark:border-emerald-800' :
                          inventory.forecast.confidence === 'medium' ? 'text-amber-700 border-amber-200 dark:text-amber-400 dark:border-amber-800' :
                          'text-red-700 border-red-200 dark:text-red-400 dark:border-red-800'
                        }`}>
                          {inventory.forecast.confidence.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Alerts Section */}
                  {inventory.alerts.length > 0 && (
                    <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                      <h5 className="font-medium text-amber-800 dark:text-amber-400 mb-2 flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4" />
                        <span>Active Alerts</span>
                      </h5>
                      <ul className="space-y-1">
                        {inventory.alerts.map((alert, index) => (
                          <li key={index} className="text-sm text-amber-700 dark:text-amber-300">• {alert}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <Button variant="outline" size="sm" className="flex items-center space-x-2 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                      <Eye className="h-4 w-4" />
                      <span>View Details</span>
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center space-x-2 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                      <Settings className="h-4 w-4" />
                      <span>Configure</span>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Dashboard */}
      <Card className="border border-gray-200 dark:border-gray-700 dark:bg-gray-800/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl flex items-center space-x-2 text-gray-900 dark:text-gray-100">
            <BarChart3 className="h-5 w-5" />
            <span>Inventory Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {filteredInventory.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Locations</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {Math.round(filteredInventory.reduce((acc, inv) => acc + inv.utilizationRate, 0) / filteredInventory.length)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg Utilization</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {filteredInventory.reduce((acc, inv) => acc + inv.totalCapacity, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Capacity (m³)</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                {filteredInventory.reduce((acc, inv) => acc + inv.alerts.length, 0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Active Alerts</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
