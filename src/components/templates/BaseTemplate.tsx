'use client'
import React from 'react'
import type { Submission, TemplateTheme } from '@/lib/types'
import { getTextFit } from '@/lib/text-fitting'
import { getFontFamily } from '@/lib/fonts'

export interface BaseTemplateProps {
  submission: Submission
  theme: TemplateTheme
  previewMode?: boolean
  forExport?: boolean
  footerSignature?: string
  fontFamily?: string
}

/** Builds a header badge like "R MBA 2026" or "To: R.S." */
export function buildHeaderLabel(submission: Submission): string | null {
  const parts: string[] = []
  if (submission.toInitials) parts.push(submission.toInitials)
  if (submission.targetProgram && submission.targetProgram !== "Don't know") parts.push(submission.targetProgram)
  if (submission.targetBatch && submission.targetBatch !== "Don't know") parts.push(submission.targetBatch)
  return parts.length > 0 ? parts.join(' ') : null
}

/** Builds a signoff like "– mba 2026" or "From: A.K." */
export function buildSignoff(submission: Submission): string | null {
  const parts: string[] = []
  if (submission.fromInitials) parts.push(submission.fromInitials)
  if (submission.submitterProgram && submission.submitterProgram !== "Don't know") parts.push(submission.submitterProgram.toLowerCase())
  if (submission.submitterBatch && submission.submitterBatch !== "Don't know") parts.push(submission.submitterBatch)
  return parts.length > 0 ? `– ${parts.join(' ')}` : null
}

/** Legacy helper kept for compatibility */
export function buildFromToLabel(submission: Submission): string | null {
  const parts: string[] = []
  if (submission.fromInitials) parts.push(`From: ${submission.fromInitials}`)
  if (submission.toInitials) parts.push(`To: ${submission.toInitials}`)
  return parts.length > 0 ? parts.join('  •  ') : null
}

export function BaseTemplate({ submission, theme, previewMode = false, footerSignature = '— Murmur', fontFamily: fontFamilyProp }: BaseTemplateProps) {
  const text = submission.editedText || submission.bodyText
  const fit = getTextFit(text)
  const size = previewMode ? 0.35 : 1
  const header = buildHeaderLabel(submission)
  const signoff = buildSignoff(submission)
  const font = fontFamilyProp || getFontFamily('cursive')

  return (
    <div
      style={{
        width: 1080 * size,
        height: 1080 * size,
        background: theme.colors.background,
        display: 'flex',
        flexDirection: 'column',
        padding: `${36 * size}px ${40 * size}px`,
        position: 'relative',
        fontFamily: font,
        overflow: 'hidden',
      }}
    >
      {header && (
        <div style={{ marginBottom: 24 * size }}>
          <span style={{
            background: theme.colors.primary,
            color: theme.colors.background,
            fontSize: 22 * size,
            fontWeight: 700,
            padding: `${6 * size}px ${18 * size}px`,
            borderRadius: 6 * size,
            fontFamily: font,
          }}>
            {header}
          </span>
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start' }}>
        <p
          style={{
            fontSize: fit.fontSize * size,
            lineHeight: fit.lineHeight,
            color: theme.colors.text,
            fontFamily: font,
            maxWidth: '100%',
          }}
        >
          {text}
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 * size }}>
        <span style={{
          fontSize: 22 * size,
          color: theme.colors.secondary,
          fontFamily: font,
          fontStyle: 'italic',
        }}>
          {signoff ?? footerSignature}
        </span>
      </div>
    </div>
  )
}
