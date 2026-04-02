'use client'
import { useState } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameMonth, isToday } from 'date-fns'
import { ja } from 'date-fns/locale'
import { getAllEntries } from '@/lib/storage'

interface Props {
  onSelectDate: (date: string) => void
  selectedDate: string
}

export default function CalendarView({ onSelectDate, selectedDate }: Props) {
  const [viewMonth, setViewMonth] = useState(new Date())
  const entries = getAllEntries()

  const monthStart = startOfMonth(viewMonth)
  const monthEnd = endOfMonth(viewMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // 月の最初の曜日（0=日）に合わせて空白を作る
  const startPadding = getDay(monthStart)

  function prevMonth() {
    setViewMonth(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))
  }

  function nextMonth() {
    setViewMonth(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))
  }

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-1 text-stone-400 hover:text-stone-600">‹</button>
        <span className="font-semibold text-stone-700">
          {format(viewMonth, 'yyyy年M月', { locale: ja })}
        </span>
        <button onClick={nextMonth} className="p-1 text-stone-400 hover:text-stone-600">›</button>
      </div>

      {/* 曜日 */}
      <div className="grid grid-cols-7 mb-1">
        {['日', '月', '火', '水', '木', '金', '土'].map(d => (
          <div key={d} className="text-center text-xs text-stone-400 py-1">{d}</div>
        ))}
      </div>

      {/* 日付グリッド */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: startPadding }).map((_, i) => (
          <div key={`pad-${i}`} />
        ))}
        {days.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd')
          const hasEntry = !!entries[dateStr]
          const isSelected = dateStr === selectedDate
          const today = isToday(day)

          return (
            <button
              key={dateStr}
              onClick={() => onSelectDate(dateStr)}
              className={`
                aspect-square flex flex-col items-center justify-center rounded-xl text-sm transition-all
                ${isSelected ? 'bg-amber-400 text-white font-bold' : ''}
                ${!isSelected && today ? 'border-2 border-amber-400 text-amber-600 font-bold' : ''}
                ${!isSelected && !today ? 'text-stone-600 hover:bg-stone-50' : ''}
              `}
            >
              <span>{format(day, 'd')}</span>
              {hasEntry && !isSelected && (
                <span className="w-1 h-1 rounded-full bg-amber-400 mt-0.5" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
