```tsx
import { useState } from 'react'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isToday,
  addMonths,
  subMonths,
} from 'date-fns'

import { useHabits } from '../contexts/HabitContext'

import {
  toJalaliDate,
  formatJalali,
  startOfJalaliMonth,
  endOfJalaliMonth,
  getJalaliWeekday,
  jalaliMonths,
  jalaliWeekdays,
  fromJalaliDate,
} from '../utils/jalali'

import './Calendar.css'


type CalendarType = 'gregorian' | 'jalali'


const gregorianWeekdays = [
  'یکشنبه',
  'دوشنبه',
  'سه‌شنبه',
  'چهارشنبه',
  'پنجشنبه',
  'جمعه',
  'شنبه',
]

export default function Calendar() {

  const [currentDate, setCurrentDate] =
    useState(new Date())

  const [selectedDate, setSelectedDate] =
    useState<Date | null>(null)

  const [calendarType, setCalendarType] =
    useState<CalendarType>('jalali')


  const {
    habits,
    toggleHabitDate,
    isHabitCompleted,
  } = useHabits()

  const getMonthData = () => {

    if (calendarType === 'jalali') {

      const jalali =
        toJalaliDate(currentDate)


      const monthStart =
        startOfJalaliMonth(
          jalali.jy,
          jalali.jm
        )


      const monthEnd =
        endOfJalaliMonth(
          jalali.jy,
          jalali.jm
        )


      const daysInMonth =
        eachDayOfInterval({
          start: monthStart,
          end: monthEnd,
        })


      const firstDayWeekday =
        getJalaliWeekday(monthStart)


      const emptyDays =
        Array.from(
          {
            length: firstDayWeekday,
          },
          (_, index) => index
        )


      return {
        daysInMonth,
        emptyDays,
        monthStart,
        monthEnd,
        jalali,
      }
    }


  
    const monthStart =
      startOfMonth(currentDate)


    const monthEnd =
      endOfMonth(currentDate)


    const daysInMonth =
      eachDayOfInterval({
        start: monthStart,
        end: monthEnd,
      })

    const firstDayOfWeek =
      monthStart.getDay()


    const emptyDays =
      Array.from(
        {
          length: firstDayOfWeek,
        },
        (_, index) => index
      )


    return {
      daysInMonth,
      emptyDays,
      monthStart,
      monthEnd,
      jalali: undefined,
    }
  }


  const {
    daysInMonth,
    emptyDays,
    jalali,
  } = getMonthData()

  const prevMonth = () => {

    if (
      calendarType === 'jalali' &&
      jalali
    ) {

      let newJy =
        jalali.jy

      let newJm =
        jalali.jm - 1


      if (newJm < 1) {

        newJm = 12
        newJy--
      }


      setCurrentDate(
        fromJalaliDate(
          newJy,
          newJm,
          1
        )
      )

      return
    }


    setCurrentDate(
      subMonths(
        currentDate,
        1
      )
    )
  }


  const nextMonth = () => {

    if (
      calendarType === 'jalali' &&
      jalali
    ) {

      let newJy =
        jalali.jy

      let newJm =
        jalali.jm + 1


      if (newJm > 12) {

        newJm = 1
        newJy++
      }


      setCurrentDate(
        fromJalaliDate(
          newJy,
          newJm,
          1
        )
      )

      return
    }


    setCurrentDate(
      addMonths(
        currentDate,
        1
      )
    )
  }


  const getMonthTitle = () => {

    if (
      calendarType === 'jalali' &&
      jalali
    ) {

      return `${
        jalaliMonths[jalali.jm - 1]
      } ${jalali.jy}`
    }


    return format(
      currentDate,
      'MMMM yyyy'
    )
  }

  const getDayCompletionCount = (
    date: Date
  ) => {

    return habits.filter(
      habit =>
        isHabitCompleted(
          habit.id,
          date
        )
    ).length
  }

  const handleDayClick = (
    day: Date
  ) => {

    setSelectedDate(day)
  }


  const handleHabitToggle = (
    habitId: string,
    date: Date
  ) => {

    toggleHabitDate(
      habitId,
      date
    )
  }

  const formatSelectedDate = (
    date: Date
  ) => {

    if (
      calendarType === 'jalali'
    ) {

      return formatJalali(
        date,
        'd MMMM yyyy'
      )
    }


    return format(
      date,
      'd MMMM yyyy'
    )
  }


  const isSelectedDate = (
    day: Date
  ) => {

    if (!selectedDate) {
      return false
    }


    return (
      format(
        selectedDate,
        'yyyy-MM-dd'
      ) ===
      format(
        day,
        'yyyy-MM-dd'
      )
    )
  }


  const weekdays =
    calendarType === 'jalali'
      ? jalaliWeekdays
      : gregorianWeekdays


  return (
    <div className="calendar-container">

      <div className="calendar-header">

        <div className="calendar-type-selector">

          <button
            type="button"
            className={
              `calendar-type-btn ${
                calendarType === 'jalali'
                  ? 'active'
                  : ''
              }`
            }
            onClick={() =>
              setCalendarType('jalali')
            }
          >
            شمسی
          </button>


          <button
            type="button"
            className={
              `calendar-type-btn ${
                calendarType === 'gregorian'
                  ? 'active'
                  : ''
              }`
            }
            onClick={() =>
              setCalendarType('gregorian')
            }
          >
            میلادی
          </button>

        </div>


        <div className="calendar-nav">

          <button
            type="button"
            className="calendar-nav-button"
            onClick={prevMonth}
            aria-label="ماه قبل"
          >
            ‹
          </button>


          <h2 className="calendar-title">
            {getMonthTitle()}
          </h2>


          <button
            type="button"
            className="calendar-nav-button"
            onClick={nextMonth}
            aria-label="ماه بعد"
          >
            ›
          </button>

        </div>

      </div>


      <div className="calendar-weekdays">

        {weekdays.map(
          (day, index) => (

            <div
              key={day}
              className="weekday"
              title={day}
            >
              {calendarType === 'jalali'
                ? day.substring(0, 1)
                : day.substring(0, 1)
              }
            </div>

          )
        )}

      </div>

      <div className="calendar-grid">


        {emptyDays.map(
          (_, index) => (

            <div
              key={`empty-${index}`}
              className="calendar-day empty"
              aria-hidden="true"
            />

          )
        )}


        {daysInMonth.map(
          day => {

            const completionCount =
              getDayCompletionCount(day)


            const totalHabits =
              habits.length


            const isCurrentDay =
              isToday(day)


            const completionPercentage =
              totalHabits > 0
                ? (
                    completionCount /
                    totalHabits
                  ) * 100
                : 0


            return (

              <div
                key={
                  day.toISOString()
                }
                className={
                  `calendar-day ${
                    isCurrentDay
                      ? 'today'
                      : ''
                  } ${
                    isSelectedDate(day)
                      ? 'selected'
                      : ''
                  }`
                }
                onClick={() =>
                  handleDayClick(day)
                }
                title={
                  `${completionCount} از ${
                    totalHabits
                  } عادت تکمیل شده - کلیک برای جزئیات`
                }
              >

                <span className="day-number">

                  {calendarType === 'jalali'
                    ? formatJalali(
                        day,
                        'd'
                      )
                    : format(
                        day,
                        'd'
                      )
                  }

                </span>


                {totalHabits > 0 && (
                  <>


                    <div
                      className="day-progress"
                      style={{
                        height:
                          `${completionPercentage}%`,

                        backgroundColor:
                          completionPercentage === 100
                            ? 'var(--success)'
                            : completionPercentage > 0
                              ? 'var(--accent)'
                              : 'transparent',
                      }}
                      aria-hidden="true"
                    />

                    <div className="day-habits-indicators">

                      {habits
                        .slice(0, 4)
                        .map(habit => {

                          const comp
```
