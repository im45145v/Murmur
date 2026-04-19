'use client'
import React from 'react'
import { type BaseTemplateProps, buildHeaderLabel, buildSignoff } from './BaseTemplate'
import { getTextFit } from '@/lib/text-fitting'
import { getFontFamily } from '@/lib/fonts'

export function HandwrittenTemplate({ submission, theme, previewMode = false, footerSignature = '— Murmur', fontFamily: fontFamilyProp }: BaseTemplateProps) {
  const text = submission.editedText || submission.bodyText
  const fit = getTextFit(text)
  const s = previewMode ? 0.35 : 1
  const header = buildHeaderLabel(submission)
  const signoff = buildSignoff(submission)
  const font = fontFamilyProp || getFontFamily('handwritten')

  return (
    <div style={{ width: 1080 * s, height: 1080 * s, background: theme.colors.background, display: 'flex', flexDirection: 'column', padding: `${36 * s}px ${44 * s}px`, position: 'relative', overflow: 'hidden' }}>
      {/* Watercolor blobs */}
      <div style={{ position: 'absolute', top: -30 * s, right: -20 * s, width: 280 * s, height: 280 * s, borderRadius: '47% 53% 42% 58% / 55% 44% 56% 45%', background: theme.colors.accent + '18', filter: `blur(${20 * s}px)` }} />
      <div style={{ position: 'absolute', bottom: -40 * s, left: -30 * s, width: 240 * s, height: 220 * s, borderRadius: '53% 47% 58% 42% / 45% 56% 44% 55%', background: theme.colors.primary + '14', filter: `blur(${16 * s}px)` }} />
      <div style={{ position: 'absolute', top: '45%', left: -40 * s, width: 160 * s, height: 160 * s, borderRadius: '50%', background: theme.colors.accent + '0c', filter: `blur(${12 * s}px)` }} />

      {/* Sketch-style border */}
      <div style={{ position: 'absolute', top: 28 * s, left: 28 * s, right: 28 * s, bottom: 28 * s, border: `2px dashed ${theme.colors.primary}20`, borderRadius: 12 * s }} />

      {header && (
        <div style={{ marginBottom: 24 * s, position: 'relative', zIndex: 1 }}>
          <span style={{ background: theme.colors.primary + '15', border: `2px solid ${theme.colors.primary}30`, color: theme.colors.primary, fontSize: 26 * s, fontWeight: 700, padding: `${8 * s}px ${22 * s}px`, borderRadius: 12 * s, fontFamily: font }}>{header}</span>
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
        <p style={{ fontSize: fit.fontSize * s, lineHeight: fit.lineHeight, color: theme.colors.text, fontFamily: font, fontWeight: 400 }}>{text}</p>
      </div>

      <div style={{ textAlign: 'right', marginTop: 12 * s, position: 'relative', zIndex: 1 }}>
        <span style={{ fontSize: 24 * s, color: theme.colors.secondary, fontFamily: font }}>{signoff ?? footerSignature}</span>
      </div>
    </div>
  )
}
