'use client'
import React from 'react'
import { type BaseTemplateProps, buildHeaderLabel, buildSignoff } from './BaseTemplate'
import { getTextFit } from '@/lib/text-fitting'
import { getFontFamily } from '@/lib/fonts'

export function JournalTemplate({ submission, theme, previewMode = false, footerSignature = '— Murmur', fontFamily: fontFamilyProp }: BaseTemplateProps) {
  const text = submission.editedText || submission.bodyText
  const fit = getTextFit(text)
  const s = previewMode ? 0.35 : 1
  const header = buildHeaderLabel(submission)
  const signoff = buildSignoff(submission)
  const font = fontFamilyProp || getFontFamily('monospace')
  // Dynamic ruled lines: spacing matches the actual font lineHeight
  const ruledSpacing = fit.lineHeightPx
  const cardPadTop = 40
  const cardPadBot = 60
  const cardInnerHeight = 1080 - 64 - cardPadTop - cardPadBot // approx usable
  const lineCount = Math.floor(cardInnerHeight / ruledSpacing)

  return (
    <div style={{ width: 1080 * s, height: 1080 * s, background: theme.colors.background, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: `${24 * s}px`, position: 'relative', overflow: 'hidden' }}>
      {/* Tape strips on the sides */}
      <div style={{ position: 'absolute', top: 80 * s, left: -8 * s, width: 80 * s, height: 28 * s, background: theme.colors.accent + '80', transform: 'rotate(-8deg)', borderRadius: 2 * s }} />
      <div style={{ position: 'absolute', bottom: 80 * s, right: -8 * s, width: 80 * s, height: 28 * s, background: theme.colors.accent + '80', transform: 'rotate(8deg)', borderRadius: 2 * s }} />

      {/* Lined paper card */}
      <div style={{ background: '#fefefa', width: '94%', flex: 1, borderRadius: 4 * s, padding: `${32 * s}px ${44 * s}px ${32 * s}px ${68 * s}px`, display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: `${2 * s}px ${3 * s}px ${12 * s}px rgba(0,0,0,0.1)` }}>
        {/* Ruled lines — spacing matches font lineHeight */}
        {Array.from({ length: lineCount }).map((_, i) => (
          <div key={i} style={{ position: 'absolute', top: (cardPadTop + 10 + i * ruledSpacing) * s, left: 40 * s, right: 40 * s, height: 1, background: theme.colors.secondary + '25' }} />
        ))}
        {/* Red margin line */}
        <div style={{ position: 'absolute', top: 30 * s, bottom: 30 * s, left: 64 * s, width: 1.5, background: '#e57373' + '50' }} />

        {header && (
          <div style={{ marginBottom: 20 * s, position: 'relative', zIndex: 1 }}>
            <span style={{ fontSize: 28 * s, fontWeight: 800, color: theme.colors.primary, fontFamily: font, textTransform: 'uppercase', letterSpacing: 2 * s }}>{header}</span>
          </div>
        )}
        <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: fit.fontSize * s, lineHeight: fit.lineHeight, color: theme.colors.text, fontFamily: font }}>{text}</p>
        </div>
        <div style={{ textAlign: 'right', marginTop: 12 * s, position: 'relative', zIndex: 1 }}>
          <span style={{ fontSize: 22 * s, color: theme.colors.secondary, fontFamily: font, fontStyle: 'italic' }}>{signoff ?? footerSignature}</span>
        </div>
      </div>
    </div>
  )
}
