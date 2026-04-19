'use client'
import { useMemo, useRef, useState } from 'react'
import type { Submission } from '@/lib/types'
import { useStore } from '@/lib/store'
import { getTemplateComponent, getDefaultTemplateId } from '@/components/templates'
import { Download, RefreshCw, Type } from 'lucide-react'
import { FONT_OPTIONS, getFontFamily, getDefaultFontForTemplate } from '@/lib/fonts'

interface Props {
  submission: Submission
}

export default function PostPreview({ submission }: Props) {
  const templates = useStore((s) => s.templates)
  const settings = useStore((s) => s.settings)
  const addGeneratedPost = useStore((s) => s.addGeneratedPost)
  const markPostDownloaded = useStore((s) => s.markPostDownloaded)
  const allCaptions = useStore((s) => s.captions)
  const captions = useMemo(() => allCaptions.filter((c) => c.submissionId === submission.id), [allCaptions, submission.id])

  const previewRef = useRef<HTMLDivElement>(null)
  const [downloading, setDownloading] = useState(false)
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null)
  const [selectedFontId, setSelectedFontId] = useState<string | null>(null)

  const templateId = submission.templateId ?? submission.preferredTemplateId ?? getDefaultTemplateId(submission, templates)
  const template = templates.find((t) => t.id === templateId) ?? templates[0]
  const themeId = selectedThemeId ?? template?.defaultTheme ?? template?.themes[0]?.id
  const theme = template?.themes.find((t) => t.id === themeId) ?? template?.themes[0]
  const fontId = selectedFontId ?? getDefaultFontForTemplate(templateId)
  const fontFamily = getFontFamily(fontId)

  if (!template || !theme) return null

  const TemplateComponent = getTemplateComponent(templateId)

  const handleDownload = async () => {
    if (!previewRef.current) return
    setDownloading(true)
    try {
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
      })
      const dataUrl = canvas.toDataURL('image/png')

      addGeneratedPost({
        submissionId: submission.id,
        templateId,
        themeId,
        captionId: submission.captionSelected ?? '',
        imageDataUrl: dataUrl,
      })

      const a = document.createElement('a')
      a.href = dataUrl
      a.download = `murmur-${submission.id}.png`
      a.click()
    } catch (e) {
      console.error('Download failed', e)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Preview</h3>
        <div className="flex gap-2">
          {template.themes.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedThemeId(t.id)}
              className={`w-6 h-6 rounded-full border-2 transition-all ${
                themeId === t.id ? 'border-indigo-500 scale-110' : 'border-gray-300'
              }`}
              style={{ background: t.colors.background === '#ffffff' ? '#e5e7eb' : t.colors.background }}
              title={t.name}
            />
          ))}
        </div>
      </div>

      {/* Font chooser */}
      <div className="flex items-center gap-2">
        <Type className="w-3.5 h-3.5 text-gray-400" />
        <div className="flex gap-1.5 flex-wrap">
          {FONT_OPTIONS.map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedFontId(f.id)}
              className={`px-2.5 py-1 text-xs rounded-lg border transition-all ${
                fontId === f.id ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
              style={{ fontFamily: f.family }}
            >
              {f.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-center">
        <div ref={previewRef} style={{ display: 'inline-block' }}>
          <TemplateComponent
            submission={submission}
            theme={theme}
            previewMode={true}
            footerSignature={settings.footerSignatureFormat}
            fontFamily={fontFamily}
          />
        </div>
      </div>

      <button
        onClick={handleDownload}
        disabled={downloading}
        className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
      >
        {downloading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
        {downloading ? 'Generating...' : 'Download Post Image'}
      </button>
    </div>
  )
}
