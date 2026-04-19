'use client'
import React from 'react'
import { type BaseTemplateProps, buildHeaderLabel, buildSignoff } from './BaseTemplate'
import { getTextFit } from '@/lib/text-fitting'
import { getFontFamily } from '@/lib/fonts'

export function GradientWaveTemplate({ submission, theme, previewMode = false, footerSignature = '— Murmur', fontFamily: fontFamilyProp }: BaseTemplateProps) {
  const text = submission.editedText || submission.bodyText
  const fit = getTextFit(text)
  const s = previewMode ? 0.35 : 1
  const header = buildHeaderLabel(submission)
  const signoff = buildSignoff(submission)
  const font = fontFamilyProp || getFontFamily('sans')

  return (
    <div style={{ width: 1080 * s, height: 1080 * s, background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`, display: 'flex', flexDirection: 'column', padding: `${40 * s}px ${44 * s}px`, position: 'relative', overflow: 'hidden' }}>
      {/* Wave decorations */}
      <svg style={{ position: 'absolute', bottom: 0, left: 0, right: 0, opacity: 0.12 }} viewBox="0 0 1080 200" preserveAspectRatio="none">
        <path d="M0 80 C 270 0, 540 160, 810 80 S 1350 0, 1080 80 L 1080 200 L 0 200 Z" fill="#fff" />
      </svg>
      <svg style={{ position: 'absolute', top: 0, left: 0, right: 0, opacity: 0.08 }} viewBox="0 0 1080 200" preserveAspectRatio="none">
        <path d="M0 120 C 270 200, 540 40, 810 120 S 1350 200, 1080 120 L 1080 0 L 0 0 Z" fill="#fff" />
      </svg>

      {/* Floating circles */}
      <div style={{ position: 'absolute', top: 80 * s, right: 60 * s, width: 100 * s, height: 100 * s, borderRadius: '50%', border: `2px solid rgba(255,255,255,0.2)` }} />
      <div style={{ position: 'absolute', bottom: 120 * s, left: 80 * s, width: 60 * s, height: 60 * s, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />

      {header && (
        <div style={{ marginBottom: 24 * s, position: 'relative', zIndex: 1 }}>
          <span style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: `blur(${8 * s}px)`, color: '#fff', fontSize: 26 * s, fontWeight: 700, padding: `${8 * s}px ${24 * s}px`, borderRadius: 100, fontFamily: font, letterSpacing: 1 }}>{header}</span>
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
        <p style={{ fontSize: fit.fontSize * s, lineHeight: fit.lineHeight, color: '#ffffff', fontFamily: font, fontWeight: 600, textShadow: `0 ${2 * s}px ${8 * s}px rgba(0,0,0,0.15)` }}>{text}</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
        <span style={{ fontSize: 14 * s, color: 'rgba(255,255,255,0.6)', fontFamily: font, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase' }}>{submission.category}</span>
        <span style={{ fontSize: 22 * s, color: 'rgba(255,255,255,0.85)', fontFamily: font, fontStyle: 'italic' }}>{signoff ?? footerSignature}</span>
      </div>
    </div>
  )
}
