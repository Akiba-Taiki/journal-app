import { supabase } from './supabase'
import { getAllEntries, saveEntry, getHabits, saveHabits } from './storage'
import { Habit } from './types'

// Supabaseからデータを取得してlocalStorageに反映
export async function pullFromSupabase(): Promise<void> {
  if (!supabase) return
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const [{ data: entries }, { data: habits }] = await Promise.all([
    supabase.from('journal_entries').select('date, data').eq('user_id', user.id),
    supabase.from('habits').select('id, name, start_date').eq('user_id', user.id),
  ])

  if (entries) {
    for (const row of entries) {
      saveEntry(row.data)
    }
  }

  if (habits) {
    const habitList: Habit[] = habits.map(h => ({
      id: h.id,
      name: h.name,
      startDate: h.start_date,
    }))
    // ローカルの習慣とマージ（IDが被らないものを追加）
    const localHabits = getHabits()
    const localIds = new Set(localHabits.map(h => h.id))
    const merged = [...localHabits, ...habitList.filter(h => !localIds.has(h.id))]
    saveHabits(merged)
  }
}

// localStorageの全データをSupabaseにプッシュ
export async function pushAllToSupabase(): Promise<void> {
  if (!supabase) return
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const entries = Object.values(getAllEntries())
  const habits = getHabits()

  await Promise.all([
    ...entries.map(entry =>
      supabase!.from('journal_entries').upsert({
        user_id: user.id,
        date: entry.date,
        data: entry,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,date' })
    ),
    pushHabitsToSupabase(habits, user.id),
  ])
}

export async function pushHabitsToSupabase(habits: Habit[], userId: string): Promise<void> {
  if (!supabase) return
  await supabase.from('habits').delete().eq('user_id', userId)
  if (habits.length === 0) return
  await supabase.from('habits').insert(
    habits.map(h => ({
      user_id: userId,
      id: h.id,
      name: h.name,
      start_date: h.startDate,
    }))
  )
}
