export type Mood = '😔' | '😐' | '🙂' | '😊' | '😄'

export const MOODS: Mood[] = ['😔', '😐', '🙂', '😊', '😄']

export interface JournalEntry {
  date: string // YYYY-MM-DD
  sleep: {
    bedtime: string // HH:MM
    wakeTime: string // HH:MM
    moodBeforeSleep: Mood | null
    moodOnWake: Mood | null
  }
  threeGood: {
    bestMoment: string
    proudMoment: string
    messageToTomorrow: string
  }
  journaling: {
    mainEvents: string
    emotionAndReason: string
    insight: string
    onMind: string
  }
  moodEndOfDay: Mood | null
  habitChecks: Record<string, boolean> // habitId -> done
}

export interface Habit {
  id: string
  name: string
  startDate: string // YYYY-MM-DD
}
