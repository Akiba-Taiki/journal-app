'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { pullFromSupabase, pushAllToSupabase } from '@/lib/sync'
import type { User } from '@supabase/supabase-js'

interface Props {
  onSynced?: () => void
}

export default function AuthButton({ onSynced }: Props) {
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<'loading' | 'idle' | 'syncing'>('loading')

  useEffect(() => {
    if (!supabase) { setStatus('idle'); return }

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setStatus('idle')
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (event === 'SIGNED_IN' && currentUser) {
        setStatus('syncing')
        await pushAllToSupabase()  // ローカルデータをアップロード
        await pullFromSupabase()   // クラウドからマージ
        setStatus('idle')
        onSynced?.()
      }
    })

    return () => subscription.unsubscribe()
  }, [onSynced])

  if (!supabase) return null
  if (status === 'loading') return null

  if (status === 'syncing') return (
    <span className="text-xs text-stone-400 animate-pulse">☁️ 同期中...</span>
  )

  if (user) return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-stone-400">☁️ 同期ON</span>
      <button
        onClick={() => supabase!.auth.signOut()}
        className="text-xs text-stone-400 underline"
      >
        ログアウト
      </button>
    </div>
  )

  return (
    <button
      onClick={() => supabase!.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      })}
      className="text-xs text-stone-500 border border-stone-200 rounded-lg px-3 py-1 hover:bg-stone-50 active:bg-stone-100"
    >
      Googleで同期
    </button>
  )
}
