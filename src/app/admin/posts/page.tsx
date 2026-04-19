'use client'
import { useStore } from '@/lib/store'
import TopBar from '@/components/admin/TopBar'
import { formatDate } from '@/lib/utils'
import { Download } from 'lucide-react'

export default function PostsPage() {
  const generatedPosts = useStore((s) => s.generatedPosts)
  const submissions = useStore((s) => s.submissions)
  const markPostDownloaded = useStore((s) => s.markPostDownloaded)

  return (
    <div className="p-6 space-y-6">
      <TopBar title="Generated Posts" />
      {generatedPosts.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-4">🖼️</div>
          <p className="text-lg">No posts generated yet</p>
          <p className="text-sm mt-1">Go to the Queue and download a template to see it here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {generatedPosts.map((post) => {
            const sub = submissions.find((s) => s.id === post.submissionId)
            return (
              <div key={post.id} className="bg-white rounded-xl border overflow-hidden">
                {post.imageDataUrl ? (
                  <img src={post.imageDataUrl} alt="Generated post" className="w-full aspect-square object-cover" />
                ) : (
                  <div className="aspect-square bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                    Preview not available
                  </div>
                )}
                <div className="p-3">
                  <p className="text-xs text-gray-500">{sub?.category ?? 'Unknown'} — {formatDate(post.createdAt)}</p>
                  {post.downloadedAt && (
                    <p className="text-xs text-green-600 mt-1">Downloaded {formatDate(post.downloadedAt)}</p>
                  )}
                  {post.imageDataUrl && (
                    <button
                      onClick={() => {
                        const a = document.createElement('a')
                        a.href = post.imageDataUrl!
                        a.download = `murmur-${post.submissionId}.png`
                        a.click()
                        markPostDownloaded(post.id)
                      }}
                      className="mt-2 flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800"
                    >
                      <Download className="w-3 h-3" /> Download again
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
