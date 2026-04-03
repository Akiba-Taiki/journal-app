'use client'
import { useState } from 'react'
import { format } from 'date-fns'
import RecordForm from '@/components/RecordForm'
import CalendarView from '@/components/CalendarView'
import HabitManager from '@/components/HabitManager'
import ExportModal from '@/components/ExportModal'
import AuthButton from '@/components/AuthButton'

type Tab = 'record' | 'calendar' | 'habits'

export default function Home() {
  const today = format(new Date(), 'yyyy-MM-dd')
  const [selectedDate, setSelectedDate] = useState(today)
  const [tab, setTab] = useState<Tab>('record')
  const [showExport, setShowExport] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [syncKey, setSyncKey] = useState(0)

  function handleSaved() {
    setRefreshKey(k => k + 1)
  }

  function handleSynced() {
    setSyncKey(k => k + 1)
  }

  function handleSelectDate(date: string) {
    setSelectedDate(date)
    setTab('record')
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-md mx-auto px-4 pt-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-stone-800">あきばの日記 📓</h1>
          <div className="flex items-center gap-2">
            <AuthButton onSynced={handleSynced} />
            <button
              onClick={() => setShowExport(true)}
              className="text-xs text-stone-400 border border-stone-200 px-3 py-1.5 rounded-xl hover:bg-stone-100"
            >
              エクスポート
            </button>
          </div>
        </div>

        {/* タブ */}
        <div className="flex gap-1 bg-stone-200 rounded-2xl p-1 mb-6">
          {([
            { key: 'record', label: '📝 記録' },
            { key: 'calendar', label: '📅 カレンダー' },
            { key: 'habits', label: '🔥 習慣' },
          ] as { key: Tab; label: string }[]).map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                tab === t.key ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* コンテンツ */}
        {tab === 'record' && (
          <RecordForm
            key={`${selectedDate}-${syncKey}`}
            date={selectedDate}
            onSaved={handleSaved}
          />
        )}

        {tab === 'calendar' && (
          <div className="space-y-4">
            <CalendarView
              key={`${refreshKey}-${syncKey}`}
              onSelectDate={handleSelectDate}
              selectedDate={selectedDate}
            />
            <p className="text-xs text-center text-stone-400">
              ● が記録済みの日。タップして編集できます。
            </p>
          </div>
        )}

        {tab === 'habits' && <HabitManager key={syncKey} />}
      </div>

      {/* 今日以外を選んでいるときに「今日に戻る」ボタン */}
      {tab === 'record' && selectedDate !== today && (
        <div className="fixed bottom-6 left-0 right-0 flex justify-center">
          <button
            onClick={() => setSelectedDate(today)}
            className="bg-stone-700 text-white text-sm px-5 py-2.5 rounded-full shadow-lg"
          >
            今日の記録に戻る
          </button>
        </div>
      )}

      {showExport && <ExportModal onClose={() => setShowExport(false)} />}
    </div>
  )
}
