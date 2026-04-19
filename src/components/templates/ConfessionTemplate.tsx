'use client'
import React from 'react'
import type { BaseTemplateProps } from './BaseTemplate'
import { getTextFit } from '@/lib/text-fitting'

export function ConfessionTemplate({ submission, theme, previewMode = false, footerSignature = '— Murmur' }: BaseTemplateProps) {
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
      {/* Dramatic background blur circles */}
      <div style={{
        position: 'absolute', top: -100 * s, right: -100 * s,
        width: 400 * s, height: 400 * s,
        borderRadius: '50%',
        background: theme.colors.primary + '15',
        filter: `blur(${60 * s}px)`,
      }} />
      <div style={{
        position: 'absolute', bottom: -80 * s, left: -80 * s,
        width: 300 * s, height: 300 * s,
        borderRadius: '50%',
        background: theme.colors.accent + '10',
        filter: `blur(${40 * s}px)`,
      }} />

      {/* Red accent line */}
      <div style={{ width: 40 * s, height: 3 * s, background: theme.colors.primary, marginBottom: 32 * s }} />

      {/* Confession label */}
      <p style={{
        fontSize: 11 * s,
        color: theme.colors.primary,
        fontFamily: 'system-ui, sans-serif',
        fontWeight: 700,
        letterSpacing: 3,
        textTransform: 'uppercase',
        marginBottom: 24 * s,
      }}>
        {submission.category}
      </p>

      <p
        style={{
          fontSize: fit.fontSize * s,
          lineHeight: fit.lineHeight,
          color: theme.colors.text,
          fontFamily: 'Georgia, serif',
          fontStyle: 'italic',
          maxWidth: '90%',
          position: 'relative',
          zIndex: 1,
        }}
      >
        &ldquo;{text}&rdquo;
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
