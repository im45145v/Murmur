'use client'
import React from 'react'
import { type BaseTemplateProps, buildHeaderLabel, buildSignoff } from './BaseTemplate'
import { getTextFit } from '@/lib/text-fitting'
import { getFontFamily } from '@/lib/fonts'

export function BoldCardTemplate({ submission, theme, previewMode = false, footerSignature = '— Murmur', fontFamily: fontFamilyProp }: BaseTemplateProps) {
  const text = submission.editedText || submission.bodyText
  const fit = getTextFit(text)
  const s = previewMode ? 0.35 : 1
  const header = buildHeaderLabel(submission)
  const signoff = buildSignoff(submission)
  const font = fontFamilyProp || getFontFamily('sans')

  return (
    <div style={{ width: 1080 * s, height: 1080 * s, background: theme.colors.background, display: 'flex', flexDirection: 'column', padding: `${40 * s}px ${44 * s}px`, position: 'relative', overflow: 'hidden' }}>
      {/* Thick accent stripe at top */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 8 * s, background: theme.colors.accent }} />

      {/* Header badge */}
      {header && (
        <div style={{ marginBottom: 28 * s }}>
          <span style={{ background: theme.colors.accent, color: '#fff', fontSize: 28 * s, fontWeight: 800, padding: `${10 * s}px ${28 * s}px`, borderRadius: 6 * s, fontFamily: font, letterSpacing: 1 }}>{header}</span>
        </div>
      )}

      {/* Big bold text directly on background */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start' }}>
        <p style={{ fontSize: fit.fontSize * s, lineHeight: fit.lineHeight, color: theme.colors.text, fontFamily: font, fontWeight: 600 }}>{text}</p>
      </div>

      {/* Footer bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 * s, paddingTop: 16 * s, borderTop: `2px solid ${theme.colors.accent}30` }}>
        <span style={{ fontSize: 16 * s, color: theme.colors.secondary, fontFamily: font, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>{submission.category}</span>
        <span style={{ fontSize: 22 * s, color: theme.colors.secondary, fontFamily: font, fontStyle: 'italic' }}>{signoff ?? footerSignature}</span>
      </div>
    </div>
  )
}
