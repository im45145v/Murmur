'use client'
import React from 'react'
import type { BaseTemplateProps } from './BaseTemplate'
import { getTextFit } from '@/lib/text-fitting'

export function ScrapbookTemplate({ submission, theme, previewMode = false, footerSignature = '— Murmur' }: BaseTemplateProps) {
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
        padding: 60 * s,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Tape strips */}
      <div style={{ position: 'absolute', top: 40 * s, left: 120 * s, width: 80 * s, height: 20 * s, background: theme.colors.accent + '88', transform: 'rotate(-3deg)', borderRadius: 2 * s }} />
      <div style={{ position: 'absolute', top: 40 * s, right: 120 * s, width: 80 * s, height: 20 * s, background: theme.colors.accent + '88', transform: 'rotate(3deg)', borderRadius: 2 * s }} />

      {/* Paper card */}
      <div
        style={{
          background: '#fffef9',
          boxShadow: `${3 * s}px ${4 * s}px ${12 * s}px rgba(0,0,0,0.15)`,
          padding: 50 * s,
          width: '85%',
          borderRadius: 4 * s,
          transform: 'rotate(-0.5deg)',
        }}
      >
        <p
          style={{
            fontSize: fit.fontSize * s,
            lineHeight: fit.lineHeight,
            color: theme.colors.text,
            fontFamily: 'Georgia, serif',
            fontStyle: 'italic',
          }}
        >
          {text}
        </p>
      </div>

      <p
        style={{
          position: 'absolute',
          bottom: 28 * s,
          right: 36 * s,
          fontSize: 13 * s,
          color: theme.colors.secondary,
          fontFamily: 'Georgia, serif',
          fontStyle: 'italic',
        }}
      >
        {footerSignature}
      </p>

      {/* Decorative corner */}
      <div style={{ position: 'absolute', bottom: 50 * s, left: 50 * s, width: 30 * s, height: 30 * s, borderLeft: `2px solid ${theme.colors.accent}`, borderBottom: `2px solid ${theme.colors.accent}` }} />
    </div>
  )
}
