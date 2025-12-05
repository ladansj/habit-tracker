// استفاده از jalaali-js با import مناسب برای Vite
// @ts-ignore
import jalaaliLib from 'jalaali-js'

// نام ماه‌های شمسی
export const jalaliMonths = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
]

// نام روزهای هفته
export const jalaliWeekdays = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه']

// تبدیل تاریخ میلادی به شمسی
export function toJalaliDate(date: Date): { jy: number; jm: number; jd: number } {
  const gregorian = {
    gy: date.getFullYear(),
    gm: date.getMonth() + 1,
    gd: date.getDate(),
  }
  // @ts-ignore
  return jalaaliLib.toJalaali(gregorian.gy, gregorian.gm, gregorian.gd)
}

// تبدیل تاریخ شمسی به میلادی
export function fromJalaliDate(jy: number, jm: number, jd: number): Date {
  // @ts-ignore
  const gregorian = jalaaliLib.toGregorian(jy, jm, jd)
  return new Date(gregorian.gy, gregorian.gm - 1, gregorian.gd)
}

// فرمت تاریخ شمسی
export function formatJalali(date: Date, format: string = 'yyyy/mm/dd'): string {
  const jalali = toJalaliDate(date)
  const monthName = jalaliMonths[jalali.jm - 1]
  
  if (format === 'yyyy/mm/dd') {
    return `${jalali.jy}/${String(jalali.jm).padStart(2, '0')}/${String(jalali.jd).padStart(2, '0')}`
  } else if (format === 'd MMMM yyyy') {
    return `${jalali.jd} ${monthName} ${jalali.jy}`
  } else if (format === 'MMMM yyyy') {
    return `${monthName} ${jalali.jy}`
  } else if (format === 'd') {
    return String(jalali.jd)
  }
  
  return `${jalali.jy}/${jalali.jm}/${jalali.jd}`
}

// شروع ماه شمسی
export function startOfJalaliMonth(jy: number, jm: number): Date {
  return fromJalaliDate(jy, jm, 1)
}

// پایان ماه شمسی
export function endOfJalaliMonth(jy: number, jm: number): Date {
  // تعداد روزهای ماه شمسی
  const daysInMonth = jm <= 6 ? 31 : jm === 12 && !isJalaliLeapYear(jy) ? 29 : 30
  return fromJalaliDate(jy, jm, daysInMonth)
}

// بررسی سال کبیسه شمسی
export function isJalaliLeapYear(jy: number): boolean {
  const leapYears = [1, 5, 9, 13, 17, 22, 26, 30]
  return leapYears.includes((jy - 1) % 33)
}

// تعداد روزهای ماه شمسی
export function daysInJalaliMonth(jy: number, jm: number): number {
  if (jm <= 6) return 31
  if (jm === 12 && !isJalaliLeapYear(jy)) return 29
  return 30
}

// روز هفته شمسی (شنبه = 0)
export function getJalaliWeekday(date: Date): number {
  const weekday = date.getDay()
  // تبدیل از یکشنبه=0 به شنبه=0
  return (weekday + 1) % 7
}
