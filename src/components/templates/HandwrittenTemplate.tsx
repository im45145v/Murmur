'use client'
import React from 'react'
import type { BaseTemplateProps } from './BaseTemplate'
import { getTextFit } from '@/lib/text-fitting'

export function HandwrittenTemplate({ submission, theme, previewMode = false, footerSignature = '— Murmur' }: BaseTemplateProps) {
  const text = submission.editedText || submission.bodyText
  const fit = getTextFit(text)
  const s = previewMode ? 0.35 : 1

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
      {/* Hand-drawn border */}
      <div
        style={{
          position: 'absolute',
          top: 40 * s,
          left: 40 * s,
          right: 40 * s,
          bottom: 40 * s,
          border: `2.5px solid ${theme.colors.primary}`,
          borderRadius: 8 * s,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 48 * s,
          left: 48 * s,
          right: 48 * s,
          bottom: 48 * s,
          border: `1px solid ${theme.colors.primary}55`,
          borderRadius: 6 * s,
        }}
      />

      {/* Corner decorations */}
      {[
        { top: 30 * s, left: 30 * s },
        { top: 30 * s, right: 30 * s },
        { bottom: 30 * s, left: 30 * s },
        { bottom: 30 * s, right: 30 * s },
      ].map((pos, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: 16 * s,
            height: 16 * s,
            background: theme.colors.accent,
            borderRadius: '50%',
            ...pos,
          }}
        />
      ))}

      <p
        style={{
          fontSize: fit.fontSize * s,
          lineHeight: fit.lineHeight,
          color: theme.colors.text,
          fontFamily: '"Courier New", Courier, monospace',
          textAlign: 'center',
          padding: `0 ${40 * s}px`,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {text}
      </p>

      <p
        style={{
          position: 'absolute',
          bottom: 60 * s,
          right: 70 * s,
          fontSize: 13 * s,
          color: theme.colors.secondary,
          fontFamily: '"Courier New", monospace',
        }}
      >
        {footerSignature}
      </p>
    </div>
  )
}
