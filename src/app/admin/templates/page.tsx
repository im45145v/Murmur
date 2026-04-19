'use client'
import { useStore } from '@/lib/store'
import TopBar from '@/components/admin/TopBar'
import type { PostCategory } from '@/lib/types'

const ALL_CATEGORIES: PostCategory[] = [
  'Confession', 'Gossip', 'Frustration', 'Horror Story / Weird Experiences',
  'Good/Bad Experiences', 'Advice', 'Feedback', 'Other'
]

export default function TemplatesPage() {
  const templates = useStore((s) => s.templates)
  const toggleTemplate = useStore((s) => s.toggleTemplate)
  const updateTemplateDefaults = useStore((s) => s.updateTemplateDefaults)

  return (
    <div className="p-6 space-y-6">
      <TopBar title="Templates" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <div key={template.id} className="bg-white rounded-xl border overflow-hidden">
            <div className={`h-24 ${template.thumbnailClass} flex items-center justify-center`}>
              <span className="text-sm font-medium text-gray-600">{template.name}</span>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{template.name}</h3>
                <button
                  onClick={() => toggleTemplate(template.id)}
                  className={`px-2 py-1 text-xs rounded-full font-medium ${
                    template.isEnabled
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {template.isEnabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mb-3">{template.description}</p>
              <div>
                <p className="text-xs font-medium text-gray-700 mb-2">Default for categories:</p>
                <div className="flex flex-wrap gap-1">
                  {ALL_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        const current = template.defaultForCategories
                        const updated = current.includes(cat)
                          ? current.filter((c) => c !== cat)
                          : [...current, cat]
                        updateTemplateDefaults(template.id, updated)
                      }}
                      className={`px-2 py-0.5 text-xs rounded-full border transition-colors ${
                        template.defaultForCategories.includes(cat)
                          ? 'bg-indigo-100 border-indigo-300 text-indigo-700'
                          : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
