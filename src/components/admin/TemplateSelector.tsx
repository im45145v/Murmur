'use client'
import { useMemo } from 'react'
import { useStore } from '@/lib/store'
import type { Submission } from '@/lib/types'

interface Props {
  submission: Submission
}

export default function TemplateSelector({ submission }: Props) {
  const allTemplates = useStore((s) => s.templates)
  const templates = useMemo(() => allTemplates.filter((t) => t.isEnabled), [allTemplates])
  const setSubmissionTemplate = useStore((s) => s.setSubmissionTemplate)
  const selectedTemplateId = submission.templateId

  return (
    <div className="bg-white rounded-xl border p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Template</h3>
        {submission.preferredTemplateId && (
          <span className="text-xs bg-violet-50 text-violet-600 px-2.5 py-1 rounded-full font-medium">
            User preferred: {submission.preferredTemplateId}
          </span>
        )}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {templates.map((template) => {
          const selectedTheme = template.themes.find((t) => t.id === template.defaultTheme)
          return (
            <button
              key={template.id}
              onClick={() => setSubmissionTemplate(submission.id, template.id)}
              className={`border rounded-xl overflow-hidden text-left transition-all hover:border-indigo-300 ${
                selectedTemplateId === template.id
                  ? 'border-indigo-500 ring-2 ring-indigo-300'
                  : 'border-gray-200'
              }`}
            >
              <div
                className={`h-16 ${template.thumbnailClass} flex items-center justify-center`}
                style={selectedTheme ? { background: selectedTheme.colors.background } : undefined}
              >
                <span className="text-xs font-medium" style={selectedTheme ? { color: selectedTheme.colors.primary } : undefined}>
                  {template.name}
                </span>
              </div>
              <div className="p-2">
                <p className="text-xs font-medium text-gray-700">{template.name}</p>
                <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{template.description}</p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
