import { JournalEntry, Habit } from './types'

const ENTRIES_KEY = 'journal_entries'
const HABITS_KEY = 'journal_habits'

// --- Journal Entries ---

export function getAllEntries(): Record<string, JournalEntry> {
  if (typeof window === 'undefined') return {}
  const raw = localStorage.getItem(ENTRIES_KEY)
  return raw ? JSON.parse(raw) : {}
}

export function getEntry(date: string): JournalEntry | null {
  const all = getAllEntries()
  return all[date] ?? null
}

export function saveEntry(entry: JournalEntry): void {
  const all = getAllEntries()
  all[entry.date] = entry
  localStorage.setItem(ENTRIES_KEY, JSON.stringify(all))
}

export function getEmptyEntry(date: string): JournalEntry {
  return {
    date,
    sleep: {
      bedtime: '',
      wakeTime: '',
      moodBeforeSleep: null,
      moodOnWake: null,
    },
    threeGood: {
      bestMoment: '',
      proudMoment: '',
      messageToTomorrow: '',
    },
    journaling: {
      mainEvents: '',
      emotionAndReason: '',
      insight: '',
      onMind: '',
    },
    moodEndOfDay: null,
    habitChecks: {},
  }
}

// --- Habits ---

export function getHabits(): Habit[] {
  if (typeof window === 'undefined') return []
  const raw = localStorage.getItem(HABITS_KEY)
  return raw ? JSON.parse(raw) : []
}

export function saveHabits(habits: Habit[]): void {
  localStorage.setItem(HABITS_KEY, JSON.stringify(habits))
}

export function addHabit(name: string, startDate: string): Habit {
  const habits = getHabits()
  const newHabit: Habit = {
    id: crypto.randomUUID(),
    name,
    startDate,
  }
  habits.push(newHabit)
  saveHabits(habits)
  return newHabit
}

export function deleteHabit(id: string): void {
  const habits = getHabits().filter(h => h.id !== id)
  saveHabits(habits)
}

// --- Streak計算 ---

export function calcStreak(habitId: string, today: string): number {
  const entries = getAllEntries()
  let streak = 0
  const current = new Date(today)

  while (true) {
    const dateStr = current.toISOString().split('T')[0]
    const entry = entries[dateStr]
    if (entry?.habitChecks?.[habitId]) {
      streak++
      current.setDate(current.getDate() - 1)
    } else {
      break
    }
  }
  return streak
}

// --- スタートからの経過日数 ---

export function calcDaysSinceStart(startDate: string, today: string): number {
  const start = new Date(startDate)
  const end = new Date(today)
  const diff = end.getTime() - start.getTime()
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)) + 1)
}

// --- Markdownエクスポート ---

export function exportToMarkdown(from: string, to: string): string {
  const entries = getAllEntries()
  const habits = getHabits()

  const dates = Object.keys(entries)
    .filter(d => d >= from && d <= to)
    .sort()

  if (dates.length === 0) return '記録がありません。'

  const lines: string[] = [`# あきばのジャーナル（${from} 〜 ${to}）\n`]

  for (const date of dates) {
    const e = entries[date]
    lines.push(`## ${date}`)

    lines.push(`\n### 睡眠`)
    lines.push(`- 就寝：${e.sleep.bedtime || '未記録'}　起床：${e.sleep.wakeTime || '未記録'}`)
    lines.push(`- 寝るときの気分：${e.sleep.moodBeforeSleep ?? '未記録'}　寝起きの気分：${e.sleep.moodOnWake ?? '未記録'}`)

    lines.push(`\n### 3 Good Things`)
    lines.push(`1. 今日のいちばん良かった瞬間：${e.threeGood.bestMoment || '未記録'}`)
    lines.push(`2. 自分がちょっとかっこよかったこと：${e.threeGood.proudMoment || '未記録'}`)
    lines.push(`3. 明日の自分に一言：${e.threeGood.messageToTomorrow || '未記録'}`)

    if (e.journaling.emotionAndReason || e.journaling.insight || e.journaling.onMind) {
      lines.push(`\n### Journaling`)
      if (e.journaling.emotionAndReason) lines.push(`- 感じた感情と理由：${e.journaling.emotionAndReason}`)
      if (e.journaling.insight) lines.push(`- 今日の気づき：${e.journaling.insight}`)
      if (e.journaling.onMind) lines.push(`- 気になること：${e.journaling.onMind}`)
    }

    lines.push(`\n### 今日の気分：${e.moodEndOfDay ?? '未記録'}`)

    if (habits.length > 0) {
      lines.push(`\n### 習慣`)
      for (const h of habits) {
        const done = e.habitChecks?.[h.id] ? '✅' : '❌'
        lines.push(`- ${done} ${h.name}`)
      }
    }

    lines.push('')
  }

  return lines.join('\n')
}
