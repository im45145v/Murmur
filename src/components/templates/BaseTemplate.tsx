'use client'
import React from 'react'
import type { Submission, TemplateTheme } from '@/lib/types'
import { getTextFit } from '@/lib/text-fitting'

export interface BaseTemplateProps {
  submission: Submission
  theme: TemplateTheme
  previewMode?: boolean
  forExport?: boolean
  footerSignature?: string
}

export function BaseTemplate({ submission, theme, previewMode = false, footerSignature = '— Murmur' }: BaseTemplateProps) {
  const text = submission.editedText || submission.bodyText
  const fit = getTextFit(text)
  const size = previewMode ? 0.35 : 1

  return (
    <div
      style={{
        width: 1080 * size,
        height: 1080 * size,
        background: theme.colors.background,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 80 * size,
        position: 'relative',
        fontFamily: 'Georgia, serif',
        overflow: 'hidden',
      }}
    >
      <p
        style={{
          fontSize: fit.fontSize * size,
          lineHeight: fit.lineHeight,
          color: theme.colors.text,
          textAlign: 'center',
          maxWidth: '100%',
        }}
      >
        {text}
      </p>
      <p
        style={{
          position: 'absolute',
          bottom: 32 * size,
          right: 40 * size,
          fontSize: 14 * size,
          color: theme.colors.secondary,
        }}
      >
        {footerSignature}
      </p>
    </div>
  )
}
