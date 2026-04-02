'use client'
import { Mood, MOODS } from '@/lib/types'

interface Props {
  value: Mood | null
  onChange: (mood: Mood) => void
}

export default function MoodPicker({ value, onChange }: Props) {
  return (
    <div className="flex gap-2">
      {MOODS.map(m => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className={`text-2xl p-1 rounded-full transition-all ${
            value === m ? 'scale-125 bg-amber-100' : 'opacity-50 hover:opacity-80'
          }`}
        >
          {m}
        </button>
      ))}
    </div>
  )
}
