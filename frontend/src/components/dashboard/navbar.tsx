import { Home, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationViewer, type Notification } from "./notification-viewer";
import walmartLogo from "@/assets/log.png";

interface NavbarProps {
  notifications: Notification[];
  onNotificationRead: (id: string) => void;
  onNotificationDelete: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAllNotifications: () => void;
}

export function Navbar({
  notifications,
  onNotificationRead,
  onNotificationDelete,
  onMarkAllAsRead,
  onClearAllNotifications,
}: NavbarProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-primary border-b border-border">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Left – Logo */}
        <div className="flex items-center gap-3">
          <img
            src={walmartLogo}
            alt="Walmart Logo"
            className="h-8 w-auto"
          />
          <span className="text-lg font-semibold text-primary-foreground">
            Inventory Dashboard
          </span>
        </div>

        {/* Right – Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-primary-foreground hover:bg-primary-foreground/20 gap-2"
          >
            <Home className="h-4 w-4" />
            Back to Home
          </Button>

          <NotificationViewer
            notifications={notifications}
            onNotificationRead={onNotificationRead}
            onNotificationDelete={onNotificationDelete}
            onMarkAllAsRead={onMarkAllAsRead}
            onClearAll={onClearAllNotifications}
          >
            <Button
              variant="ghost"
              size="sm"
              className="text-primary-foreground hover:bg-primary-foreground/20 relative"
            >
              <Bell className="h-4 w-4" />
            </Button>
          </NotificationViewer>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
