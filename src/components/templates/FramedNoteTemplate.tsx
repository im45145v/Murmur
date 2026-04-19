'use client'
import React from 'react'
import type { BaseTemplateProps } from './BaseTemplate'
import { getTextFit } from '@/lib/text-fitting'

export function FramedNoteTemplate({ submission, theme, previewMode = false, footerSignature = '— Murmur' }: BaseTemplateProps) {
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
      {/* Double frame */}
      <div
        style={{
          position: 'absolute',
          top: 32 * s,
          left: 32 * s,
          right: 32 * s,
          bottom: 32 * s,
          border: `3px solid ${theme.colors.primary}`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 40 * s,
          left: 40 * s,
          right: 40 * s,
          bottom: 40 * s,
          border: `1px solid ${theme.colors.secondary}`,
        }}
      />

      {/* Center content */}
      <div style={{ textAlign: 'center', padding: `0 ${60 * s}px`, position: 'relative', zIndex: 1 }}>
        {/* Ornament */}
        <p style={{ fontSize: 20 * s, color: theme.colors.accent, marginBottom: 24 * s, letterSpacing: 8 }}>✦ ✦ ✦</p>

        <p
          style={{
            fontSize: fit.fontSize * s,
            lineHeight: fit.lineHeight,
            color: theme.colors.text,
            fontFamily: 'Georgia, serif',
          }}
        >
          {text}
        </p>

        <p style={{ fontSize: 20 * s, color: theme.colors.accent, marginTop: 24 * s, letterSpacing: 8 }}>✦ ✦ ✦</p>
      </div>

      <p
        style={{
          position: 'absolute',
          bottom: 56 * s,
          right: 60 * s,
          fontSize: 12 * s,
          color: theme.colors.secondary,
          fontFamily: 'Georgia, serif',
          fontStyle: 'italic',
          letterSpacing: 1,
        }}
      >
        {footerSignature}
      </p>
    </div>
  )
}
