```tsx
import { useState } from 'react'
import { useHabits } from '../contexts/HabitContext'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'
import {
  format,
  subDays,
  eachDayOfInterval,
  startOfDay,
} from 'date-fns'
import './ProgressChart.css'

type TimeRange = '7days' | '30days' | '90days' | 'all'
type ViewMode = 'overall' | 'individual'

type ChartDataPoint = {
  date: string
  dateLabel: string
  fullDate: string
  'درصد تکمیل': number
  'تعداد تکمیل شده': number
  'کل عادت‌ها': number
}

type IndividualChartDataPoint = {
  date: string
  dateLabel: string
  fullDate: string
  [key: string]: string | number
}

type StreakData = {
  id: string
  name: string
  streak: number
  color: string
}

const getHabitKey = (habitId: string) => `habit_${habitId}`

export default function ProgressChart() {
  const {
    habits,
    isHabitCompleted,
    getHabitStreak,
  } = useHabits()

  const [timeRange, setTimeRange] = useState<TimeRange>('30days')
  const [viewMode, setViewMode] = useState<ViewMode>('overall')

  const getDateRange = () => {
    const today = startOfDay(new Date())

    let startDate: Date

    switch (timeRange) {
      case '7days':
        startDate = subDays(today, 6)
        break

      case '30days':
        startDate = subDays(today, 29)
        break

      case '90days':
        startDate = subDays(today, 89)
        break

      case 'all':
        if (habits.length > 0) {
          const oldestHabit = habits.reduce((oldest, habit) => {
            const oldestCreatedAt = new Date(oldest.createdAt)
            const currentCreatedAt = new Date(habit.createdAt)

            return currentCreatedAt < oldestCreatedAt
              ? habit
              : oldest
          })

          startDate = startOfDay(new Date(oldestHabit.createdAt))

          if (startDate > today) {
            startDate = today
          }
        } else {
          startDate = subDays(today, 29)
        }
        break

      default:
        startDate = subDays(today, 29)
    }

    return eachDayOfInterval({
      start: startDate,
      end: today,
    })
  }

  const dateRange = getDateRange()

  const overallData: ChartDataPoint[] = dateRange.map((date) => {
    const completedCount = habits.filter((habit) =>
      isHabitCompleted(habit.id, date)
    ).length

    const totalHabits = habits.length

    const percentage =
      totalHabits > 0
        ? Math.round((completedCount / totalHabits) * 100)
        : 0

    return {
      date: format(date, 'MM/dd'),
      dateLabel: format(date, 'd MMM'),
      fullDate: format(date, 'yyyy-MM-dd'),
      'درصد تکمیل': percentage,
      'تعداد تکمیل شده': completedCount,
      'کل عادت‌ها': totalHabits,
    }
  })

  const individualData: IndividualChartDataPoint[] = dateRange.map(
    (date) => {
      const dataPoint: IndividualChartDataPoint = {
        date: format(date, 'MM/dd'),
        dateLabel: format(date, 'd MMM'),
        fullDate: format(date, 'yyyy-MM-dd'),
      }

      habits.forEach((habit) => {
        dataPoint[getHabitKey(habit.id)] =
          isHabitCompleted(habit.id, date) ? 1 : 0
      })

      return dataPoint
    }
  )

  const totalDays = overallData.length

  const averageCompletion =
    totalDays > 0
      ? Math.round(
          overallData.reduce(
            (sum, day) => sum + day['درصد تکمیل'],
            0
          ) / totalDays
        )
      : 0

  const bestDay = overallData.reduce<{
    'درصد تکمیل': number
    dateLabel: string
  }>(
    (best, day) =>
      day['درصد تکمیل'] > best['درصد تکمیل']
        ? day
        : best,
    {
      'درصد تکمیل': 0,
      dateLabel: '',
    }
  )

  const totalCompleted = overallData.reduce(
    (sum, day) => sum + day['تعداد تکمیل شده'],
    0
  )

  const totalPossible = totalDays * habits.length

  const overallPercentage =
    totalPossible > 0
      ? Math.round((totalCompleted / totalPossible) * 100)
      : 0

  const streaks: StreakData[] = habits
    .map((habit) => ({
      id: habit.id,
      name: habit.name,
      streak: getHabitStreak(habit.id),
      color: habit.color,
    }))
    .sort((a, b) => b.streak - a.streak)

  const maxStreak =
    streaks.length > 0
      ? Math.max(...streaks.map((item) => item.streak))
      : 0

  if (habits.length === 0) {
    return (
      <div className="progress-chart-container">
        <h2 className="chart-title">گراف پیشرفت</h2>

        <div className="empty-chart">
          <p>برای نمایش گراف، ابتدا عادتی اضافه کنید</p>
        </div>
      </div>
    )
  }

  return (
    <div className="progress-chart-container">

      <div className="chart-header">
        <h2 className="chart-title">گراف پیشرفت</h2>

        <div className="chart-controls">

          <div className="time-range-selector">
            <button
              type="button"
              className={timeRange === '7days' ? 'active' : ''}
              onClick={() => setTimeRange('7days')}
            >
              ۷ روز
            </button>

            <button
              type="button"
              className={timeRange === '30days' ? 'active' : ''}
              onClick={() => setTimeRange('30days')}
            >
              ۳۰ روز
            </button>

            <button
              type="button"
              className={timeRange === '90days' ? 'active' : ''}
              onClick={() => setTimeRange('90days')}
            >
              ۹۰ روز
            </button>

            <button
              type="button"
              className={timeRange === 'all' ? 'active' : ''}
              onClick={() => setTimeRange('all')}
            >
              همه
            </button>
          </div>
          
          <div className="view-mode-selector">
            <button
              type="button"
              className={viewMode === 'overall' ? 'active' : ''}
              onClick={() => setViewMode('overall')}
            >
              کلی
            </button>

            <button
              type="button"
              className={viewMode === 'individual' ? 'active' : ''}
              onClick={() => setViewMode('individual')}
            >
              هر عادت
            </button>
          </div>
        </div>
      </div>

      <div className="chart-stats">
        <div className="chart-stat">
          <span className="stat-label">میانگین تکمیل</span>
          <strong className="stat-value">
            {averageCompletion}٪
          </strong>
        </div>

        <div className="chart-stat">
          <span className="stat-label">تکمیل کلی</span>
          <strong className="stat-value">
            {overallPercentage}٪
          </strong>
        </div>

        <div className="chart-stat">
          <span className="stat-label">بهترین روز</span>
          <strong className="stat-value">
            {bestDay['درصد تکمیل']}٪
          </strong>

          {bestDay.dateLabel && (
            <span className="stat-date">
              {bestDay.dateLabel}
            </span>
          )}
        </div>

        <div className="chart-stat">
          <span className="stat-label">بیشترین Streak</span>
          <strong className="stat-value">
            {maxStreak}
          </strong>

          <span className="stat-unit">
            روز
          </span>
        </div>
      </div>

      <div className="chart-wrapper">
        {viewMode === 'overall' ? (
          <ResponsiveContainer
            width="100%"
            height={400}
          >
            <LineChart
              data={overallData}
              margin={{
                top: 20,
                right: 20,
                left: 0,
                bottom: 20,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
              />

              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
              />

              <YAxis
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
                tick={{ fontSize: 12 }}
              />

              <Tooltip
                formatter={(value) => [
                  `${value}%`,
                  'درصد تکمیل',
                ]}
                labelFormatter={(label) =>
                  `تاریخ: ${label}`
                }
              />

              <Legend />

              <Line
                type="monotone"
                dataKey="درصد تکمیل"
                strokeWidth={3}
                dot={{ r: 3 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer
            width="100%"
            height={400}
          >
            <BarChart
              data={individualData}
              margin={{
                top: 20,
                right: 20,
                left: 0,
                bottom: 20,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
              />

              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
              />

              <YAxis
                domain={[0, 1]}
                ticks={[0, 1]}
                tickFormatter={(value) =>
                  value === 1 ? 'انجام شده' : 'انجام نشده'
                }
                tick={{ fontSize: 11 }}
              />

              <Tooltip
                formatter={(value, _name, props) => {
                  const habitId = String(
                    props?.dataKey ?? ''
                  )

                  const habit = habits.find(
                    (item) =>
                      getHabitKey(item.id) === habitId
                  )

                  return [
                    Number(value) === 1
                      ? 'انجام شده'
                      : 'انجام نشده',
                    habit?.name ?? '',
                  ]
                }}
                labelFormatter={(label) =>
                  `تاریخ: ${label}`
                }
              />

              <Legend />

              {habits.map((habit) => (
                <Bar
                  key={habit.id}
                  dataKey={getHabitKey(habit.id)}
                  name={habit.name}
                  fill={habit.color}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Streaks */}
      <div className="streaks-section">
        <h3 className="streaks-title">
          Streak عادت‌ها
        </h3>

        <div className="streaks-list">
          {streaks.map(
            ({ id, name, streak, color }) => (
              <div
                key={id}
                className="streak-item"
              >
                <div className="streak-habit">
                  <span
                    className="streak-color"
                    style={{ backgroundColor: color }}
                  />

                  <span className="streak-name">
                    {name}
                  </span>
                </div>

                <div className="streak-value">
                  <strong>{streak}</strong>
                  <span>روز</span>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}
```
