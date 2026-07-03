'use client'
import { useState } from 'react'
import { useStore } from '@/lib/store'
import TopBar from '@/components/admin/TopBar'
import { formatDate } from '@/lib/utils'
import { CheckCircle, Copy, Download, ExternalLink, RefreshCw, Send } from 'lucide-react'

export default function PostsPage() {
  const generatedPosts = useStore((s) => s.generatedPosts)
  const submissions = useStore((s) => s.submissions)
  const markPostDownloaded = useStore((s) => s.markPostDownloaded)
  const publishGeneratedPost = useStore((s) => s.publishGeneratedPost)
  const manualPublishPost = useStore((s) => s.manualPublishPost)
  const [workingId, setWorkingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handlePublish = async (postId: string) => {
    setError(null)
    setWorkingId(postId)
    try {
      await publishGeneratedPost(postId)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Instagram publish failed')
    } finally {
      setWorkingId(null)
    }
  }

  const handleManualPublish = async (postId: string) => {
    setError(null)
    setWorkingId(postId)
    try {
      await manualPublishPost(postId)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Manual publish update failed')
    } finally {
      setWorkingId(null)
    }
  }

  const handleCopy = async (postId: string, text?: string) => {
    if (!text) return
    await navigator.clipboard.writeText(text)
    setCopiedId(postId)
    setTimeout(() => setCopiedId(null), 1500)
  }

  return (
    <div className="p-6 space-y-6">
      <TopBar title="Generated Posts" />
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
      {generatedPosts.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-4">Image</div>
          <p className="text-lg">No posts generated yet</p>
          <p className="text-sm mt-1">Go to the Queue, approve a submission, and render it to R2.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {generatedPosts.map((post) => {
            const sub = submissions.find((s) => s.id === post.submissionId)
            const imageUrl = post.assetUrl || post.imageDataUrl
            const isWorking = workingId === post.id
            const isPublished = post.publishStatus === 'published' || post.publishStatus === 'manual'

            return (
              <div key={post.id} className="bg-white rounded-xl border overflow-hidden">
                {imageUrl ? (
                  <img src={imageUrl} alt="Generated post" className="w-full aspect-square object-cover" />
                ) : (
                  <div className="aspect-square bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                    Preview not available
                  </div>
                )}
                <div className="p-3 space-y-2">
                  <div>
                    <p className="text-xs text-gray-500">{sub?.category ?? 'Unknown'} - {formatDate(post.createdAt)}</p>
                    <p className={`text-xs font-medium mt-1 ${isPublished ? 'text-green-600' : post.publishStatus === 'failed' ? 'text-red-600' : 'text-indigo-600'}`}>
                      {(post.publishStatus || 'rendered').toUpperCase()}
                    </p>
                    {post.publishError && (
                      <p className="text-xs text-red-600 mt-1">{post.publishError}</p>
                    )}
                    {post.instagramMediaId && (
                      <p className="text-xs text-gray-400 mt-1">Instagram media: {post.instagramMediaId}</p>
                    )}
                    {post.downloadedAt && (
                      <p className="text-xs text-green-600 mt-1">Downloaded {formatDate(post.downloadedAt)}</p>
                    )}
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {imageUrl && (
                      <button
                        onClick={() => {
                          const a = document.createElement('a')
                          a.href = imageUrl
                          a.download = `murmur-${post.submissionId}.png`
                          a.click()
                          markPostDownloaded(post.id)
                        }}
                        className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800"
                      >
                        <Download className="w-3 h-3" /> Download
                      </button>
                    )}
                    {post.assetUrl && (
                      <a href={post.assetUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700">
                        <ExternalLink className="w-3 h-3" /> Asset
                      </a>
                    )}
                    {post.captionText && (
                      <button
                        onClick={() => handleCopy(post.id, post.captionText)}
                        className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
                      >
                        {copiedId === post.id ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {copiedId === post.id ? 'Copied' : 'Caption'}
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => handlePublish(post.id)}
                      disabled={isWorking || !post.assetUrl || post.publishStatus === 'published'}
                      className="flex items-center justify-center gap-1.5 bg-gray-900 text-white px-3 py-2 rounded-lg text-xs font-medium hover:bg-black disabled:opacity-50"
                    >
                      {isWorking ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      Publish
                    </button>
                    <button
                      onClick={() => handleManualPublish(post.id)}
                      disabled={isWorking || isPublished}
                      className="flex items-center justify-center gap-1.5 bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-lg text-xs font-medium hover:bg-gray-50 disabled:opacity-50"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Manual
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
