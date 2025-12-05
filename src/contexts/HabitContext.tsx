import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { format } from 'date-fns'

export interface Habit {
  id: string
  name: string
  color: string
  completedDates: string[] // تاریخ‌های تکمیل شده به صورت YYYY-MM-DD
  createdAt: string
}

interface HabitContextType {
  habits: Habit[]
  addHabit: (name: string, color: string) => void
  deleteHabit: (id: string) => void
  toggleHabitDate: (habitId: string, date: Date) => void
  isHabitCompleted: (habitId: string, date: Date) => boolean
  getHabitProgress: (habitId: string, days: number) => number
  getHabitStreak: (habitId: string) => number
  getTotalStreak: () => number
  exportData: () => string
  importData: (data: string) => void
}

const HabitContext = createContext<HabitContextType | undefined>(undefined)

export function HabitProvider({ children }: { children: ReactNode }) {
  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem('habits')
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    localStorage.setItem('habits', JSON.stringify(habits))
  }, [habits])

  const addHabit = (name: string, color: string) => {
    const newHabit: Habit = {
      id: Date.now().toString(),
      name,
      color,
      completedDates: [],
      createdAt: new Date().toISOString(),
    }
    setHabits(prev => [...prev, newHabit])
  }

  const deleteHabit = (id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id))
  }

  const toggleHabitDate = (habitId: string, date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    setHabits(prev =>
      prev.map(habit => {
        if (habit.id === habitId) {
          const isCompleted = habit.completedDates.includes(dateStr)
          return {
            ...habit,
            completedDates: isCompleted
              ? habit.completedDates.filter(d => d !== dateStr)
              : [...habit.completedDates, dateStr],
          }
        }
        return habit
      })
    )
  }

  const isHabitCompleted = (habitId: string, date: Date): boolean => {
    const habit = habits.find(h => h.id === habitId)
    if (!habit) return false
    const dateStr = format(date, 'yyyy-MM-dd')
    return habit.completedDates.includes(dateStr)
  }

  const getHabitProgress = (habitId: string, days: number): number => {
    const habit = habits.find(h => h.id === habitId)
    if (!habit) return 0
    
    const today = new Date()
    const dates = habit.completedDates.filter(dateStr => {
      const date = new Date(dateStr)
      const diffTime = today.getTime() - date.getTime()
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      return diffDays < days
    })
    
    return Math.round((dates.length / days) * 100)
  }

  const getHabitStreak = (habitId: string): number => {
    const habit = habits.find(h => h.id === habitId)
    if (!habit || habit.completedDates.length === 0) return 0

    const sortedDates = habit.completedDates
      .map(d => {
        const date = new Date(d)
        date.setHours(0, 0, 0, 0)
        return date
      })
      .sort((a, b) => b.getTime() - a.getTime())

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let streak = 0
    let checkDate = new Date(today)
    let foundTodayOrYesterday = false

    // بررسی امروز یا دیروز برای شروع streak
    for (const date of sortedDates) {
      const diffDays = Math.floor((checkDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
      
      if (diffDays === 0 || diffDays === 1) {
        if (!foundTodayOrYesterday) {
          foundTodayOrYesterday = true
          streak = 1
          checkDate = new Date(date)
          checkDate.setDate(checkDate.getDate() - 1)
        } else if (diffDays === 0) {
          // اگر امروز تکمیل شده، ادامه می‌دهیم
          checkDate = new Date(date)
          checkDate.setDate(checkDate.getDate() - 1)
        } else {
          // روز بعدی در streak پیدا شد
          streak++
          checkDate = new Date(date)
          checkDate.setDate(checkDate.getDate() - 1)
        }
      } else if (foundTodayOrYesterday) {
        // اگر streak شروع شده و روز بعدی پیدا نشد، streak تمام شده
        break
      }
    }

    // اگر streak شروع نشده، یعنی امروز و دیروز تکمیل نشده
    if (!foundTodayOrYesterday) {
      return 0
    }

    return streak
  }

  const getTotalStreak = (): number => {
    if (habits.length === 0) return 0
    return Math.min(...habits.map(h => getHabitStreak(h.id)))
  }

  const exportData = (): string => {
    return JSON.stringify(habits, null, 2)
  }

  const importData = (data: string) => {
    try {
      const parsed = JSON.parse(data)
      if (Array.isArray(parsed)) {
        setHabits(parsed)
      }
    } catch (error) {
      console.error('خطا در وارد کردن داده:', error)
      throw new Error('فرمت داده نامعتبر است')
    }
  }

  return (
    <HabitContext.Provider
      value={{
        habits,
        addHabit,
        deleteHabit,
        toggleHabitDate,
        isHabitCompleted,
        getHabitProgress,
        getHabitStreak,
        getTotalStreak,
        exportData,
        importData,
      }}
    >
      {children}
    </HabitContext.Provider>
  )
}

export function useHabits() {
  const context = useContext(HabitContext)
  if (context === undefined) {
    throw new Error('useHabits must be used within a HabitProvider')
  }
  return context
}

