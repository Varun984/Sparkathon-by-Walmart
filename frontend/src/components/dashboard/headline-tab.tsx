import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, RefreshCw, CheckCircle, TrendingUp, AlertTriangle, Bell } from "lucide-react"
import { useNotifications } from "@/hooks/use-notifications"

export function HeadlineTab() {
  const { addNotification } = useNotifications()

  const triggerDemoNotification = () => {
    const demoNotifications = [
      {
        title: "Inventory Alert",
        message: "Low stock detected in Electronics department - Store #1234",
        type: "warning" as const
      },
      {
        title: "Redistribution Complete",
        message: "Successfully moved 200 units from Store A to Store B",
        type: "success" as const
      },
      {
        title: "Demand Spike",
        message: "Unusual buying pattern detected in Home & Garden category",
        type: "error" as const
      },
      {
        title: "System Update",
        message: "Inventory forecasting model updated with new data",
        type: "info" as const
      }
    ]
    
    const randomNotification = demoNotifications[Math.floor(Math.random() * demoNotifications.length)]
    addNotification(randomNotification)
  }

  const stats = [
    {
      title: "Migrated",
      value: "2,847",
      change: "+12%",
      icon: Package,
      description: "Items redistributed this week",
      color: "text-primary"
    },
    {
      title: "Reallocated", 
      value: "1,532",
      change: "+8%",
      icon: RefreshCw,
      description: "Inventory rebalanced today",
      color: "text-accent"
    },
    {
      title: "Saved",
      value: "$45.2K",
      change: "+15%",
      icon: CheckCircle,
      description: "Cost savings this month",
      color: "text-success"
    },
    {
      title: "Critical Alerts",
      value: "7",
      change: "-3",
      icon: AlertTriangle,
      description: "Requiring immediate attention",
      color: "text-destructive"
    }
  ]

  return (
    <div className="space-y-6 p-6">
      {/* Demo Notification Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Dashboard Overview</h2>
          <p className="text-muted-foreground">Real-time inventory management statistics</p>
        </div>
        <Button 
          onClick={triggerDemoNotification}
          variant="outline"
          className="gap-2"
        >
          <Bell className="h-4 w-4" />
          Test Notification
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="transition-all duration-300 hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <Badge 
                    variant={stat.change.startsWith('+') ? 'default' : 'destructive'}
                    className="text-xs"
                  >
                    {stat.change}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
        
        {/* Recent Activity */}
        <Card className="md:col-span-2 lg:col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-accent" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { time: "2 min ago", action: "Spike detected in Hyderabad MFC", status: "critical" },
                { time: "5 min ago", action: "Reallocated 150 units from Mumbai to Delhi", status: "success" },
                { time: "12 min ago", action: "Stock threshold reached for Product SKU-4521", status: "warning" },
                { time: "18 min ago", action: "Successfully migrated 200 units", status: "success" },
              ].map((activity, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.status === 'critical' ? 'bg-destructive' :
                      activity.status === 'warning' ? 'bg-warning' : 'bg-success'
                    }`} />
                    <span className="text-sm">{activity.action}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}