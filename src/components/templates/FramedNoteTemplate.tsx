'use client'
import React from 'react'
import { type BaseTemplateProps, buildHeaderLabel, buildSignoff } from './BaseTemplate'
import { getTextFit } from '@/lib/text-fitting'
import { getFontFamily } from '@/lib/fonts'

export function FramedNoteTemplate({ submission, theme, previewMode = false, footerSignature = '— Murmur', fontFamily: fontFamilyProp }: BaseTemplateProps) {
  const text = submission.editedText || submission.bodyText
  const fit = getTextFit(text)
  const s = previewMode ? 0.35 : 1
  const header = buildHeaderLabel(submission)
  const signoff = buildSignoff(submission)
  const font = fontFamilyProp || getFontFamily('cursive')

  return (
    <div style={{ width: 1080 * s, height: 1080 * s, background: theme.colors.background, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: `${28 * s}px`, position: 'relative', overflow: 'hidden' }}>
      {/* Colored squares decoration at top */}
      <div style={{ position: 'absolute', top: 20 * s, left: 40 * s, display: 'flex', gap: 10 * s }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{ width: 20 * s, height: 20 * s, background: i % 2 === 0 ? theme.colors.accent + '60' : theme.colors.primary + '40', borderRadius: 3 * s, transform: `rotate(${(i - 2) * 8}deg)` }} />
        ))}
      </div>
      {/* Torn paper edge on right */}
      <div style={{ position: 'absolute', top: 80 * s, right: 0, bottom: 80 * s, width: 24 * s, background: `repeating-linear-gradient(180deg, ${theme.colors.background} 0px, ${theme.colors.background} 10px, transparent 10px, transparent 14px)`, zIndex: 2 }} />

      {/* Main card */}
      <div style={{ background: '#fffef8', width: '92%', flex: 1, borderRadius: 6 * s, padding: `${36 * s}px ${44 * s}px`, display: 'flex', flexDirection: 'column', boxShadow: `${2 * s}px ${3 * s}px ${14 * s}px rgba(0,0,0,0.1)`, position: 'relative', zIndex: 1 }}>
        {/* Double frame lines */}
        <div style={{ position: 'absolute', top: 10 * s, left: 10 * s, right: 10 * s, bottom: 10 * s, border: `2px solid ${theme.colors.primary}25`, borderRadius: 4 * s }} />

        {header && (
          <div style={{ marginBottom: 20 * s }}>
            <span style={{ background: theme.colors.primary, color: '#fff', fontSize: 26 * s, fontWeight: 700, padding: `${8 * s}px ${22 * s}px`, borderRadius: 10 * s, fontFamily: font }}>{header}</span>
          </div>
        )}
        <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start' }}>
          <p style={{ fontSize: fit.fontSize * s, lineHeight: fit.lineHeight, color: theme.colors.text, fontFamily: font, fontWeight: 500 }}>{text}</p>
        </div>
        <div style={{ textAlign: 'right', marginTop: 12 * s }}>
          <span style={{ fontSize: 22 * s, color: theme.colors.secondary, fontFamily: font, fontStyle: 'italic' }}>{signoff ?? footerSignature}</span>
        </div>
      </div>

      {/* Bottom colored squares */}
      <div style={{ position: 'absolute', bottom: 20 * s, right: 40 * s, display: 'flex', gap: 10 * s }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{ width: 16 * s, height: 16 * s, background: i % 2 === 0 ? theme.colors.primary + '50' : theme.colors.accent + '40', borderRadius: 2 * s, transform: `rotate(${(i - 1) * 12}deg)` }} />
        ))}
      </div>
    </div>
  )
}
