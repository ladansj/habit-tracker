import { useState } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, addMonths, subMonths } from 'date-fns'
import { useHabits } from '../contexts/HabitContext'
import { 
  toJalaliDate, 
  formatJalali, 
  startOfJalaliMonth, 
  endOfJalaliMonth, 
  getJalaliWeekday,
  jalaliMonths,
  jalaliWeekdays,
  fromJalaliDate
} from '../utils/jalali'
import './Calendar.css'

type CalendarType = 'gregorian' | 'jalali'

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [calendarType, setCalendarType] = useState<CalendarType>('jalali')
  const { habits, toggleHabitDate, isHabitCompleted } = useHabits()

 
  const getMonthData = () => {
    if (calendarType === 'jalali') {
      const jalali = toJalaliDate(currentDate)
      const monthStart = startOfJalaliMonth(jalali.jy, jalali.jm)
      const monthEnd = endOfJalaliMonth(jalali.jy, jalali.jm)
      const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })
      
      
      const firstDayWeekday = getJalaliWeekday(monthStart)
      const emptyDays = Array.from({ length: firstDayWeekday }, (_, i) => i)
      
      return { daysInMonth, emptyDays, monthStart, monthEnd, jalali }
    } else {
      const monthStart = startOfMonth(currentDate)
      const monthEnd = endOfMonth(currentDate)
      const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })
      const firstDayOfWeek = monthStart.getDay()
      const emptyDays = Array.from({ length: (firstDayOfWeek + 1) % 7 }, (_, i) => i)
      
      return { daysInMonth, emptyDays, monthStart, monthEnd }
    }
  }

  const { daysInMonth, emptyDays, jalali } = getMonthData()

  const prevMonth = () => {
    if (calendarType === 'jalali' && jalali) {
      let newJy = jalali.jy
      let newJm = jalali.jm - 1
      if (newJm < 1) {
        newJm = 12
        newJy--
      }
      const newDate = fromJalaliDate(newJy, newJm, 1)
      setCurrentDate(newDate)
    } else {
      setCurrentDate(subMonths(currentDate, 1))
    }
  }

  const nextMonth = () => {
    if (calendarType === 'jalali' && jalali) {
      let newJy = jalali.jy
      let newJm = jalali.jm + 1
      if (newJm > 12) {
        newJm = 1
        newJy++
      }
      const newDate = fromJalaliDate(newJy, newJm, 1)
      setCurrentDate(newDate)
    } else {
      setCurrentDate(addMonths(currentDate, 1))
    }
  }

  const getMonthTitle = () => {
    if (calendarType === 'jalali' && jalali) {
      return `${jalaliMonths[jalali.jm - 1]} ${jalali.jy}`
    }
    return format(currentDate, 'MMMM yyyy')
  }

  const getDayCompletionCount = (date: Date) => {
    return habits.filter(habit => isHabitCompleted(habit.id, date)).length
  }

  const handleDayClick = (day: Date) => {
    setSelectedDate(day)
  }

  const handleHabitToggle = (habitId: string, date: Date) => {
    toggleHabitDate(habitId, date)
  }

  const formatSelectedDate = (date: Date) => {
    if (calendarType === 'jalali') {
      return formatJalali(date, 'd MMMM yyyy')
    }
    return format(date, 'd MMMM yyyy')
  }

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <div className="calendar-type-selector">
          <button
            className={`calendar-type-btn ${calendarType === 'jalali' ? 'active' : ''}`}
            onClick={() => setCalendarType('jalali')}
          >
            شمسی
          </button>
          <button
            className={`calendar-type-btn ${calendarType === 'gregorian' ? 'active' : ''}`}
            onClick={() => setCalendarType('gregorian')}
          >
            میلادی
          </button>
        </div>
        <div className="calendar-nav">
          <button className="calendar-nav-button" onClick={prevMonth}>
            ‹
          </button>
          <h2 className="calendar-title">
            {getMonthTitle()}
          </h2>
          <button className="calendar-nav-button" onClick={nextMonth}>
            ›
          </button>
        </div>
      </div>

      <div className="calendar-weekdays">
        {jalaliWeekdays.map((day, index) => (
          <div key={index} className="weekday">
            {day.substring(0, 1)}
          </div>
        ))}
      </div>

      <div className="calendar-grid">
        {emptyDays.map((_, index) => (
          <div key={`empty-${index}`} className="calendar-day empty" />
        ))}
        {daysInMonth.map((day) => {
          const completionCount = getDayCompletionCount(day)
          const totalHabits = habits.length
          const isCurrentDay = isToday(day)
          const completionPercentage = totalHabits > 0 ? (completionCount / totalHabits) * 100 : 0

          return (
            <div
              key={day.toISOString()}
              className={`calendar-day ${isCurrentDay ? 'today' : ''} ${selectedDate && format(selectedDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd') ? 'selected' : ''}`}
              onClick={() => handleDayClick(day)}
              title={`${completionCount} از ${totalHabits} عادت تکمیل شده - کلیک برای جزئیات`}
            >
              <span className="day-number">
                {calendarType === 'jalali' ? formatJalali(day, 'd') : format(day, 'd')}
              </span>
              {totalHabits > 0 && (
                <>
                  <div
                    className="day-progress"
                    style={{
                      height: `${completionPercentage}%`,
                      backgroundColor: completionPercentage === 100 
                        ? 'var(--success)' 
                        : completionPercentage > 0 
                          ? 'var(--accent)' 
                          : 'transparent',
                    }}
                  />
                  <div className="day-habits-indicators">
                    {habits.slice(0, 4).map(habit => {
                      const completed = isHabitCompleted(habit.id, day)
                      return (
                        <div
                          key={habit.id}
                          className={`habit-dot ${completed ? 'completed' : ''}`}
                          style={{
                            backgroundColor: completed ? habit.color : 'transparent',
                            borderColor: habit.color,
                          }}
                          title={habit.name}
                        />
                      )
                    })}
                    {habits.length > 4 && (
                      <div className="habit-dot-more">+{habits.length - 4}</div>
                    )}
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>

      {selectedDate && (
        <div className="day-details-modal" onClick={(e) => {
          if (e.target === e.currentTarget) setSelectedDate(null)
        }}>
          <div className="day-details-content" onClick={(e) => e.stopPropagation()}>
            <div className="day-details-header">
              <h3>
                عادت‌های {formatSelectedDate(selectedDate)}
                {calendarType === 'jalali' && (
                  <span className="date-gregorian"> ({format(selectedDate, 'd MMM yyyy')})</span>
                )}
              </h3>
              <button className="close-modal" onClick={() => setSelectedDate(null)}>✕</button>
            </div>
            <div className="day-habits-list">
              {habits.length === 0 ? (
                <p className="no-habits">عادتی وجود ندارد</p>
              ) : (
                habits.map(habit => {
                  const completed = isHabitCompleted(habit.id, selectedDate)
                  return (
                    <label key={habit.id} className="day-habit-item">
                      <input
                        type="checkbox"
                        checked={completed}
                        onChange={() => handleHabitToggle(habit.id, selectedDate)}
                        style={{ accentColor: habit.color }}
                      />
                      <div
                        className="day-habit-color"
                        style={{ backgroundColor: habit.color }}
                      />
                      <span className={`day-habit-name ${completed ? 'completed' : ''}`}>
                        {habit.name}
                      </span>
                    </label>
                  )
                })
              )}
            </div>
          </div>
        </div>
      )}

      <div className="calendar-legend">
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: 'var(--success)' }} />
          <span>همه تکمیل شده</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: 'var(--accent)' }} />
          <span>برخی تکمیل شده</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: 'transparent', border: '1px solid var(--border)' }} />
          <span>تکمیل نشده</span>
        </div>
      </div>
    </div>
  )
}
