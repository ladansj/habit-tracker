import { useHabits } from '../contexts/HabitContext'
import './HabitItem.css'

interface HabitItemProps {
  habit: {
    id: string
    name: string
    color: string
  }
}

export default function HabitItem({ habit }: HabitItemProps) {
  const { deleteHabit, getHabitProgress, isHabitCompleted, toggleHabitDate, getHabitStreak } = useHabits()
  const progress = getHabitProgress(habit.id, 30)
  const streak = getHabitStreak(habit.id)
  const today = new Date()
  const isCompletedToday = isHabitCompleted(habit.id, today)

  const handleTodayToggle = () => {
    toggleHabitDate(habit.id, today)
  }

  return (
    <div className="habit-item" style={{ borderColor: habit.color }}>
      <div className="habit-item-header">
        <div
          className="habit-color-indicator"
          style={{ backgroundColor: habit.color }}
        />
        <h3 className="habit-name">{habit.name}</h3>
        <button
          className="delete-button"
          onClick={() => deleteHabit(habit.id)}
          aria-label="حذف عادت"
        >
          🗑️
        </button>
      </div>
      
      <div className="habit-today-section">
        <label className="today-checkbox-label">
          <input
            type="checkbox"
            checked={isCompletedToday}
            onChange={handleTodayToggle}
            className="today-checkbox"
            style={{ accentColor: habit.color }}
          />
          <span className={`today-label ${isCompletedToday ? 'completed' : ''}`}>
            {isCompletedToday ? '✓ امروز تکمیل شد' : 'امروز تکمیل نشده'}
          </span>
        </label>
      </div>

      {streak > 0 && (
        <div className="habit-streak">
          <span className="streak-icon">🔥</span>
          <span className="streak-text">{streak} روز متوالی</span>
        </div>
      )}

      <div className="habit-progress">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${progress}%`,
              backgroundColor: habit.color,
            }}
          />
        </div>
        <span className="progress-text">{progress}% در 30 روز گذشته</span>
      </div>
    </div>
  )
}

