import { useState } from 'react'
import { useHabits } from '../contexts/HabitContext'
import { format, subDays, eachDayOfInterval, startOfMonth, endOfMonth } from 'date-fns'
import jsPDF from 'jspdf'
import './DataManager.css'

export default function DataManager() {
  const { exportData, importData, habits, isHabitCompleted, getHabitStreak, getHabitProgress } = useHabits()
  const [showImport, setShowImport] = useState(false)
  const [importText, setImportText] = useState('')
  const [error, setError] = useState('')

  const handleExportPDF = () => {
    if (habits.length === 0) {
      alert('ابتدا عادتی اضافه کنید!')
      return
    }

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    let yPosition = 20

    // عنوان
    doc.setFontSize(20)
    doc.setTextColor(79, 70, 229)
    doc.text('گزارش پیشرفت عادت‌ها', pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 15

    // تاریخ گزارش
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(`تاریخ گزارش: ${format(new Date(), 'yyyy/MM/dd')}`, pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 15

    // خط جداکننده
    doc.setDrawColor(200, 200, 200)
    doc.line(20, yPosition, pageWidth - 20, yPosition)
    yPosition += 10

    // آمار کلی
    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.text('📊 آمار کلی', 20, yPosition)
    yPosition += 10

    const today = new Date()
    const monthStart = startOfMonth(today)
    const monthEnd = endOfMonth(today)
    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })
    
    const todayCompleted = habits.filter(habit => isHabitCompleted(habit.id, today)).length
    const monthCompleted = monthDays.reduce((sum, day) => {
      return sum + habits.filter(habit => isHabitCompleted(habit.id, day)).length
    }, 0)
    const monthTotal = habits.length * monthDays.length
    const monthPercentage = monthTotal > 0 ? Math.round((monthCompleted / monthTotal) * 100) : 0

    doc.setFontSize(11)
    doc.text(`امروز: ${todayCompleted} از ${habits.length} عادت تکمیل شده`, 25, yPosition)
    yPosition += 7
    doc.text(`این ماه: ${monthPercentage}% تکمیل (${monthCompleted} از ${monthTotal})`, 25, yPosition)
    yPosition += 10

    // لیست عادت‌ها
    doc.setFontSize(14)
    doc.text('📋 لیست عادت‌ها', 20, yPosition)
    yPosition += 10

    habits.forEach((habit, index) => {
      // بررسی اگر نیاز به صفحه جدید است
      if (yPosition > pageHeight - 40) {
        doc.addPage()
        yPosition = 20
      }

      const streak = getHabitStreak(habit.id)
      const progress30 = getHabitProgress(habit.id, 30)
      const progress7 = getHabitProgress(habit.id, 7)

      // رنگ عادت (مربع کوچک)
      doc.setFillColor(
        parseInt(habit.color.slice(1, 3), 16),
        parseInt(habit.color.slice(3, 5), 16),
        parseInt(habit.color.slice(5, 7), 16)
      )
      doc.rect(25, yPosition - 5, 4, 4, 'F')

      doc.setFontSize(11)
      doc.setTextColor(0, 0, 0)
      doc.text(`${index + 1}. ${habit.name}`, 32, yPosition)
      yPosition += 7

      doc.setFontSize(9)
      doc.setTextColor(100, 100, 100)
      doc.text(`   پیشرفت 30 روز: ${progress30}% | پیشرفت 7 روز: ${progress7}%`, 25, yPosition)
      yPosition += 6
      
      if (streak > 0) {
        doc.setTextColor(245, 158, 11)
        doc.text(`   🔥 Streak: ${streak} روز متوالی`, 25, yPosition)
        yPosition += 6
      }
      
      yPosition += 3
    })

    // جدول پیشرفت هفتگی
    yPosition += 5
    if (yPosition > pageHeight - 60) {
      doc.addPage()
      yPosition = 20
    }

    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.text('📈 پیشرفت هفتگی', 20, yPosition)
    yPosition += 10

    const weekAgo = subDays(today, 6)
    const weekDays = eachDayOfInterval({ start: weekAgo, end: today })

    doc.setFontSize(9)
    doc.text('تاریخ', 25, yPosition)
    doc.text('تکمیل شده', 80, yPosition)
    doc.text('درصد', 130, yPosition)
    doc.text('Streak', 170, yPosition)
    yPosition += 5

    doc.setDrawColor(200, 200, 200)
    doc.line(20, yPosition, pageWidth - 20, yPosition)
    yPosition += 5

    weekDays.forEach(day => {
      if (yPosition > pageHeight - 30) {
        doc.addPage()
        yPosition = 20
      }

      const completed = habits.filter(habit => isHabitCompleted(habit.id, day)).length
      const percentage = habits.length > 0 ? Math.round((completed / habits.length) * 100) : 0
      const dayStr = format(day, 'MM/dd')

      doc.text(dayStr, 25, yPosition)
      doc.text(`${completed}/${habits.length}`, 80, yPosition)
      doc.text(`${percentage}%`, 130, yPosition)
      
      // محاسبه streak برای این روز
      const dayStreak = habits.reduce((min, habit) => {
        const habitStreak = getHabitStreak(habit.id)
        return Math.min(min, habitStreak)
      }, Infinity)
      
      doc.text(dayStreak > 0 ? `${dayStreak}` : '-', 170, yPosition)
      yPosition += 6
    })

    // پاورقی
    const totalPages = doc.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(150, 150, 150)
      doc.text(
        `صفحه ${i} از ${totalPages} | ایجاد شده توسط اپلیکیشن مدیریت عادت`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      )
    }

    // ذخیره PDF
    doc.save(`گزارش-عادت‌ها-${format(new Date(), 'yyyy-MM-dd')}.pdf`)
  }

  const handleExportJSON = () => {
    const data = exportData()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `habits-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    try {
      setError('')
      importData(importText)
      setImportText('')
      setShowImport(false)
      alert('داده‌ها با موفقیت وارد شدند!')
    } catch (err) {
      setError('خطا در وارد کردن داده. لطفاً فرمت را بررسی کنید.')
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const content = event.target?.result as string
        setImportText(content)
      }
      reader.readAsText(file)
    }
  }

  return (
    <div className="data-manager">
      <h3 className="data-manager-title">💾 مدیریت داده‌ها</h3>
      
      <div className="data-manager-info">
        <p className="info-text">
          💡 <strong>چرا این قابلیت مفید است؟</strong><br />
          • <strong>PDF:</strong> برای چاپ، اشتراک‌گذاری با دیگران، یا نگهداری به عنوان گزارش<br />
          • <strong>JSON:</strong> برای پشتیبان‌گیری و انتقال داده‌ها به دستگاه دیگر
        </p>
      </div>

      <div className="data-manager-actions">
        <button className="data-button export-pdf-button" onClick={handleExportPDF}>
          📄 خروجی PDF (گزارش)
        </button>
        <button className="data-button export-json-button" onClick={handleExportJSON}>
          💾 خروجی JSON (پشتیبان)
        </button>
        <button 
          className="data-button import-button" 
          onClick={() => setShowImport(!showImport)}
        >
          📤 وارد کردن JSON
        </button>
      </div>

      {showImport && (
        <div className="import-section">
          <div className="import-options">
            <label className="file-upload-label">
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="file-input"
              />
              <span className="file-upload-button">📁 انتخاب فایل</span>
            </label>
            <span className="or-text">یا</span>
            <span className="paste-text">مستقیماً پیست کنید:</span>
          </div>
          
          <textarea
            className="import-textarea"
            value={importText}
            onChange={(e) => {
              setImportText(e.target.value)
              setError('')
            }}
            placeholder="داده‌های JSON را اینجا پیست کنید..."
            rows={6}
          />
          
          {error && <div className="import-error">{error}</div>}
          
          <div className="import-actions">
            <button className="cancel-button" onClick={() => {
              setShowImport(false)
              setImportText('')
              setError('')
            }}>
              انصراف
            </button>
            <button className="confirm-button" onClick={handleImport}>
              وارد کردن
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

