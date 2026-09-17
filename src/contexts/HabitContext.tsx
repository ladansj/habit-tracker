```tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import { format, differenceInCalendarDays, subDays } from 'date-fns'

export interface Habit {
  id: string
  name: string
  color: string
  completedDates: string[]
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


const STORAGE_KEY = 'habits'


const toDateString = (date: Date): string => {
  return format(date, 'yyyy-MM-dd')
}

const isValidDateString = (value: unknown): value is string => {
  if (typeof value !== 'string') {
    return false
  }

  return /^\d{4}-\d{2}-\d{2}$/.test(value)
}

const isValidHabit = (value: unknown): value is Habit => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const habit = value as Record<string, unknown>

  return (
    typeof habit.id === 'string' &&
    habit.id.trim().length > 0 &&
    typeof habit.name === 'string' &&
    habit.name.trim().length > 0 &&
    typeof habit.color === 'string' &&
    habit.color.trim().length > 0 &&
    Array.isArray(habit.completedDates) &&
    habit.completedDates.every(isValidDateString) &&
    typeof habit.createdAt === 'string' &&
    !Number.isNaN(Date.parse(habit.createdAt))
  )
}


const validateAndNormalizeHabits = (data: unknown): Habit[] => {
  if (!Array.isArray(data)) {
    throw new Error('فرمت داده نامعتبر است')
  }

  const validHabits = data.filter(isValidHabit)

  if (validHabits.length !== data.length) {
    throw new Error('برخی از داده‌های واردشده ساختار معتبری ندارند')
  }

  return validHabits.map(habit => ({
    ...habit,

    name: habit.name.trim(),

    completedDates: Array.from(
      new Set(habit.completedDates)
    ).sort(),
  }))
}


const loadHabits = (): Habit[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)

    if (!saved) {
      return []
    }

    const parsed: unknown = JSON.parse(saved)

    if (!Array.isArray(parsed)) {
      console.warn('داده‌های ذخیره‌شده ساختار معتبری ندارند')
      return []
    }

    const validHabits = parsed.filter(isValidHabit)

    if (validHabits.length !== parsed.length) {
      console.warn(
        'برخی از عادت‌های ذخیره‌شده معتبر نبودند و نادیده گرفته شدند'
      )
    }

    return validHabits.map(habit => ({
      ...habit,
      completedDates: Array.from(
        new Set(habit.completedDates)
      ).sort(),
    }))
  } catch (error) {
    console.error('خطا در خواندن داده‌های Local Storage:', error)
    return []
  }
}


const saveHabits = (habits: Habit[]): void => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(habits)
    )
  } catch (error) {
    console.error('خطا در ذخیره داده‌ها:', error)
  }
}

export function HabitProvider({
  children,
}: {
  children: ReactNode
}) {

  const [habits, setHabits] = useState<Habit[]>(
    loadHabits
  )

  useEffect(() => {
    saveHabits(habits)
  }, [habits])

  const addHabit = (
    name: string,
    color: string
  ) => {

    const trimmedName = name.trim()

    if (!trimmedName) {
      return
    }

    const newHabit: Habit = {
      id: Date.now().toString(),
      name: trimmedName,
      color,
      completedDates: [],
      createdAt: new Date().toISOString(),
    }

    setHabits(prev => [
      ...prev,
      newHabit,
    ])
  }

  const deleteHabit = (id: string) => {

    setHabits(prev =>
      prev.filter(
        habit => habit.id !== id
      )
    )
  }


  const toggleHabitDate = (
    habitId: string,
    date: Date
  ) => {

    const dateStr = toDateString(date)

    setHabits(prev =>
      prev.map(habit => {

        if (habit.id !== habitId) {
          return habit
        }

        const isCompleted =
          habit.completedDates.includes(
            dateStr
          )

        return {
          ...habit,

          completedDates: isCompleted
            ? habit.completedDates.filter(
                date => date !== dateStr
              )
            : [
                ...habit.completedDates,
                dateStr,
              ].sort(),
        }
      })
    )
  }


  const isHabitCompleted = (
    habitId: string,
    date: Date
  ): boolean => {

    const habit = habits.find(
      habit => habit.id === habitId
    )

    if (!habit) {
      return false
    }

    const dateStr = toDateString(date)

    return habit.completedDates.includes(
      dateStr
    )
  }

  const getHabitProgress = (
    habitId: string,
    days: number
  ): number => {

    const habit = habits.find(
      habit => habit.id === habitId
    )

    if (
      !habit ||
      !Number.isInteger(days) ||
      days <= 0
    ) {
      return 0
    }


    const today = new Date()


    const completedDays =
      new Set(
        habit.completedDates
      )


    let completedCount = 0


    for (
      let i = 0;
      i < days;
      i++
    ) {

      const date =
        subDays(today, i)

      const dateStr =
        toDateString(date)

      if (
        completedDays.has(dateStr)
      ) {
        completedCount++
      }
    }


    return Math.min(
      100,
      Math.round(
        (completedCount / days) * 100
      )
    )
  }

  const getHabitStreak = (
    habitId: string
  ): number => {

    const habit = habits.find(
      habit => habit.id === habitId
    )

    if (
      !habit ||
      habit.completedDates.length === 0
    ) {
      return 0
    }


    const completedDays =
      new Set(
        habit.completedDates
      )


    const today =
      new Date()


    const todayStr =
      toDateString(today)


    const yesterdayStr =
      toDateString(
        subDays(today, 1)
      )


    if (
      !completedDays.has(todayStr) &&
      !completedDays.has(yesterdayStr)
    ) {
      return 0
    }


    let checkDate =
      completedDays.has(todayStr)
        ? today
        : subDays(today, 1)


    let streak = 0


    while (
      completedDays.has(
        toDateString(checkDate)
      )
    ) {

      streak++

      checkDate =
        subDays(checkDate, 1)
    }


    return streak
  }

  const getTotalStreak = (): number => {

    if (habits.length === 0) {
      return 0
    }

    return Math.max(
      ...habits.map(
        habit => getHabitStreak(habit.id)
      )
    )
  }

  const exportData = (): string => {

    return JSON.stringify(
      habits,
      null,
      2
    )
  }


  const importData = (
    data: string
  ) => {

    try {

      const parsed: unknown =
        JSON.parse(data)


      const validatedHabits =
        validateAndNormalizeHabits(
          parsed
        )


      setHabits(
        validatedHabits
      )

    } catch (error) {

      console.error(
        'خطا در وارد کردن داده:',
        error
      )


      if (
        error instanceof Error
      ) {
        throw error
      }


      throw new Error(
        'فرمت داده نامعتبر است'
      )
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

  const context =
    useContext(HabitContext)


  if (context === undefined) {

    throw new Error(
      'useHabits must be used within a HabitProvider'
    )
  }


  return context
}
```
