'use client'
import { useState } from 'react'
import { format, subDays } from 'date-fns'
import { exportToMarkdown } from '@/lib/storage'

interface Props {
  onClose: () => void
}

export default function ExportModal({ onClose }: Props) {
  const today = format(new Date(), 'yyyy-MM-dd')
  const [from, setFrom] = useState(format(subDays(new Date(), 6), 'yyyy-MM-dd'))
  const [to, setTo] = useState(today)

  function handleExport() {
    const md = exportToMarkdown(from, to)
    const blob = new Blob([md], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `journal_${from}_${to}.md`
    a.click()
    URL.revokeObjectURL(url)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end justify-center z-50" onClick={onClose}>
      <div
        className="bg-white w-full max-w-md rounded-t-3xl p-6 space-y-4"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="font-bold text-stone-700 text-lg">📤 Markdownエクスポート</h3>
        <p className="text-xs text-stone-400">期間を選んでクロコに共有しよう</p>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-stone-500 block mb-1">開始日</label>
            <input
              type="date"
              value={from}
              onChange={e => setFrom(e.target.value)}
              className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-stone-500 block mb-1">終了日</label>
            <input
              type="date"
              value={to}
              onChange={e => setTo(e.target.value)}
              className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm"
            />
          </div>
        </div>

        <button
          onClick={handleExport}
          className="w-full bg-amber-400 text-white py-3 rounded-2xl font-bold active:bg-amber-500"
        >
          ダウンロード
        </button>
        <button
          onClick={onClose}
          className="w-full text-stone-400 text-sm py-2"
        >
          キャンセル
        </button>
      </div>
    </div>
  )
}
