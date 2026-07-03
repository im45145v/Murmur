'use client'
import { useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { flushSync } from 'react-dom'
import type { GeneratedPost, Submission } from '@/lib/types'
import { useStore } from '@/lib/store'
import { getTemplateComponent, getDefaultTemplateId } from '@/components/templates'
import { AlertCircle, CheckCircle, Copy, Download, RefreshCw, Send, Type, UploadCloud } from 'lucide-react'
import { FONT_OPTIONS, getFontFamily, getDefaultFontForTemplate } from '@/lib/fonts'
import { getTextFit } from '@/lib/text-fitting'

interface Props {
  submission: Submission
}

export default function PostPreview({ submission }: Props) {
  const templates = useStore((s) => s.templates)
  const settings = useStore((s) => s.settings)
  const generatedPosts = useStore((s) => s.generatedPosts)
  const renderGeneratedPost = useStore((s) => s.renderGeneratedPost)
  const markPostDownloaded = useStore((s) => s.markPostDownloaded)
  const publishGeneratedPost = useStore((s) => s.publishGeneratedPost)
  const manualPublishPost = useStore((s) => s.manualPublishPost)
  const allCaptions = useStore((s) => s.captions)
  const captions = useMemo(() => allCaptions.filter((c) => c.submissionId === submission.id), [allCaptions, submission.id])

  const previewRef = useRef<HTMLDivElement>(null)
  const [working, setWorking] = useState<'render' | 'publish' | 'manual' | null>(null)
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null)
  const [selectedFontId, setSelectedFontId] = useState<string | null>(null)
  const [latestPost, setLatestPost] = useState<GeneratedPost | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const templateId = submission.templateId ?? submission.preferredTemplateId ?? getDefaultTemplateId(submission, templates)
  const template = templates.find((t) => t.id === templateId) ?? templates[0]
  const themeId = selectedThemeId ?? template?.defaultTheme ?? template?.themes[0]?.id
  const theme = template?.themes.find((t) => t.id === themeId) ?? template?.themes[0]
  const fontId = selectedFontId ?? getDefaultFontForTemplate(templateId)
  const fontFamily = getFontFamily(fontId)
  const selectedCaption = captions.find((caption) => caption.id === submission.captionSelected) ?? captions[0]
  const captionText = selectedCaption?.text ?? ''
  const exportSize = settings.exportImageSize || 1080
  const currentPost = latestPost ?? generatedPosts.find((post) => post.submissionId === submission.id) ?? null
  const qaWarnings = getQaWarnings(submission)

  if (!template || !theme) return null

  const TemplateComponent = getTemplateComponent(templateId)
  const isApproved = submission.status === 'approved' || submission.status === 'posted'

  const renderToDataUrl = async () => {
    const html2canvas = (await import('html2canvas')).default
    const offscreen = document.createElement('div')
    offscreen.style.position = 'fixed'
    offscreen.style.left = '-9999px'
    offscreen.style.top = '0'
    document.body.appendChild(offscreen)

    const root = createRoot(offscreen)
    try {
      flushSync(() => {
        root.render(
          <TemplateComponent
            submission={submission}
            theme={theme}
            previewMode={false}
            footerSignature={settings.watermarkEnabled ? settings.footerSignatureFormat : ''}
            fontFamily={fontFamily}
          />
        )
      })

      await document.fonts?.ready
      await new Promise((resolve) => setTimeout(resolve, 50))

      const target = offscreen.firstElementChild as HTMLElement
      const canvas = await html2canvas(target, {
        scale: exportSize / 1080,
        useCORS: true,
        backgroundColor: null,
      })

      return canvas.toDataURL('image/png')
    } finally {
      root.unmount()
      document.body.removeChild(offscreen)
    }
  }

  const handleRender = async () => {
    setError(null)
    setWorking('render')
    try {
      const imageDataUrl = await renderToDataUrl()
      const post = await renderGeneratedPost({
        submissionId: submission.id,
        templateId,
        themeId,
        captionId: selectedCaption?.id ?? '',
        captionText,
        imageDataUrl,
        width: exportSize,
        height: exportSize,
      })
      setLatestPost(post)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Render failed')
    } finally {
      setWorking(null)
    }
  }

  const handleDownload = () => {
    if (!currentPost?.assetUrl) return
    const a = document.createElement('a')
    a.href = currentPost.assetUrl
    a.download = `murmur-${submission.id}.png`
    a.click()
    markPostDownloaded(currentPost.id)
  }

  const handlePublish = async () => {
    if (!currentPost) return
    setError(null)
    setWorking('publish')
    try {
      const post = await publishGeneratedPost(currentPost.id)
      setLatestPost(post)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Instagram publish failed')
    } finally {
      setWorking(null)
    }
  }

  const handleCopyCaption = async () => {
    await navigator.clipboard.writeText(captionText)
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  const handleManualPublish = async () => {
    if (!currentPost) return
    setError(null)
    setWorking('manual')
    try {
      const post = await manualPublishPost(currentPost.id)
      setLatestPost(post)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Manual publish update failed')
    } finally {
      setWorking(null)
    }
  }

  return (
    <div className="bg-white rounded-xl border p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">Preview & Publish</h3>
          <p className="text-xs text-gray-400 mt-0.5">{exportSize}x{exportSize}px Instagram square export</p>
        </div>
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

      {qaWarnings.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 space-y-1">
          {qaWarnings.map((warning) => (
            <div key={warning} className="flex gap-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{warning}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-center">
        <div ref={previewRef} style={{ display: 'inline-block' }}>
          <TemplateComponent
            submission={submission}
            theme={theme}
            previewMode={true}
            footerSignature={settings.watermarkEnabled ? settings.footerSignatureFormat : ''}
            fontFamily={fontFamily}
          />
        </div>
      </div>

      {currentPost && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600 flex items-center justify-between gap-3">
          <span className="truncate">
            Status: <span className="font-semibold capitalize">{currentPost.publishStatus || 'rendered'}</span>
            {currentPost.instagramMediaId ? ` - IG ${currentPost.instagramMediaId}` : ''}
          </span>
          {currentPost.assetUrl && (
            <a href={currentPost.assetUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-800 shrink-0">
              Open asset
            </a>
          )}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <button
          onClick={handleRender}
          disabled={working !== null || !isApproved}
          className="flex items-center justify-center gap-2 bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {working === 'render' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
          {working === 'render' ? 'Rendering...' : 'Render to R2'}
        </button>
        <button
          onClick={handlePublish}
          disabled={working !== null || !currentPost?.assetUrl || currentPost.publishStatus === 'published'}
          className="flex items-center justify-center gap-2 bg-gray-900 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-black disabled:opacity-50 transition-colors"
        >
          {working === 'publish' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {working === 'publish' ? 'Publishing...' : 'Publish to Instagram'}
        </button>
        <button
          onClick={handleDownload}
          disabled={!currentPost?.assetUrl}
          className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          <Download className="w-4 h-4" />
          Download PNG
        </button>
        <button
          onClick={handleCopyCaption}
          disabled={!captionText}
          className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied' : 'Copy Caption'}
        </button>
      </div>

      <button
        onClick={handleManualPublish}
        disabled={working !== null || !currentPost}
        className="w-full flex items-center justify-center gap-2 text-xs text-gray-500 hover:text-gray-800 disabled:opacity-50"
      >
        {working === 'manual' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
        Mark as manually posted
      </button>

      {!isApproved && (
        <p className="text-xs text-gray-400 text-center">Approve this submission before rendering a publishable asset.</p>
      )}
    </div>
  )
}

function getQaWarnings(submission: Submission) {
  const text = submission.editedText || submission.bodyText
  const fit = getTextFit(text)
  const warnings: string[] = []
  if (fit.warning) warnings.push(fit.warning)
  if (/\S{26,}/.test(text)) warnings.push('Very long unbroken words may overflow on some templates.')
  if (!submission.captionSelected) warnings.push('No caption is selected. Publishing will use an empty caption unless you choose one.')
  if (submission.riskLevel === 'High' || submission.riskLevel === 'Critical') warnings.push('High-risk content should be reviewed carefully before export.')
  return warnings
}
