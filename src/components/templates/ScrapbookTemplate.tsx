'use client'
import React from 'react'
import { type BaseTemplateProps, buildHeaderLabel, buildSignoff } from './BaseTemplate'
import { getTextFit } from '@/lib/text-fitting'
import { getFontFamily } from '@/lib/fonts'

export function ScrapbookTemplate({ submission, theme, previewMode = false, footerSignature = '— Murmur', fontFamily: fontFamilyProp }: BaseTemplateProps) {
  const text = submission.editedText || submission.bodyText
  const fit = getTextFit(text)
  const s = previewMode ? 0.35 : 1
  const header = buildHeaderLabel(submission)
  const signoff = buildSignoff(submission)
  const font = fontFamilyProp || getFontFamily('cursive')

  return (
    <div style={{ width: 1080 * s, height: 1080 * s, background: theme.colors.background, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: `${28 * s}px`, position: 'relative', overflow: 'hidden' }}>
      {/* Film-strip decoration top */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 32 * s, display: 'flex', gap: 8 * s, padding: `${4 * s}px ${20 * s}px` }}>
        {Array.from({ length: 14 }).map((_, i) => (
          <div key={i} style={{ flex: 1, background: theme.colors.accent + '60', borderRadius: 3 * s }} />
        ))}
      </div>

      {/* Tape strips */}
      <div style={{ position: 'absolute', top: 50 * s, left: -10 * s, width: 100 * s, height: 28 * s, background: theme.colors.accent + '90', transform: 'rotate(-5deg)', borderRadius: 2 * s }} />
      <div style={{ position: 'absolute', top: 50 * s, right: -10 * s, width: 100 * s, height: 28 * s, background: theme.colors.accent + '90', transform: 'rotate(5deg)', borderRadius: 2 * s }} />

      {/* Paper card filling space */}
      <div style={{ background: '#fffef5', width: '92%', flex: 1, margin: `${44 * s}px 0 ${16 * s}px`, borderRadius: 4 * s, padding: `${28 * s}px ${32 * s}px`, display: 'flex', flexDirection: 'column', boxShadow: `${2 * s}px ${3 * s}px ${10 * s}px rgba(0,0,0,0.12)`, transform: 'rotate(-0.3deg)' }}>
        {header && (
          <div style={{ marginBottom: 20 * s }}>
            <span style={{ background: theme.colors.primary, color: '#fff', fontSize: 24 * s, fontWeight: 700, padding: `${6 * s}px ${20 * s}px`, borderRadius: 8 * s, fontFamily: font }}>{header}</span>
          </div>
        )}
        <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start' }}>
          <p style={{ fontSize: fit.fontSize * s, lineHeight: fit.lineHeight, color: theme.colors.text, fontFamily: font, fontWeight: 500 }}>{text}</p>
        </div>
        <div style={{ textAlign: 'right', marginTop: 12 * s }}>
          <span style={{ fontSize: 22 * s, color: theme.colors.secondary, fontFamily: font, fontStyle: 'italic' }}>{signoff ?? footerSignature}</span>
        </div>
      </div>
    </div>
  )
}
