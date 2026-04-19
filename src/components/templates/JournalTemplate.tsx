'use client'
import React from 'react'
import type { BaseTemplateProps } from './BaseTemplate'
import { getTextFit } from '@/lib/text-fitting'

export function JournalTemplate({ submission, theme, previewMode = false, footerSignature = '— Murmur' }: BaseTemplateProps) {
  const text = submission.editedText || submission.bodyText
  const fit = getTextFit(text)
  const s = previewMode ? 0.35 : 1
  const lineCount = 12

  return (
    <div
      style={{
        width: 1080 * s,
        height: 1080 * s,
        background: theme.colors.background,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 80 * s,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Ruled lines */}
      {Array.from({ length: lineCount }).map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: (140 + i * 72) * s,
            left: 60 * s,
            right: 60 * s,
            height: 1,
            background: theme.colors.secondary + '30',
          }}
        />
      ))}

      {/* Red margin line */}
      <div
        style={{
          position: 'absolute',
          top: 60 * s,
          bottom: 60 * s,
          left: 100 * s,
          width: 1.5,
          background: '#e57373' + '60',
        }}
      />

      <div style={{ paddingLeft: 60 * s, width: '100%', position: 'relative', zIndex: 1 }}>
        <p
          style={{
            fontSize: fit.fontSize * s,
            lineHeight: fit.lineHeight,
            color: theme.colors.text,
            fontFamily: 'Georgia, "Times New Roman", serif',
          }}
        >
          {text}
        </p>
      </div>

      <p
        style={{
          position: 'absolute',
          bottom: 32 * s,
          right: 40 * s,
          fontSize: 13 * s,
          color: theme.colors.secondary,
          fontFamily: 'Georgia, serif',
          fontStyle: 'italic',
        }}
      >
        {footerSignature}
      </p>
    </div>
  )
}
