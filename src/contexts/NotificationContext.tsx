import { createContext, useContext, ReactNode } from 'react'

interface NotificationContextType {
  requestPermission: () => Promise<void>
  scheduleNotifications: (habitCount: number) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {

  const requestPermission = async () => {
    if ('Notification' in window) {
      await Notification.requestPermission()
    }
  }

  const scheduleNotifications = (habitCount: number) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return
    }

    // برای مرورگرهای معمولی، نوتیفیکیشن در زمان مشخص نمایش داده می‌شود
    // این یک پیاده‌سازی ساده است - در تولید باید از Service Worker استفاده شود
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(9, 0, 0, 0) // ساعت 9 صبح

    const timeUntilNotification = tomorrow.getTime() - now.getTime()

    if (timeUntilNotification > 0 && habitCount > 0) {
      setTimeout(() => {
        new Notification('یادآوری عادت‌های روزانه', {
          body: `امروز ${habitCount} عادت برای بررسی دارید!`,
          tag: 'habit-reminder',
        })
      }, timeUntilNotification)
    }
  }

  return (
    <NotificationContext.Provider value={{ requestPermission, scheduleNotifications }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

