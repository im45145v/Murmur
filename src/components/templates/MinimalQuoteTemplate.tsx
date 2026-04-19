'use client'
import React from 'react'
import { type BaseTemplateProps, buildHeaderLabel, buildSignoff } from './BaseTemplate'
import { getTextFit } from '@/lib/text-fitting'
import { getFontFamily } from '@/lib/fonts'

export function MinimalQuoteTemplate({ submission, theme, previewMode = false, footerSignature = '— Murmur', fontFamily: fontFamilyProp }: BaseTemplateProps) {
  const text = submission.editedText || submission.bodyText
  const fit = getTextFit(text)
  const s = previewMode ? 0.35 : 1
  const header = buildHeaderLabel(submission)
  const signoff = buildSignoff(submission)
  const font = fontFamilyProp || getFontFamily('serif')

  return (
    <div style={{ width: 1080 * s, height: 1080 * s, background: theme.colors.background, display: 'flex', flexDirection: 'column', padding: `${40 * s}px ${52 * s}px`, position: 'relative', overflow: 'hidden' }}>
      {/* Giant opening quote mark */}
      <div style={{ position: 'absolute', top: 40 * s, left: 48 * s, fontSize: 300 * s, lineHeight: 1, color: theme.colors.accent + '15', fontFamily: 'Georgia, serif', pointerEvents: 'none' }}>&ldquo;</div>

      {/* Thin top line */}
      <div style={{ width: 60 * s, height: 3 * s, background: theme.colors.accent, marginBottom: 20 * s }} />

      {header && (
        <div style={{ marginBottom: 28 * s, position: 'relative', zIndex: 1 }}>
          <span style={{ fontSize: 22 * s, fontWeight: 700, color: theme.colors.primary, fontFamily: font, letterSpacing: 1.5, textTransform: 'uppercase' }}>{header}</span>
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
        <p style={{ fontSize: fit.fontSize * s, lineHeight: fit.lineHeight, color: theme.colors.text, fontFamily: font, fontStyle: 'italic' }}>{text}</p>
      </div>

      {/* Thin bottom line */}
      <div style={{ width: '100%', height: 1, background: theme.colors.secondary + '30', marginBottom: 16 * s }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
        <span style={{ fontSize: 14 * s, color: theme.colors.secondary, fontFamily: font, letterSpacing: 2, textTransform: 'uppercase' }}>{submission.category}</span>
        <span style={{ fontSize: 20 * s, color: theme.colors.primary, fontFamily: font }}>{signoff ?? footerSignature}</span>
      </div>
    </div>
  )
}
