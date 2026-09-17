import { useHabits } from '../contexts/HabitContext'
import {
  startOfWeek,
  startOfMonth,
  eachDayOfInterval,
} from 'date-fns'
import './StatsDashboard.css'

export default function StatsDashboard() {
  const {
    habits,
    isHabitCompleted,
    getHabitStreak,
    getHabitProgress,
  } = useHabits()

  const today = new Date()

  const weekStart = startOfWeek(today, {
    weekStartsOn: 6, 
  })

  const weekDays = eachDayOfInterval({
    start: weekStart,
    end: today,
  })

  const weekCompleted = weekDays.reduce((sum, day) => {
    return (
      sum +
      habits.filter((habit) =>
        isHabitCompleted(habit.id, day)
      ).length
    )
  }, 0)

  const weekTotal = habits.length * weekDays.length

  const weekPercentage =
    weekTotal > 0
      ? Math.round((weekCompleted / weekTotal) * 100)
      : 0

  const monthStart = startOfMonth(today)

  const monthDays = eachDayOfInterval({
    start: monthStart,
    end: today,
  })

  const monthCompleted = monthDays.reduce((sum, day) => {
    return (
      sum +
      habits.filter((habit) =>
        isHabitCompleted(habit.id, day)
      ).length
    )
  }, 0)

  const monthTotal = habits.length * monthDays.length

  const monthPercentage =
    monthTotal > 0
      ? Math.round((monthCompleted / monthTotal) * 100)
      : 0
  
  const todayCompleted = habits.filter((habit) =>
    isHabitCompleted(habit.id, today)
  ).length

  const todayPercentage =
    habits.length > 0
      ? Math.round(
          (todayCompleted / habits.length) * 100
        )
      : 0

  const habitsWithStats = habits.map((habit) => ({
    ...habit,
    streak: getHabitStreak(habit.id),
    progress30: getHabitProgress(habit.id, 30),
    progress7: getHabitProgress(habit.id, 7),
  }))

  const bestStreak = [...habitsWithStats].sort(
    (a, b) => b.streak - a.streak
  )[0]

  const bestProgress = [...habitsWithStats].sort(
    (a, b) => b.progress30 - a.progress30
  )[0]

  if (habits.length === 0) {
    return null
  }

  return (
    <div className="stats-dashboard">
      <h2 className="dashboard-title">
        📊 آمار و داشبورد
      </h2>

      <div className="stats-grid">
        <div className="stat-box">
          <div className="stat-icon">📅</div>

          <div className="stat-info">
            <div className="stat-number">
              {todayPercentage}%
            </div>

            <div className="stat-desc">
              امروز ({todayCompleted}/{habits.length})
            </div>
          </div>
        </div>

        <div className="stat-box">
          <div className="stat-icon">📆</div>

          <div className="stat-info">
            <div className="stat-number">
              {weekPercentage}%
            </div>

            <div className="stat-desc">
              این هفته
            </div>
          </div>
        </div>

        <div className="stat-box">
          <div className="stat-icon">🗓️</div>

          <div className="stat-info">
            <div className="stat-number">
              {monthPercentage}%
            </div>

            <div className="stat-desc">
              این ماه
            </div>
          </div>
        </div>

        <div className="stat-box highlight">
          <div className="stat-icon">🔥</div>

          <div className="stat-info">
            <div className="stat-number">
              {bestStreak?.streak || 0}
            </div>

            <div className="stat-desc">
              بیشترین Streak
            </div>

            {bestStreak && (
              <div className="stat-subtitle">
                {bestStreak.name}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="top-habits">
        <h3 className="section-title">
          🏆 بهترین عادت‌ها
        </h3>

        <div className="top-habits-list">
       
          {bestStreak && (
            <div className="top-habit-item">
              <div className="top-habit-badge">
                🔥
              </div>

              <div className="top-habit-info">
                <div className="top-habit-name">
                  {bestStreak.name}
                </div>

                <div className="top-habit-value">
                  {bestStreak.streak} روز متوالی
                </div>
              </div>

              <div
                className="top-habit-color"
                style={{
                  backgroundColor: bestStreak.color,
                }}
              />
            </div>
          )}

          {bestProgress &&
            bestProgress.id !== bestStreak?.id && (
              <div className="top-habit-item">
                <div className="top-habit-badge">
                  📈
                </div>

                <div className="top-habit-info">
                  <div className="top-habit-name">
                    {bestProgress.name}
                  </div>

                  <div className="top-habit-value">
                    {bestProgress.progress30}% در 30 روز
                  </div>
                </div>

                <div
                  className="top-habit-color"
                  style={{
                    backgroundColor: bestProgress.color,
                  }}
                />
              </div>
            )}
        </div>
      </div>
    </div>
  )
}
