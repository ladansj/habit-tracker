import { useState } from 'react'
import { useHabits } from '../contexts/HabitContext'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { format, subDays, eachDayOfInterval } from 'date-fns'
import './ProgressChart.css'

type TimeRange = '7days' | '30days' | '90days' | 'all'

export default function ProgressChart() {
  const { habits, isHabitCompleted, getHabitStreak } = useHabits()
  const [timeRange, setTimeRange] = useState<TimeRange>('30days')
  const [viewMode, setViewMode] = useState<'overall' | 'individual'>('overall')

  const getDateRange = () => {
    const today = new Date()
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
      default:
        
        if (habits.length > 0) {
          const oldestHabit = habits.reduce((oldest, habit) => 
            new Date(habit.createdAt) < new Date(oldest.createdAt) ? habit : oldest
          )
          startDate = new Date(oldestHabit.createdAt)
        } else {
          startDate = subDays(today, 29)
        }
    }
    
    return eachDayOfInterval({ start: startDate, end: today })
  }

  const dateRange = getDateRange()

  
  const overallData = dateRange.map(date => {
    const completedCount = habits.filter(habit => isHabitCompleted(habit.id, date)).length
    const totalHabits = habits.length
    const percentage = totalHabits > 0 ? Math.round((completedCount / totalHabits) * 100) : 0

    return {
      date: format(date, 'MM/dd'),
      dateLabel: format(date, 'd MMM'),
      fullDate: format(date, 'yyyy-MM-dd'),
      'درصد تکمیل': percentage,
      'تعداد تکمیل شده': completedCount,
      'کل عادت‌ها': totalHabits,
    }
  })

  
  const individualData = dateRange.map(date => {
    const dataPoint: any = {
      date: format(date, 'MM/dd'),
      dateLabel: format(date, 'd MMM'),
      fullDate: format(date, 'yyyy-MM-dd'),
    }
    
    habits.forEach(habit => {
      dataPoint[habit.name] = isHabitCompleted(habit.id, date) ? 1 : 0
    })
    
    return dataPoint
  })

 
  const totalDays = overallData.length
  const averageCompletion = totalDays > 0 
    ? Math.round(overallData.reduce((sum, day) => sum + day['درصد تکمیل'], 0) / totalDays)
    : 0
  
  const bestDay = overallData.reduce((best, day) => 
    day['درصد تکمیل'] > best['درصد تکمیل'] ? day : best
  , overallData[0] || { 'درصد تکمیل': 0, dateLabel: '' })

  const totalCompleted = overallData.reduce((sum, day) => sum + day['تعداد تکمیل شده'], 0)
  const totalPossible = totalDays * habits.length
  const overallPercentage = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0

  
  const streaks = habits.map(habit => ({
    name: habit.name,
    streak: getHabitStreak(habit.id),
    color: habit.color,
  })).sort((a, b) => b.streak - a.streak)

  const maxStreak = streaks.length > 0 ? Math.max(...streaks.map(s => s.streak)) : 0

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
              className={timeRange === '7days' ? 'active' : ''}
              onClick={() => setTimeRange('7days')}
            >
              ۷ روز
            </button>
            <button 
              className={timeRange === '30days' ? 'active' : ''}
              onClick={() => setTimeRange('30days')}
            >
              ۳۰ روز
            </button>
            <button 
              className={timeRange === '90days' ? 'active' : ''}
              onClick={() => setTimeRange('90days')}
            >
              ۹۰ روز
            </button>
            <button 
              className={timeRange === 'all' ? 'active' : ''}
              onClick={() => setTimeRange('all')}
            >
              همه
            </button>
          </div>
          <div className="view-mode-selector">
            <button 
              className={viewMode === 'overall' ? 'active' : ''}
              onClick={() => setViewMode('overall')}
            >
              کلی
            </button>
            <button 
              className={viewMode === 'individual' ? 'active' : ''}
              onClick={() => setViewMode('individual')}
            >
              هر عادت
            </button>
          </div>
        </div>
      </div>
      
      <div className="chart-stats">
        <div className="stat-card">
          <div className="stat-value">{averageCompletion}%</div>
          <div className="stat-label">میانگین تکمیل</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{overallPercentage}%</div>
          <div className="stat-label">کل پیشرفت</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{bestDay['درصد تکمیل']}%</div>
          <div className="stat-label">بهترین روز</div>
        </div>
        <div className="stat-card streak-card">
          <div className="stat-value">🔥 {maxStreak}</div>
          <div className="stat-label">بیشترین Streak</div>
        </div>
      </div>

      {viewMode === 'overall' ? (
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={overallData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis 
                dataKey="date" 
                stroke="var(--text-secondary)"
                tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
                interval={timeRange === '7days' ? 0 : timeRange === '30days' ? 3 : 7}
              />
              <YAxis 
                stroke="var(--text-secondary)"
                tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                domain={[0, 100]}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--card-bg)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                }}
                labelStyle={{ color: 'var(--text-primary)' }}
                formatter={(value: number) => [`${value}%`, 'درصد تکمیل']}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="درصد تکمیل" 
                stroke="var(--accent)" 
                strokeWidth={3}
                dot={{ fill: 'var(--accent)', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={individualData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis 
                dataKey="date" 
                stroke="var(--text-secondary)"
                tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
                interval={timeRange === '7days' ? 0 : timeRange === '30days' ? 3 : 7}
              />
              <YAxis 
                stroke="var(--text-secondary)"
                tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                domain={[0, 1]}
                ticks={[0, 1]}
                tickFormatter={(value) => value === 1 ? '✓' : ''}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--card-bg)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                }}
                labelStyle={{ color: 'var(--text-primary)' }}
                formatter={(value: number) => value === 1 ? 'تکمیل شده' : 'تکمیل نشده'}
              />
              <Legend />
              {habits.map(habit => (
                <Bar 
                  key={habit.id}
                  dataKey={habit.name}
                  fill={habit.color}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="streaks-section">
        <h3 className="streaks-title">🔥 Streak های فعلی</h3>
        <div className="streaks-list">
          {streaks.map(({ name, streak, color }) => (
            <div key={name} className="streak-item">
              <div className="streak-color" style={{ backgroundColor: color }} />
              <span className="streak-name">{name}</span>
              <span className="streak-value">{streak} روز متوالی</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
