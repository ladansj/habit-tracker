import {
  createContext,
  useContext,
  ReactNode,
  useRef,
} from 'react'

interface NotificationContextType {
  requestPermission: () => Promise<void>
  scheduleNotifications: (habitCount: number) => void
}

const NotificationContext =
  createContext<NotificationContextType | undefined>(
    undefined
  )

export function NotificationProvider({
  children,
}: {
  children: ReactNode
}) {
  const notificationTimeout =
    useRef<ReturnType<typeof setTimeout> | null>(null)

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      return
    }

    if (Notification.permission === 'default') {
      await Notification.requestPermission()
    }
  }

  const scheduleNotifications = (
    habitCount: number
  ) => {

    if (!('Notification' in window)) {
      return
    }

    if (Notification.permission !== 'granted') {
      return
    }

    if (habitCount <= 0) {
      return
    }

    if (notificationTimeout.current) {
      clearTimeout(notificationTimeout.current)
      notificationTimeout.current = null
    }

    const now = new Date()

    const tomorrow = new Date(now)

    tomorrow.setDate(
      tomorrow.getDate() + 1
    )

    tomorrow.setHours(9, 0, 0, 0)

    const timeUntilNotification =
      tomorrow.getTime() - now.getTime()

    if (timeUntilNotification <= 0) {
      return
    }

    notificationTimeout.current =
      setTimeout(() => {
        new Notification(
          'یادآوری عادت‌های روزانه',
          {
            body: `امروز ${habitCount} عادت برای بررسی دارید!`,
            tag: 'habit-reminder',
          }
        )

        notificationTimeout.current = null
      }, timeUntilNotification)
  }

  return (
    <NotificationContext.Provider
      value={{
        requestPermission,
        scheduleNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context =
    useContext(NotificationContext)

  if (context === undefined) {
    throw new Error(
      'useNotifications must be used within a NotificationProvider'
    )
  }

  return context
}
