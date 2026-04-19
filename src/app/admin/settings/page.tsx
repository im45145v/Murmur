'use client'
import { useStore } from '@/lib/store'
import TopBar from '@/components/admin/TopBar'
import { useState } from 'react'
import type { RiskLevel } from '@/lib/types'

function parseNumberOrFallback(value: string, fallback: number): number {
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) ? parsed : fallback
}

export default function SettingsPage() {
  const settings = useStore((s) => s.settings)
  const updateSettings = useStore((s) => s.updateSettings)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <TopBar title="Settings" />
      <div className="bg-white rounded-xl border divide-y">
        <div className="p-4 space-y-1">
          <label className="text-sm font-medium text-gray-700">Page Branding</label>
          <input
            className="w-full border rounded-lg px-3 py-2 text-sm"
            value={settings.pageBranding}
            onChange={(e) => updateSettings({ pageBranding: e.target.value })}
          />
        </div>
        <div className="p-4 space-y-1">
          <label className="text-sm font-medium text-gray-700">Default Caption Signoff</label>
          <input
            className="w-full border rounded-lg px-3 py-2 text-sm"
            value={settings.defaultCaptionSignoff}
            onChange={(e) => updateSettings({ defaultCaptionSignoff: e.target.value })}
          />
        </div>
        <div className="p-4 space-y-1">
          <label className="text-sm font-medium text-gray-700">Moderation Threshold</label>
          <select
            className="w-full border rounded-lg px-3 py-2 text-sm"
            value={settings.moderationThreshold}
            onChange={(e) => updateSettings({ moderationThreshold: e.target.value as RiskLevel })}
          >
            {(['Low', 'Medium', 'High', 'Critical'] as RiskLevel[]).map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
        <div className="p-4 space-y-1">
          <label className="text-sm font-medium text-gray-700">Max Character Length</label>
          <input
            type="number"
            className="w-full border rounded-lg px-3 py-2 text-sm"
            value={settings.maxCharacterLength}
            onChange={(e) => updateSettings({
              maxCharacterLength: parseNumberOrFallback(e.target.value, settings.maxCharacterLength),
            })}
          />
        </div>
        <div className="p-4 space-y-1">
          <label className="text-sm font-medium text-gray-700">Export Image Size (px)</label>
          <input
            type="number"
            className="w-full border rounded-lg px-3 py-2 text-sm"
            value={settings.exportImageSize}
            onChange={(e) => updateSettings({
              exportImageSize: parseNumberOrFallback(e.target.value, settings.exportImageSize),
            })}
          />
        </div>
        <div className="p-4 flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">Watermark Enabled</label>
          <button
            onClick={() => updateSettings({ watermarkEnabled: !settings.watermarkEnabled })}
            className={`w-12 h-6 rounded-full transition-colors ${
              settings.watermarkEnabled ? 'bg-indigo-600' : 'bg-gray-300'
            }`}
          >
            <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${
              settings.watermarkEnabled ? 'translate-x-6' : 'translate-x-0'
            }`} />
          </button>
        </div>
        <div className="p-4 space-y-1">
          <label className="text-sm font-medium text-gray-700">Footer Signature Format</label>
          <input
            className="w-full border rounded-lg px-3 py-2 text-sm"
            value={settings.footerSignatureFormat}
            onChange={(e) => updateSettings({ footerSignatureFormat: e.target.value })}
          />
        </div>
      </div>
      <button
        onClick={handleSave}
        className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
      >
        {saved ? '✓ Saved!' : 'Save Settings'}
      </button>
    </div>
  )
}
