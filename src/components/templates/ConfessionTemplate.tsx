'use client'
import React from 'react'
import { type BaseTemplateProps, buildHeaderLabel, buildSignoff } from './BaseTemplate'
import { getTextFit } from '@/lib/text-fitting'
import { getFontFamily } from '@/lib/fonts'

export function ConfessionTemplate({ submission, theme, previewMode = false, footerSignature = '— Murmur', fontFamily: fontFamilyProp }: BaseTemplateProps) {
  const text = submission.editedText || submission.bodyText
  const fit = getTextFit(text)
  const s = previewMode ? 0.35 : 1
  const header = buildHeaderLabel(submission)
  const signoff = buildSignoff(submission)
  const font = fontFamilyProp || getFontFamily('serif')

  return (
    <div style={{ width: 1080 * s, height: 1080 * s, background: theme.colors.background, display: 'flex', flexDirection: 'column', padding: `${36 * s}px ${44 * s}px`, position: 'relative', overflow: 'hidden' }}>
      {/* Dramatic background blur circles */}
      <div style={{ position: 'absolute', top: -100 * s, right: -100 * s, width: 400 * s, height: 400 * s, borderRadius: '50%', background: theme.colors.primary + '15', filter: `blur(${60 * s}px)` }} />
      <div style={{ position: 'absolute', bottom: -80 * s, left: -80 * s, width: 300 * s, height: 300 * s, borderRadius: '50%', background: theme.colors.accent + '12', filter: `blur(${40 * s}px)` }} />

      {/* Category label */}
      <div style={{ marginBottom: 16 * s, position: 'relative', zIndex: 1 }}>
        <span style={{ fontSize: 14 * s, color: theme.colors.primary, fontFamily: 'system-ui, sans-serif', fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase' }}>{submission.category}</span>
      </div>

      {header && (
        <div style={{ marginBottom: 24 * s, position: 'relative', zIndex: 1 }}>
          <span style={{ background: theme.colors.primary, color: '#fff', fontSize: 26 * s, fontWeight: 700, padding: `${8 * s}px ${22 * s}px`, borderRadius: 10 * s, fontFamily: font }}>{header}</span>
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
        <p style={{ fontSize: fit.fontSize * s, lineHeight: fit.lineHeight, color: theme.colors.text, fontFamily: font, fontStyle: 'italic' }}>&ldquo;{text}&rdquo;</p>
      </div>

      <div style={{ textAlign: 'right', marginTop: 12 * s, position: 'relative', zIndex: 1 }}>
        <span style={{ fontSize: 22 * s, color: theme.colors.secondary, fontFamily: 'system-ui, sans-serif' }}>{signoff ?? footerSignature}</span>
      </div>
    </div>
  )
}
