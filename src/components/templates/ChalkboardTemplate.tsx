'use client'
import React from 'react'
import { type BaseTemplateProps, buildHeaderLabel, buildSignoff } from './BaseTemplate'
import { getTextFit } from '@/lib/text-fitting'
import { getFontFamily } from '@/lib/fonts'

export function ChalkboardTemplate({ submission, theme, previewMode = false, footerSignature = '— Murmur', fontFamily: fontFamilyProp }: BaseTemplateProps) {
  const text = submission.editedText || submission.bodyText
  const fit = getTextFit(text)
  const s = previewMode ? 0.35 : 1
  const header = buildHeaderLabel(submission)
  const signoff = buildSignoff(submission)
  const font = fontFamilyProp || getFontFamily('handwritten')

  return (
    <div style={{ width: 1080 * s, height: 1080 * s, background: theme.colors.background, display: 'flex', flexDirection: 'column', padding: `${40 * s}px ${48 * s}px`, position: 'relative', overflow: 'hidden' }}>
      {/* Chalk dust speckles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          top: `${(i * 37) % 100}%`,
          left: `${(i * 53 + 17) % 100}%`,
          width: (2 + (i % 3)) * s,
          height: (2 + (i % 3)) * s,
          borderRadius: '50%',
          background: theme.colors.text + '10',
        }} />
      ))}

      {/* Wooden frame border */}
      <div style={{ position: 'absolute', top: 20 * s, left: 20 * s, right: 20 * s, bottom: 20 * s, border: `6px solid ${theme.colors.secondary}40`, borderRadius: 4 * s }} />
      <div style={{ position: 'absolute', top: 32 * s, left: 32 * s, right: 32 * s, bottom: 32 * s, border: `1px solid ${theme.colors.secondary}20`, borderRadius: 2 * s }} />

      {header && (
        <div style={{ marginBottom: 28 * s, position: 'relative', zIndex: 1 }}>
          <span style={{ fontSize: 30 * s, fontWeight: 700, color: theme.colors.accent, fontFamily: font, textDecoration: 'underline', textDecorationStyle: 'wavy', textUnderlineOffset: `${6 * s}px`, textDecorationColor: theme.colors.accent + '50' }}>{header}</span>
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
        <p style={{ fontSize: fit.fontSize * s, lineHeight: fit.lineHeight, color: theme.colors.text, fontFamily: font, fontWeight: 400 }}>{text}</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1, marginTop: 12 * s }}>
        <span style={{ fontSize: 14 * s, color: theme.colors.secondary, fontFamily: font, letterSpacing: 1 }}>{submission.category}</span>
        <span style={{ fontSize: 22 * s, color: theme.colors.accent, fontFamily: font }}>{signoff ?? footerSignature}</span>
      </div>
    </div>
  )
}
