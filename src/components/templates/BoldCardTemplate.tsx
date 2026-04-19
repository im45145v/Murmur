'use client'
import React from 'react'
import type { BaseTemplateProps } from './BaseTemplate'
import { getTextFit } from '@/lib/text-fitting'

export function BoldCardTemplate({ submission, theme, previewMode = false, footerSignature = '— Murmur' }: BaseTemplateProps) {
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
        alignItems: 'flex-start',
        padding: 80 * s,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Accent bar */}
      <div style={{ width: 60 * s, height: 6 * s, background: theme.colors.accent, marginBottom: 32 * s, borderRadius: 3 * s }} />

      {/* Category pill */}
      <div
        style={{
          background: theme.colors.accent + '22',
          border: `1px solid ${theme.colors.accent}44`,
          borderRadius: 100,
          padding: `${6 * s}px ${14 * s}px`,
          marginBottom: 28 * s,
        }}
      >
        <span style={{ fontSize: 12 * s, color: theme.colors.accent, fontFamily: 'system-ui, sans-serif', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
          {submission.category}
        </span>
      </div>

      <p
        style={{
          fontSize: fit.fontSize * s,
          lineHeight: fit.lineHeight,
          color: theme.colors.text,
          fontFamily: 'system-ui, sans-serif',
          fontWeight: 500,
          maxWidth: '100%',
        }}
      >
        {text}
      </p>

      <p
        style={{
          position: 'absolute',
          bottom: 32 * s,
          right: 40 * s,
          fontSize: 13 * s,
          color: theme.colors.secondary,
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {footerSignature}
      </p>
    </div>
  )
}
