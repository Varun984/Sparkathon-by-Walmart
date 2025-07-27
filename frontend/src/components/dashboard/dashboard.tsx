import React, { useState, useEffect } from 'react';
import { useAuthenticatedApi } from '@/hooks/useAuth';
import { useUser } from '@clerk/clerk-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Navbar } from "./navbar";
import { HeadlineTab } from "./headline-tab";
import { InventoryTab } from "./forecasting-tab";
import { SpikeMonitoringTab } from "./spike-monitoring-tab";
import { MapViewTab } from "./map-view-tab";
import { NotificationPanel } from "./notification-panel";
import { ExcelUpload } from "./excel-upload";
import { NotificationProvider, useNotifications } from "@/hooks/use-notifications";
import { Newspaper, TrendingUp, AlertTriangle, Map } from "lucide-react";
import { ArrowDown } from "lucide-react";
import TailoredDynamicBadge from "./dynamic_highlighting";

function DashboardContent() {
  const { callApi } = useAuthenticatedApi();
  const { user, isLoaded } = useUser();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notificationsMuted, setNotificationsMuted] = useState(false);
  const { notifications, addNotification, removeNotification, markAsRead, markAllAsRead, clearAll } = useNotifications();

  const fetchProtectedData = async () => {
    if (!user) {
      console.log('User not authenticated yet');
      return;
    }
    
    setLoading(true);
    try {
      const result = await callApi('/protected');
      setData(result);
      console.log('Protected data fetched:', result);
    } catch (error) {
      console.error('Error fetching protected data:', error);
      // You can add error notification here
      addNotification({
        title: "API Error",
        message: "Failed to fetch protected data from backend",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleNotifications = () => {
    setNotificationsMuted(!notificationsMuted);
  };

  // Fetch protected data on component mount
  useEffect(() => {
    if (user && isLoaded) {
      fetchProtectedData();
    }
  }, [user, isLoaded]);

  // Demo: Add some sample notifications on component mount
  useEffect(() => {
    const sampleNotifications = [
      {
        title: "Low Inventory Alert",
        message: "Store #1234 has critically low stock levels for Product SKU-ABC123",
        type: "warning" as const
      },
      {
        title: "Demand Spike Detected",
        message: "Unusual demand pattern detected in Region Northeast for Electronics category",
        type: "error" as const
      },
      {
        title: "Successful Redistribution",
        message: "Successfully redistributed 500 units from Store #5678 to Store #1234",
        type: "success" as const
      },
      {
        title: "System Update",
        message: "Forecasting model has been updated with latest market data",
        type: "info" as const
      }
    ];

    // Add notifications with delay to simulate real-time
    sampleNotifications.forEach((notification, index) => {
      setTimeout(() => {
        addNotification(notification);
      }, (index + 1) * 2000);
    });
  }, [addNotification]);

  if (!isLoaded || (loading && !data)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-lg">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  min-w-screenbg-gray-50">
      <Navbar 
        notifications={notifications}
        onNotificationRead={markAsRead}
        onNotificationDelete={removeNotification}
        onMarkAllAsRead={markAllAsRead}
        onClearAllNotifications={clearAll}
      />
      <br />
      <br />
      
      <div className="container mt-30 px-4 py-8 min-w-screen">
        {/* <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back{user?.firstName ? `, ${user.firstName}` : ''}!
          </h1>
          <p className="text-gray-600">
            Real-time inventory redistribution and demand monitoring
          </p>
          {data && (
            <div className="mt-4 p-4 bg-green-100 border border-green-400 rounded">
              <p className="text-green-700">{data.message}</p>
            </div>
          )}
        </div> */}

        <div className="gap-6 mb-8 min-w-screen">
          <div className="lg:col-span-3">
            <Card className="p-6">
              <Tabs defaultValue="headlines" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="headlines" className="flex items-center gap-2">
                    <Newspaper className="h-4 w-4" />
                    Headlines
                  </TabsTrigger>
                  <TabsTrigger value="inventory" className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Forecasting
                  </TabsTrigger>
                  <TabsTrigger value="monitoring" className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Spike Monitoring
                  </TabsTrigger>
                  <TabsTrigger value="map" className="flex items-center gap-2">
                    <Map className="h-4 w-4" />
                    Map View
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="headlines" className="mt-6">
                  <HeadlineTab />
                </TabsContent>
                
                <TabsContent value="inventory" className="mt-6">
                  <InventoryTab />
                </TabsContent>
                
                <TabsContent value="monitoring" className="mt-6">
                  <SpikeMonitoringTab />
                </TabsContent>
                
                <TabsContent value="map" className="mt-6">
                  <MapViewTab />
                </TabsContent>
              </Tabs>
            </Card>
          </div>
          
          <div className="space-y-2 mt-6">
            <TailoredDynamicBadge/>
          </div>
          <div className="mt-3">
            <ExcelUpload/>  
          </div>
        </div>
      </div>
    </div>
  );
}

export const Dashboard = () => {
  return (
    <NotificationProvider>
      <DashboardContent />
    </NotificationProvider>
  );
};
