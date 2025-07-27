import { useState } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertTriangle,
  TrendingUp,
  CheckCircle,
  Search,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Warehouse,
  Activity,
  Clock,
  MapPin,
  Zap,
  Eye,
  MoreHorizontal
} from "lucide-react"

export function SpikeMonitoringTab() {
  const [searchTerm, setSearchTerm] = useState("")
  const [severityFilter, setSeverityFilter] = useState("all")
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 4

  // TODO: Replace with actual API call to backend route
  // const { data: spikeData } = useQuery('/api/spike-monitoring')

  const spikes = [
    {
      id: 1,
      timestamp: "2024-01-15 14:23:12",
      inventoryName: "Hyderabad MFC",
      location: "Hyderabad",
      severity: "critical",
      demandSpike: "+145%",
      currentUtilization: 89,
      recommendedAction: "Immediate reallocation from Mumbai MFC",
      status: "active",
      details: {
        triggerReason: "Regional festival demand surge",
        expectedDuration: "2-4 hours",
        affectedCapacity: "1,200 m³",
        transferRecommendation: "800 m³ from Mumbai MFC",
        estimatedResolution: "6 hours"
      }
    },
    {
      id: 2,
      timestamp: "2024-01-15 13:45:08",
      inventoryName: "Mumbai Main Inventory",
      location: "Mumbai",
      severity: "warning",
      demandSpike: "+67%",
      currentUtilization: 74,
      recommendedAction: "Monitor closely, prepare for reallocation",
      status: "monitoring",
      details: {
        triggerReason: "E-commerce promotion campaign",
        expectedDuration: "6-8 hours",
        affectedCapacity: "900 m³",
        transferRecommendation: "500 m³ from Delhi MFC",
        estimatedResolution: "4 hours"
      }
    },
    {
      id: 3,
      timestamp: "2024-01-15 12:18:33",
      inventoryName: "Delhi Central Inventory",
      location: "Delhi",
      severity: "resolved",
      demandSpike: "+89%",
      currentUtilization: 65,
      recommendedAction: "Spike resolved - normal operations resumed",
      status: "resolved",
      details: {
        triggerReason: "Temporary supply chain disruption",
        expectedDuration: "1-2 hours",
        affectedCapacity: "600 m³",
        transferRecommendation: "No action required",
        estimatedResolution: "Completed"
      }
    }
  ]

  // Pagination logic
  const filteredSpikes = spikes.filter(spike => {
    const matchesSearch = spike.inventoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      spike.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSeverity = severityFilter === 'all' || spike.severity === severityFilter
    return matchesSearch && matchesSeverity
  })

  const totalPages = Math.ceil(filteredSpikes.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentSpikes = filteredSpikes.slice(startIndex, endIndex)

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4" />
      case 'warning': return <TrendingUp className="h-4 w-4" />
      case 'resolved': return <CheckCircle className="h-4 w-4" />
      default: return null
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-50 text-red-700 border-red-100 hover:bg-red-100 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/50'
      case 'warning': return 'bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800 dark:hover:bg-amber-900/50'
      case 'resolved': return 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800 dark:hover:bg-emerald-900/50'
      default: return 'bg-gray-50 text-gray-700 border-gray-100 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700'
    }
  }

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 85) return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/30'
    if (utilization >= 70) return 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/30'
    return 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/30'
  }

  const toggleRowExpansion = (id: number) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedRows(newExpanded)
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">Spike Monitoring</h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Real-time inventory demand spike detection and management</p>
        </div>
        
        <div className="flex items-center space-x-8 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 dark:bg-red-400 rounded-full"></div>
            <span className="text-gray-700 dark:text-gray-300">
              <span className="font-semibold">{filteredSpikes.filter(s => s.status === 'active').length}</span> Active
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-amber-500 dark:bg-amber-400 rounded-full"></div>
            <span className="text-gray-700 dark:text-gray-300">
              <span className="font-semibold">{filteredSpikes.filter(s => s.status === 'monitoring').length}</span> Monitoring
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-emerald-500 dark:bg-emerald-400 rounded-full"></div>
            <span className="text-gray-700 dark:text-gray-300">
              <span className="font-semibold">{filteredSpikes.filter(s => s.status === 'resolved').length}</span> Resolved
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="border border-gray-200 dark:border-gray-700 dark:bg-gray-800/50">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
              <Input
                placeholder="Search by inventory or location..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 focus:border-blue-300 dark:focus:border-blue-500 focus:ring-blue-200 dark:focus:ring-blue-800"
              />
            </div>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-full sm:w-48 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100">
                <SelectValue placeholder="All Severities" />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
                <SelectItem value="all" className="dark:text-gray-100 dark:focus:bg-gray-700">All Severities</SelectItem>
                <SelectItem value="critical" className="dark:text-gray-100 dark:focus:bg-gray-700">Critical</SelectItem>
                <SelectItem value="warning" className="dark:text-gray-100 dark:focus:bg-gray-700">Warning</SelectItem>
                <SelectItem value="resolved" className="dark:text-gray-100 dark:focus:bg-gray-700">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Spike Events */}
      <div className="space-y-4">
        {currentSpikes.map((spike) => (
          <Card key={spike.id} className="border border-gray-200 dark:border-gray-700 dark:bg-gray-800/50 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-gray-900/20 transition-shadow">
            <CardContent className="p-6">
              {/* Main Row */}
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleRowExpansion(spike.id)}
              >
                <div className="flex items-center space-x-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    {expandedRows.has(spike.id) ? 
                      <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-400" /> : 
                      <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    }
                  </Button>
                  
                  <div className="space-y-1">
                    <div className="font-semibold text-lg text-gray-900 dark:text-gray-100">{spike.inventoryName}</div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                      <MapPin className="h-4 w-4" />
                      <span>{spike.location}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="text-right space-y-1">
                    <div className="font-semibold text-lg text-gray-900 dark:text-gray-100">{spike.demandSpike}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Demand Spike</div>
                  </div>
                  
                  <div className="text-right space-y-1">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getUtilizationColor(spike.currentUtilization)}`}>
                      {spike.currentUtilization}%
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Utilization</div>
                  </div>

                  <Badge className={`${getSeverityColor(spike.severity)} flex items-center space-x-1`}>
                    {getSeverityIcon(spike.severity)}
                    <span className="capitalize">{spike.severity}</span>
                  </Badge>

                  <div className="text-right space-y-1">
                    <div className="text-sm text-gray-900 dark:text-gray-100">{spike.timestamp}</div>
                    <Badge variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-300">
                      {spike.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                <strong className="text-gray-900 dark:text-gray-100">Recommended Action:</strong> {spike.recommendedAction}
              </div>

              {/* Expanded Details */}
              {expandedRows.has(spike.id) && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <AlertTriangle className="h-5 w-5 text-gray-400 dark:text-gray-500 mt-0.5" />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">Trigger Reason</div>
                          <div className="text-gray-600 dark:text-gray-400">{spike.details.triggerReason}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <Clock className="h-5 w-5 text-gray-400 dark:text-gray-500 mt-0.5" />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">Expected Duration</div>
                          <div className="text-gray-600 dark:text-gray-400">{spike.details.expectedDuration}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <Warehouse className="h-5 w-5 text-gray-400 dark:text-gray-500 mt-0.5" />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">Affected Capacity</div>
                          <div className="text-gray-600 dark:text-gray-400">{spike.details.affectedCapacity}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <Activity className="h-5 w-5 text-gray-400 dark:text-gray-500 mt-0.5" />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">Transfer Recommendation</div>
                          <div className="text-gray-600 dark:text-gray-400">{spike.details.transferRecommendation}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <Zap className="h-5 w-5 text-gray-400 dark:text-gray-500 mt-0.5" />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">Estimated Resolution</div>
                          <div className="text-gray-600 dark:text-gray-400">{spike.details.estimatedResolution}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {spike.status === 'active' && (
                    <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                      <Button variant="default" className="flex items-center space-x-2">
                        <Zap className="h-4 w-4" />
                        <span>Execute Transfer</span>
                      </Button>
                      <Button variant="outline" className="flex items-center space-x-2 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                        <CheckCircle className="h-4 w-4" />
                        <span>Mark as Resolved</span>
                      </Button>
                      <Button variant="ghost" className="flex items-center space-x-2 dark:text-gray-300 dark:hover:bg-gray-700">
                        <Eye className="h-4 w-4" />
                        <span>Ignore Alert</span>
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredSpikes.length)} of {filteredSpikes.length} spikes
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              variant="outline"
              size="sm"
              className="flex items-center space-x-1 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </Button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                onClick={() => setCurrentPage(page)}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                className={`w-8 h-8 p-0 ${currentPage !== page ? 'dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700' : ''}`}
              >
                {page}
              </Button>
            ))}
            
            <Button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              variant="outline"
              size="sm"
              className="flex items-center space-x-1 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Summary Card */}
      <Card className="border border-gray-200 dark:border-gray-700 dark:bg-gray-800/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl text-gray-900 dark:text-gray-100">Spike Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                {filteredSpikes.filter(s => s.severity === 'critical').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Critical Spikes</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                {filteredSpikes.filter(s => s.severity === 'warning').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Warning Level</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {filteredSpikes.filter(s => s.severity === 'resolved').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Resolved Today</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {Math.round(filteredSpikes.reduce((acc, spike) => acc + spike.currentUtilization, 0) / filteredSpikes.length)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg Utilization</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
