'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import TopBar from '@/components/admin/TopBar'
import { useStore } from '@/lib/store'
import type { RiskLevel } from '@/lib/types'

interface InstagramStatus {
  configured: boolean
  connection: {
    username?: string
    accountType?: string
    status?: string
    expiresAt?: string
    lastRefreshedAt?: string
    lastPublishAt?: string
    lastError?: string
  } | null
}

function parseNumberOrFallback(value: string, fallback: number): number {
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) ? parsed : fallback
}

export default function SettingsPage() {
  const settings = useStore((s) => s.settings)
  const updateSettings = useStore((s) => s.updateSettings)
  const [saved, setSaved] = useState(false)
  const [instagram, setInstagram] = useState<InstagramStatus | null>(null)
  const [integrationMessage, setIntegrationMessage] = useState<string | null>(null)
  const [integrationLoading, setIntegrationLoading] = useState(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    const status = searchParams.get('instagram')
    const message = searchParams.get('message')
    if (status === 'connected') setIntegrationMessage('Instagram connected.')
    if (status === 'error') setIntegrationMessage(message || 'Instagram connection failed.')
  }, [searchParams])

  const loadInstagramStatus = async () => {
    const res = await fetch('/api/integrations/instagram')
    if (!res.ok) return
    setInstagram(await res.json())
  }

  useEffect(() => {
    loadInstagramStatus()
  }, [])

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleConnectInstagram = async () => {
    setIntegrationLoading(true)
    setIntegrationMessage(null)
    try {
      const res = await fetch('/api/integrations/instagram/auth-url')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to start Instagram connection')
      window.location.href = data.url
    } catch (error) {
      setIntegrationMessage(error instanceof Error ? error.message : 'Failed to start Instagram connection')
      setIntegrationLoading(false)
    }
  }

  const handleRefreshInstagram = async () => {
    setIntegrationLoading(true)
    setIntegrationMessage(null)
    try {
      const res = await fetch('/api/integrations/instagram/refresh', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to refresh Instagram token')
      setIntegrationMessage('Instagram token refreshed.')
      await loadInstagramStatus()
    } catch (error) {
      setIntegrationMessage(error instanceof Error ? error.message : 'Failed to refresh Instagram token')
    } finally {
      setIntegrationLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-3xl space-y-6">
      <TopBar title="Settings" />

      <section className="bg-white rounded-xl border divide-y">
        <div className="p-4">
          <h3 className="font-semibold text-gray-900">Instagram Publishing</h3>
          <p className="text-xs text-gray-400 mt-1">Connect one professional Instagram account for API publishing.</p>
        </div>
        <div className="p-4 space-y-3">
          {!instagram?.configured && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              Instagram env vars are not configured yet.
            </div>
          )}
          {instagram?.connection ? (
            <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
              Connected as <span className="font-semibold">@{instagram.connection.username}</span>
              {instagram.connection.accountType ? ` (${instagram.connection.accountType})` : ''}
              <div className="text-xs text-green-700 mt-1">
                Status: {instagram.connection.status || 'connected'}
                {instagram.connection.expiresAt ? ` - Expires ${new Date(instagram.connection.expiresAt).toLocaleDateString()}` : ''}
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600">
              No Instagram account connected.
            </div>
          )}
          {instagram?.connection?.lastError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {instagram.connection.lastError}
            </div>
          )}
          {integrationMessage && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-700">
              {integrationMessage}
            </div>
          )}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={handleConnectInstagram}
              disabled={integrationLoading || !instagram?.configured}
              className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-black disabled:opacity-50 transition-colors"
            >
              {instagram?.connection ? 'Reconnect Instagram' : 'Connect Instagram'}
            </button>
            <button
              onClick={handleRefreshInstagram}
              disabled={integrationLoading || !instagram?.connection}
              className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Refresh Token
            </button>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-xl border divide-y">
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
            min={720}
            max={2160}
            value={settings.exportImageSize}
            onChange={(e) => updateSettings({
              exportImageSize: parseNumberOrFallback(e.target.value, settings.exportImageSize),
            })}
          />
          <p className="text-xs text-gray-400">Instagram square publishing expects a square public image. 1080 is recommended.</p>
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
      </section>

      <button
        onClick={handleSave}
        className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
      >
        {saved ? 'Saved' : 'Save Settings'}
      </button>
    </div>
  )
}
