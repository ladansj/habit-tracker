import { useState } from 'react'
import { useHabits } from '../contexts/HabitContext'
import './AddHabitForm.css'

interface AddHabitFormProps {
  colors: string[]
  onClose: () => void
}

export default function AddHabitForm({ colors, onClose }: AddHabitFormProps) {
  const { addHabit } = useHabits()
  const [name, setName] = useState('')
  const [selectedColor, setSelectedColor] = useState(colors[0])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      addHabit(name.trim(), selectedColor)
      setName('')
      onClose()
    }
  }

  return (
    <form className="add-habit-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="habit-name">نام عادت</label>
        <input
          id="habit-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="مثلاً: ورزش روزانه"
          autoFocus
          required
        />
      </div>

      <div className="form-group">
        <label>رنگ</label>
        <div className="color-picker">
          {colors.map((color) => (
            <button
              key={color}
              type="button"
              className={`color-option ${selectedColor === color ? 'selected' : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => setSelectedColor(color)}
              aria-label={`انتخاب رنگ ${color}`}
            />
          ))}
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="cancel-button" onClick={onClose}>
          انصراف
        </button>
        <button type="submit" className="submit-button">
          افزودن
        </button>
      </div>
    </form>
  )
}

