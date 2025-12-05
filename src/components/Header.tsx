import { useTheme } from '../contexts/ThemeContext'
import { useNotifications } from '../contexts/NotificationContext'
import { useHabits } from '../contexts/HabitContext'
import './Header.css'

export default function Header() {
  const { theme, toggleTheme } = useTheme()
  const { requestPermission, scheduleNotifications } = useNotifications()
  const { habits } = useHabits()

  const handleNotificationClick = async () => {
    if ('Notification' in window) {
      if (Notification.permission === 'default') {
        await requestPermission()
        scheduleNotifications(habits.length)
      } else if (Notification.permission === 'granted') {
        scheduleNotifications(habits.length)
      } else if (Notification.permission === 'denied') {
        alert('لطفاً اجازه نوتیفیکیشن را در تنظیمات مرورگر فعال کنید')
      }
    }
  }

  return (
    <header className="header">
      <div className="header-content">
        <h1 className="header-title">📅 مدیریت عادت</h1>
        <div className="header-actions">
          <button
            className="icon-button"
            onClick={handleNotificationClick}
            title="نوتیفیکیشن‌ها"
            aria-label="نوتیفیکیشن‌ها"
          >
            🔔
          </button>
          <button
            className="icon-button"
            onClick={toggleTheme}
            title={theme === 'light' ? 'حالت تاریک' : 'حالت روشن'}
            aria-label="تغییر تم"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </div>
    </header>
  )
}

