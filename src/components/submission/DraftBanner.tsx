'use client'

interface Props {
  onRestore: () => void
  onClear: () => void
}

export default function DraftBanner({ onRestore, onClear }: Props) {
  return (
    <div className="bg-indigo-500/20 border border-indigo-400/30 rounded-lg px-4 py-3 flex items-center justify-between">
      <p className="text-indigo-200 text-sm">📝 You have an unsaved draft</p>
      <div className="flex gap-3">
        <button onClick={onRestore} className="text-indigo-300 hover:text-white text-xs font-medium">Restore</button>
        <button onClick={onClear} className="text-white/40 hover:text-white/70 text-xs">Clear</button>
      </div>
    </div>
  )
}
