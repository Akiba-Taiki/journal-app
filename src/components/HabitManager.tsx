'use client'
import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Habit } from '@/lib/types'
import { getHabits, addHabit, deleteHabit, calcDaysSinceStart } from '@/lib/storage'

export default function HabitManager() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [newName, setNewName] = useState('')
  const today = format(new Date(), 'yyyy-MM-dd')
  const [newStartDate, setNewStartDate] = useState(today)

  useEffect(() => {
    setHabits(getHabits())
  }, [])

  function handleAdd() {
    if (!newName.trim()) return
    addHabit(newName.trim(), newStartDate)
    setHabits(getHabits())
    setNewName('')
    setNewStartDate(today)
  }

  function handleDelete(id: string) {
    deleteHabit(id)
    setHabits(getHabits())
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
        <h3 className="font-semibold text-stone-700 mb-3">🔥 習慣トラッカー</h3>

        {habits.length === 0 ? (
          <p className="text-sm text-stone-400 text-center py-4">習慣がまだありません</p>
        ) : (
          <div className="space-y-2 mb-4">
            {habits.map(h => {
              const days = calcDaysSinceStart(h.startDate, today)
              return (
                <div key={h.id} className="flex items-center justify-between px-3 py-2 bg-stone-50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium">{h.name}</p>
                    <p className="text-xs text-stone-400">
                      🔥 {h.startDate} スタート・{days}日継続中
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(h.id)}
                    className="text-stone-300 hover:text-red-400 text-lg"
                  >
                    ×
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {/* 追加フォーム */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              placeholder="新しい習慣を追加（例：Duolingo中国語）"
              className="flex-1 border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-300"
            />
          </div>
          <div className="flex gap-2 items-center">
            <label className="text-xs text-stone-500 whitespace-nowrap">スタート日</label>
            <input
              type="date"
              value={newStartDate}
              max={today}
              onChange={e => setNewStartDate(e.target.value)}
              className="flex-1 border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-300"
            />
            <button
              onClick={handleAdd}
              className="bg-amber-400 text-white px-4 py-2 rounded-xl text-sm font-bold active:bg-amber-500"
            >
              追加
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
