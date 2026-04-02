'use client'
import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { JournalEntry, Habit, Mood } from '@/lib/types'
import { getEntry, getEmptyEntry, saveEntry, getHabits, calcStreak } from '@/lib/storage'
import MoodPicker from './MoodPicker'

interface Props {
  date: string
  onSaved: () => void
}

export default function RecordForm({ date, onSaved }: Props) {
  const [entry, setEntry] = useState<JournalEntry>(getEmptyEntry(date))
  const [habits, setHabits] = useState<Habit[]>([])
  const [saved, setSaved] = useState(false)
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'evening'>('morning')

  useEffect(() => {
    const existing = getEntry(date)
    setEntry(existing ?? getEmptyEntry(date))
    setHabits(getHabits())
    setSaved(false)
  }, [date])

  function handleSave() {
    saveEntry(entry)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    onSaved()
  }

  function updateSleep<K extends keyof JournalEntry['sleep']>(key: K, val: JournalEntry['sleep'][K]) {
    setEntry(e => ({ ...e, sleep: { ...e.sleep, [key]: val } }))
  }

  function updateGood<K extends keyof JournalEntry['threeGood']>(key: K, val: string) {
    setEntry(e => ({ ...e, threeGood: { ...e.threeGood, [key]: val } }))
  }

  function updateJournaling<K extends keyof JournalEntry['journaling']>(key: K, val: string) {
    setEntry(e => ({ ...e, journaling: { ...e.journaling, [key]: val } }))
  }

  function toggleHabit(habitId: string) {
    setEntry(e => ({
      ...e,
      habitChecks: { ...e.habitChecks, [habitId]: !e.habitChecks[habitId] },
    }))
  }

  const displayDate = format(new Date(date + 'T00:00:00'), 'yyyy年M月d日')

  return (
    <div className="space-y-6 pb-16">
      <h2 className="text-xl font-bold text-stone-700">{displayDate}</h2>

      {/* 朝/夜 切り替え */}
      <div className="flex gap-1 bg-stone-200 rounded-2xl p-1">
        <button
          onClick={() => setTimeOfDay('morning')}
          className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
            timeOfDay === 'morning' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500'
          }`}
        >
          🌅 朝
        </button>
        <button
          onClick={() => setTimeOfDay('evening')}
          className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
            timeOfDay === 'evening' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500'
          }`}
        >
          🌙 夜
        </button>
      </div>

      {/* 朝セクション */}
      {timeOfDay === 'morning' && (
        <Section title="🌅 睡眠記録">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-stone-500 block mb-1">就寝時刻</label>
              <input
                type="time"
                value={entry.sleep.bedtime}
                onChange={e => updateSleep('bedtime', e.target.value)}
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-stone-500 block mb-1">起床時刻</label>
              <input
                type="time"
                value={entry.sleep.wakeTime}
                onChange={e => updateSleep('wakeTime', e.target.value)}
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="mt-3 space-y-3">
            <div>
              <label className="text-xs text-stone-500 block mb-1">寝るときの気分</label>
              <MoodPicker
                value={entry.sleep.moodBeforeSleep}
                onChange={v => updateSleep('moodBeforeSleep', v)}
              />
            </div>
            <div>
              <label className="text-xs text-stone-500 block mb-1">寝起きの気分</label>
              <MoodPicker
                value={entry.sleep.moodOnWake}
                onChange={v => updateSleep('moodOnWake', v)}
              />
            </div>
          </div>
        </Section>
      )}

      {/* 夜セクション */}
      {timeOfDay === 'evening' && (
        <>
          <Section title="😊 1日を終えた今の気分">
            <MoodPicker
              value={entry.moodEndOfDay}
              onChange={v => setEntry(e => ({ ...e, moodEndOfDay: v }))}
            />
          </Section>

          {habits.length > 0 && (
            <Section title="🔥 習慣トラッカー">
              <div className="space-y-2">
                {habits.map(h => {
                  const streak = calcStreak(h.id, date)
                  const done = !!entry.habitChecks[h.id]
                  return (
                    <button
                      key={h.id}
                      onClick={() => toggleHabit(h.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                        done ? 'bg-amber-50 border-amber-300' : 'bg-white border-stone-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{done ? '✅' : '⬜'}</span>
                        <span className="text-sm font-medium">{h.name}</span>
                      </div>
                      <span className="text-xs text-stone-400">
                        {done ? `${streak + 1}日継続中` : streak > 0 ? `${streak}日継続中` : ''}
                      </span>
                    </button>
                  )
                })}
              </div>
            </Section>
          )}

          <Section title="📝 Journaling">
            <TextArea
              label="今日の主な出来事"
              value={entry.journaling.mainEvents}
              onChange={v => updateJournaling('mainEvents', v)}
              placeholder="今日あったことを自由に書こう"
              rows={4}
            />
            <TextArea
              label="今日いちばん強く感じた感情と、その理由"
              value={entry.journaling.emotionAndReason}
              onChange={v => updateJournaling('emotionAndReason', v)}
              placeholder="例：うれしかった。〇〇さんに認めてもらえたから。"
              rows={3}
            />
            <TextArea
              label="今日の気づき"
              value={entry.journaling.insight}
              onChange={v => updateJournaling('insight', v)}
              placeholder="どんな小さな気づきでも"
              rows={3}
            />
            <TextArea
              label="最近気になっていること・もやもや"
              value={entry.journaling.onMind}
              onChange={v => updateJournaling('onMind', v)}
              placeholder="頭の中にあるものを吐き出そう"
              rows={3}
            />
          </Section>

          <Section title="✨ 3 Good Things">
            <TextArea
              label="今日のいちばん良かった瞬間"
              value={entry.threeGood.bestMoment}
              onChange={v => updateGood('bestMoment', v)}
              placeholder="どんな小さなことでもOK"
            />
            <TextArea
              label="自分がちょっとかっこよかったこと"
              value={entry.threeGood.proudMoment}
              onChange={v => updateGood('proudMoment', v)}
              placeholder="自分を褒めてあげよう"
            />
            <TextArea
              label="明日の自分に一言"
              value={entry.threeGood.messageToTomorrow}
              onChange={v => updateGood('messageToTomorrow', v)}
              placeholder="明日の自分へのメッセージ"
            />
          </Section>
        </>
      )}

      {/* 保存ボタン */}
      <button
        onClick={handleSave}
        className={`w-full py-4 rounded-2xl font-bold text-white text-lg transition-all ${
          saved ? 'bg-green-400' : 'bg-amber-400 active:bg-amber-500'
        }`}
      >
        {saved ? '✓ 保存しました' : '保存する'}
      </button>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100 space-y-3">
      <h3 className="font-semibold text-stone-700">{title}</h3>
      {children}
    </div>
  )
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
  rows = 2,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
}) {
  return (
    <div>
      <label className="text-xs text-stone-500 block mb-1">{label}</label>
      <textarea
        rows={rows}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-amber-300"
      />
    </div>
  )
}
