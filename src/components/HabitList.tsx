import { useState } from 'react'
import { useHabits } from '../contexts/HabitContext'
import HabitItem from './HabitItem'
import AddHabitForm from './AddHabitForm'
import './HabitList.css'

const COLORS = [
  '#4f46e5', '#ef4444', '#10b981', '#f59e0b',
  '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
]

export default function HabitList() {
  const { habits } = useHabits()
  const [showAddForm, setShowAddForm] = useState(false)

  return (
    <div className="habit-list-container">
      <div className="habit-list-header">
        <h2>عادت‌های من</h2>
        <button
          className="add-button"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? '✕' : '+ افزودن عادت'}
        </button>
      </div>

      {showAddForm && (
        <AddHabitForm
          colors={COLORS}
          onClose={() => setShowAddForm(false)}
        />
      )}

      <div className="habits-grid">
        {habits.length === 0 ? (
          <div className="empty-state">
            <p>هنوز عادتی اضافه نکرده‌اید</p>
            <p className="empty-state-hint">روی دکمه "افزودن عادت" کلیک کنید</p>
          </div>
        ) : (
          habits.map(habit => (
            <HabitItem key={habit.id} habit={habit} />
          ))
        )}
      </div>
    </div>
  )
}

