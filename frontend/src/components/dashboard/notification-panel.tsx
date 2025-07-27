import { useNotifications } from "@/hooks/use-notifications"

interface NotificationPanelProps {
  muted: boolean
}

export function NotificationPanel({ muted }: NotificationPanelProps) {
  const { notifications } = useNotifications()

  // Return nothing since pop-up rendering is removed
  return null
}
